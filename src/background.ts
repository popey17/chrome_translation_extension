// background.ts

chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Translator Extension Installed");
});

type TranslationRequest = {
  action: 'translate';
  text: string;
};

chrome.runtime.onMessage.addListener((request: TranslationRequest, _sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslation(request.text)
      .then(translatedText => sendResponse({ success: true, translatedText }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Indicates asynchronous response
  }
});

async function handleTranslation(text: string): Promise<string> {
  const result = await chrome.storage.local.get(['targetLanguage']);
  const targetLanguage = result.targetLanguage || 'es';

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to communicate with Translation API');
  }

  const data = await response.json();
  
  // Google Translate API returns an array of arrays where the first element contains the translated text parts
  if (data && data[0]) {
    let translatedText = '';
    for (let part of data[0]) {
      if (part[0]) {
        translatedText += part[0];
      }
    }
    return translatedText.trim();
  }
  
  throw new Error('Unexpected API response format');
}
