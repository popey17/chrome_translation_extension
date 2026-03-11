// background.ts

chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Translator Extension Installed");
});

type TranslationRequest = {
  action: 'translate' | 'explain';
  text: string;
};

chrome.runtime.onMessage.addListener((request: TranslationRequest, _sender, sendResponse) => {
  if (request.action === 'translate' || request.action === 'explain') {
    handleAction(request)
      .then(resultText => sendResponse({ success: true, resultText }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Indicates asynchronous response
  }
});

async function handleAction(request: TranslationRequest): Promise<string> {
  const result = await chrome.storage.local.get(['targetLanguage', 'explainLanguage', 'service', 'openaiApiKey', 'geminiApiKey']);
  const service = (result.service as string) || 'google';

  if (request.action === 'translate') {
    const targetLanguage = (result.targetLanguage as string) || 'es';
    if (service === 'google') return translateWithGoogle(request.text, targetLanguage);
    if (service === 'openai') {
      if (!result.openaiApiKey) throw new Error('Please set your OpenAI API key in the popup.');
      return translateWithOpenAI(request.text, targetLanguage, result.openaiApiKey as string, 'translate');
    }
    if (service === 'gemini') {
      if (!result.geminiApiKey) throw new Error('Please set your Gemini API key in the popup.');
      return translateWithGemini(request.text, targetLanguage, result.geminiApiKey as string, 'translate');
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

async function translateWithOpenAI(text: string, lang: string, apiKey: string, mode: 'translate' | 'explain'): Promise<string> {
  const systemPrompt = mode === 'translate' 
    ? `You are a professional translator. Translate the given text to language code: ${lang}. Maintain the original tone and formatting. Return ONLY the translation, without any quotes or explanations. Preserve line breaks.`
    : `You are a helpful assistant. The following text is an instruction or task.
1. First, translate the text into language code: ${lang}. Keep the original formatting and line breaks.
2. Then, explain this instruction in simple terms.
3. Finally, provide a concise summary of what needs to be done.
Your entire response MUST be in language code: ${lang}. Use clear, readable language and separate the sections clearly.`;

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

async function translateWithGemini(text: string, lang: string, apiKey: string, mode: 'translate' | 'explain'): Promise<string> {
  const prompt = mode === 'translate'
    ? `You are a professional translator. Translate this text to language code: ${lang}. Return ONLY the translation, without any prefixes, Markdown formatting, or explanations. Preserve original line breaks exactly.\n\nText to translate:\n${text}`
    : `You are a helpful assistant. The following text is an instruction or task.
1. First, translate the text into language code: ${lang}. Keep the original formatting and line breaks.
2. Then, explain this instruction in simple terms.
3. Finally, provide a concise summary of what needs to be done.
Your entire response MUST be in language code: ${lang}. Use clear, readable language and separate the sections clearly.\n\nInstruction to process:\n${text}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
