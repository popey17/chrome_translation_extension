// background.ts

chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Translator Extension Installed");
});

type TranslationRequest = {
  action: 'translate' | 'explain';
  text: string;
};

type TranslationOverride = {
  source: string;
  translation: string;
  language: string;
};

function findTranslationOverride(text: string, lang: string, overrides: TranslationOverride[]): string | null {
  const normalized = text.trim().toLowerCase();
  for (const override of overrides) {
    if (override.language === lang && override.source.trim().toLowerCase() === normalized) {
      return override.translation;
    }
  }
  return null;
}

// Builds a glossary instruction to inject into AI prompts so the model honors the user's
// preferred translations while still handling wording variations and surrounding context.
function buildGlossaryInstruction(lang: string, overrides: TranslationOverride[]): string {
  const relevant = overrides.filter(o => o.language === lang && o.source.trim() && o.translation.trim());
  if (relevant.length === 0) return '';
  const lines = relevant.map(o => `- "${o.source.trim()}" → "${o.translation.trim()}"`).join('\n');
  return `\n\nPreferred translations (glossary): when the text matches or closely matches the meaning of a phrase on the left, you MUST use the exact translation on the right. Adapt surrounding wording naturally, but keep these phrases verbatim:\n${lines}`;
}

chrome.runtime.onMessage.addListener((request: TranslationRequest, _sender, sendResponse) => {
  if (request.action === 'translate' || request.action === 'explain') {
    handleAction(request)
      .then(resultText => sendResponse({ success: true, resultText }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Indicates asynchronous response
  }
});

async function handleAction(request: TranslationRequest): Promise<string> {
  const result = await chrome.storage.local.get(['targetLanguage', 'explainLanguage', 'service', 'openaiApiKey', 'geminiApiKey', 'nvidiaApiKey', 'nvidiaModel', 'translationOverrides']);
  const service = (result.service as string) || 'google';
  const nvidiaModel = (result.nvidiaModel as string) || 'meta/llama-3.3-70b-instruct';
  const overrides = (result.translationOverrides as TranslationOverride[]) || [];

  if (request.action === 'translate') {
    const targetLanguage = (result.targetLanguage as string) || 'es';
    const glossary = buildGlossaryInstruction(targetLanguage, overrides);

    if (service === 'google') {
      // Google Translate can't take instructions, so apply overrides via exact match.
      const override = findTranslationOverride(request.text, targetLanguage, overrides);
      if (override !== null) return override;
      return translateWithGoogle(request.text, targetLanguage);
    }
    if (service === 'openai') {
      if (!result.openaiApiKey) throw new Error('Please set your OpenAI API key in the popup.');
      return translateWithOpenAI(request.text, targetLanguage, result.openaiApiKey as string, 'translate', glossary);
    }
    if (service === 'gemini') {
      if (!result.geminiApiKey) throw new Error('Please set your Gemini API key in the popup.');
      return translateWithGemini(request.text, targetLanguage, result.geminiApiKey as string, 'translate', glossary);
    }
    if (service === 'nvidia') {
      if (!result.nvidiaApiKey) throw new Error('Please set your NVIDIA API key in the popup.');
      return translateWithNvidia(request.text, targetLanguage, result.nvidiaApiKey as string, 'translate', nvidiaModel, glossary, overrides);
    }
  } else if (request.action === 'explain') {
    const explainLanguage = (result.explainLanguage as string) || 'en';
    if (service === 'google') return translateWithGoogle(request.text, explainLanguage); // Google Translate just translates
    if (service === 'openai') {
      if (!result.openaiApiKey) throw new Error('Please set your OpenAI API key in the popup.');
      return translateWithOpenAI(request.text, explainLanguage, result.openaiApiKey as string, 'explain');
    }
    if (service === 'gemini') {
      if (!result.geminiApiKey) throw new Error('Please set your Gemini API key in the popup.');
      return translateWithGemini(request.text, explainLanguage, result.geminiApiKey as string, 'explain');
    }
    if (service === 'nvidia') {
      if (!result.nvidiaApiKey) throw new Error('Please set your NVIDIA API key in the popup.');
      return translateWithNvidia(request.text, explainLanguage, result.nvidiaApiKey as string, 'explain', nvidiaModel);
    }
  }
  
  throw new Error('Unknown service or action');
}

async function translateWithGoogle(text: string, lang: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to communicate with Google Translate API');
  const data = await response.json();
  
  if (data && data[0]) {
    let translatedText = '';
    for (const part of data[0]) {
      if (part[0]) translatedText += part[0];
    }
    return translatedText.trim();
  }
  throw new Error('Unexpected API response format');
}

async function translateWithOpenAI(text: string, lang: string, apiKey: string, mode: 'translate' | 'explain', glossary = ''): Promise<string> {
  const systemPrompt = (mode === 'translate' 
    ? `You are a professional translator. Translate the given text to language code: ${lang}. Maintain the original tone and formatting. Return ONLY the translation, without any quotes or explanations. Preserve line breaks.`
    : `You are a helpful assistant. The following text is an instruction or task.
1. First, translate the text into language code: ${lang}. Keep the original formatting and line breaks.
2. Then, explain this instruction in simple terms.
3. Finally, provide a concise summary of what needs to be done.
Your entire response MUST be in language code: ${lang}. Use clear, readable language and separate the sections clearly.`) + glossary;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to communicate with OpenAI API');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Riva Translate is a specialized translation-only model. Its system message must be a
// source-target language pair code (it cannot auto-detect the source), and it only
// supports an English-centric set of languages. We assume the source text is English.
const RIVA_ENGLISH_TO_TARGET: Record<string, string> = {
  zh: 'en-zh',
  'zh-TW': 'en-zh-tw',
  ar: 'en-ar',
  de: 'en-de',
  es: 'en-es',
  fr: 'en-fr',
  ja: 'en-ja',
  ko: 'en-ko',
  ru: 'en-ru',
  pt: 'en-pt'
};

async function translateWithNvidia(text: string, lang: string, apiKey: string, mode: 'translate' | 'explain', model: string, glossary = '', overrides: TranslationOverride[] = []): Promise<string> {
  const isRiva = model.includes('riva-translate');

  let messages: { role: string; content: string }[];

  if (isRiva) {
    if (mode === 'explain') {
      throw new Error('The Riva Translate model only supports translation, not explanation. Choose a different NVIDIA model for Explain.');
    }
    // Riva can't take a glossary instruction, so apply overrides via exact match first.
    const override = findTranslationOverride(text, lang, overrides);
    if (override !== null) return override;
    const pair = RIVA_ENGLISH_TO_TARGET[lang];
    if (!pair) {
      throw new Error(`Riva Translate doesn't support "${lang}" as a target. Supported targets (from English): Chinese, Traditional Chinese, Arabic, German, Spanish, French, Japanese, Korean, Russian, Portuguese.`);
    }
    messages = [
      { role: 'system', content: pair },
      { role: 'user', content: text }
    ];
  } else {
    const systemPrompt = (mode === 'translate'
      ? `You are a professional translator. Translate the given text to language code: ${lang}. Maintain the original tone and formatting. Return ONLY the translation, without any quotes or explanations. Preserve line breaks.`
      : `You are a helpful assistant. The following text is an instruction or task.
1. First, translate the text into language code: ${lang}. Keep the original formatting and line breaks.
2. Then, explain this instruction in simple terms.
3. Finally, provide a concise summary of what needs to be done.
Your entire response MUST be in language code: ${lang}. Use clear, readable language and separate the sections clearly.`) + glossary;
    messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];
  }

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.3,
      max_tokens: 4096,
      stream: false
    })
  });

  const raw = await response.text();

  if (!response.ok) {
    let message = 'Failed to communicate with NVIDIA NIM API';
    try {
      const errorData = JSON.parse(raw);
      message = errorData.error?.message || errorData.detail || message;
    } catch {
      if (raw) message = raw;
    }
    throw new Error(message);
  }

  const data = parseNvidiaBody(raw);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Unexpected response structure from NVIDIA NIM API');
  }
  return content.trim();
}

// The hosted endpoint may return either a plain JSON object or a server-sent-events
// stream (lines prefixed with "data: "). This parses both into a single completion object.
function parseNvidiaBody(raw: string): any {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall back to SSE: stitch together the streamed delta chunks.
    let content = '';
    let template: any = null;
    for (const line of trimmed.split('\n')) {
      const cleaned = line.trim();
      if (!cleaned.startsWith('data:')) continue;
      const payload = cleaned.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const chunk = JSON.parse(payload);
        if (!template) template = chunk;
        const delta = chunk?.choices?.[0]?.delta?.content ?? chunk?.choices?.[0]?.message?.content;
        if (typeof delta === 'string') content += delta;
      } catch {
        // ignore malformed chunk lines
      }
    }
    if (template) {
      return { choices: [{ message: { content } }] };
    }
    throw new Error('Could not parse NVIDIA NIM API response');
  }
}

async function translateWithGemini(text: string, lang: string, apiKey: string, mode: 'translate' | 'explain', glossary = ''): Promise<string> {
  const prompt = mode === 'translate'
    ? `You are a professional translator. Translate this text to language code: ${lang}. Return ONLY the translation, without any prefixes, Markdown formatting, or explanations. Preserve original line breaks exactly.${glossary}\n\nText to translate:\n${text}`
    : `You are a helpful assistant. The following text is an instruction or task.
1. First, translate the text into language code: ${lang}. Keep the original formatting and line breaks.
2. Then, explain this instruction in simple terms.
3. Finally, provide a concise summary of what needs to be done.
Your entire response MUST be in language code: ${lang}. Use clear, readable language and separate the sections clearly.${glossary}\n\nInstruction to process:\n${text}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to communicate with Gemini API');
  }

  const data = await response.json();
  if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error('Unexpected response structure from Gemini API');
}
