import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Settings, Globe, Key, Plus, Trash2 } from 'lucide-react';

type TranslationOverride = {
  source: string;
  translation: string;
  language: string;
};

const LANGUAGES = [
  { code: 'af', name: 'Afrikaans' }, { code: 'sq', name: 'Albanian' }, { code: 'am', name: 'Amharic' },
  { code: 'ar', name: 'Arabic' }, { code: 'hy', name: 'Armenian' }, { code: 'az', name: 'Azerbaijani' },
  { code: 'eu', name: 'Basque' }, { code: 'be', name: 'Belarusian' }, { code: 'bn', name: 'Bengali' },
  { code: 'bs', name: 'Bosnian' }, { code: 'bg', name: 'Bulgarian' }, { code: 'my', name: 'Burmese' },
  { code: 'ca', name: 'Catalan' }, { code: 'ceb', name: 'Cebuano' }, { code: 'ny', name: 'Chichewa' },
  { code: 'zh', name: 'Chinese (Simplified)' }, { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'co', name: 'Corsican' }, { code: 'hr', name: 'Croatian' }, { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' }, { code: 'nl', name: 'Dutch' }, { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' }, { code: 'et', name: 'Estonian' }, { code: 'tl', name: 'Filipino' },
  { code: 'fi', name: 'Finnish' }, { code: 'fr', name: 'French' }, { code: 'fy', name: 'Frisian' },
  { code: 'gl', name: 'Galician' }, { code: 'ka', name: 'Georgian' }, { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' }, { code: 'gu', name: 'Gujarati' }, { code: 'ht', name: 'Haitian Creole' },
  { code: 'ha', name: 'Hausa' }, { code: 'haw', name: 'Hawaiian' }, { code: 'iw', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' }, { code: 'hmn', name: 'Hmong' }, { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' }, { code: 'ig', name: 'Igbo' }, { code: 'id', name: 'Indonesian' },
  { code: 'ga', name: 'Irish' }, { code: 'it', name: 'Italian' }, { code: 'ja', name: 'Japanese' },
  { code: 'jw', name: 'Javanese' }, { code: 'kn', name: 'Kannada' }, { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' }, { code: 'rw', name: 'Kinyarwanda' }, { code: 'ko', name: 'Korean' },
  { code: 'ku', name: 'Kurdish (Kurmanji)' }, { code: 'ky', name: 'Kyrgyz' }, { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' }, { code: 'lv', name: 'Latvian' }, { code: 'lt', name: 'Lithuanian' },
  { code: 'lb', name: 'Luxembourgish' }, { code: 'mk', name: 'Macedonian' }, { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Malay' }, { code: 'ml', name: 'Malayalam' }, { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' }, { code: 'mr', name: 'Marathi' }, { code: 'mn', name: 'Mongolian' },
  { code: 'ne', name: 'Nepali' }, { code: 'no', name: 'Norwegian' }, { code: 'or', name: 'Odia (Oriya)' },
  { code: 'ps', name: 'Pashto' }, { code: 'fa', name: 'Persian' }, { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' }, { code: 'pa', name: 'Punjabi' }, { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' }, { code: 'sm', name: 'Samoan' }, { code: 'gd', name: 'Scots Gaelic' },
  { code: 'sr', name: 'Serbian' }, { code: 'st', name: 'Sesotho' }, { code: 'sn', name: 'Shona' },
  { code: 'sd', name: 'Sindhi' }, { code: 'si', name: 'Sinhala' }, { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' }, { code: 'so', name: 'Somali' }, { code: 'es', name: 'Spanish' },
  { code: 'su', name: 'Sundanese' }, { code: 'sw', name: 'Swahili' }, { code: 'sv', name: 'Swedish' },
  { code: 'tg', name: 'Tajik' }, { code: 'ta', name: 'Tamil' }, { code: 'tt', name: 'Tatar' },
  { code: 'te', name: 'Telugu' }, { code: 'th', name: 'Thai' }, { code: 'tr', name: 'Turkish' },
  { code: 'tk', name: 'Turkmen' }, { code: 'uk', name: 'Ukrainian' }, { code: 'ur', name: 'Urdu' },
  { code: 'ug', name: 'Uyghur' }, { code: 'uz', name: 'Uzbek' }, { code: 'vi', name: 'Vietnamese' },
  { code: 'cy', name: 'Welsh' }, { code: 'xh', name: 'Xhosa' }, { code: 'yi', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' }, { code: 'zu', name: 'Zulu' }
];

const App = () => {
  const [language, setLanguage] = React.useState('es');
  const [explainLanguage, setExplainLanguage] = React.useState('en');
  const [saved, setSaved] = React.useState(false);

  const [service, setService] = React.useState('google');
  const [apiKey, setApiKey] = React.useState('');
  const [geminiKey, setGeminiKey] = React.useState('');
  const [nvidiaKey, setNvidiaKey] = React.useState('');
  const [nvidiaModel, setNvidiaModel] = React.useState('meta/llama-3.3-70b-instruct');
  const [overrides, setOverrides] = React.useState<TranslationOverride[]>([]);
  const [overrideSource, setOverrideSource] = React.useState('');
  const [overrideTranslation, setOverrideTranslation] = React.useState('');
  const [overrideLanguage, setOverrideLanguage] = React.useState('ja');

  React.useEffect(() => {
    chrome.storage.local.get(['targetLanguage', 'explainLanguage', 'service', 'openaiApiKey', 'geminiApiKey', 'nvidiaApiKey', 'nvidiaModel', 'translationOverrides']).then((res: any) => {
      if (res.targetLanguage) setLanguage(res.targetLanguage);
      if (res.explainLanguage) setExplainLanguage(res.explainLanguage);
      if (res.service) setService(res.service);
      if (res.openaiApiKey) setApiKey(res.openaiApiKey);
      if (res.geminiApiKey) setGeminiKey(res.geminiApiKey);
      if (res.nvidiaApiKey) setNvidiaKey(res.nvidiaApiKey);
      if (res.nvidiaModel) setNvidiaModel(res.nvidiaModel);
      if (res.translationOverrides) setOverrides(res.translationOverrides);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({
      targetLanguage: language,
      explainLanguage: explainLanguage,
      service: service,
      openaiApiKey: apiKey,
      geminiApiKey: geminiKey,
      nvidiaApiKey: nvidiaKey,
      nvidiaModel: nvidiaModel,
      translationOverrides: overrides
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const addOverride = () => {
    const source = overrideSource.trim();
    const translation = overrideTranslation.trim();
    if (!source || !translation) return;

    setOverrides(prev => {
      const filtered = prev.filter(
        o => !(o.source.trim().toLowerCase() === source.toLowerCase() && o.language === overrideLanguage)
      );
      return [...filtered, { source, translation, language: overrideLanguage }];
    });
    setOverrideSource('');
    setOverrideTranslation('');
  };

  const removeOverride = (index: number) => {
    setOverrides(prev => prev.filter((_, i) => i !== index));
  };

  const languageName = (code: string) => LANGUAGES.find(l => l.code === code)?.name || code;

  return (
    <div className="popup-container">
      <header className="popup-header">
        <Globe className="header-icon" />
        <h1>AI Translator</h1>
      </header>
      
      <main className="popup-content">
        <div className="input-group">
          <label htmlFor="language">Target Language (Translation)</label>
          <div className="input-wrapper">
            <Settings className="input-icon" size={16} />
            <select 
              id="language" 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="explainLanguage">Explanation Language</label>
          <div className="input-wrapper">
            <Settings className="input-icon" size={16} />
            <select 
              id="explainLanguage" 
              value={explainLanguage} 
              onChange={(e) => setExplainLanguage(e.target.value)}
              className="language-select"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="service">AI Service</label>
          <div className="input-wrapper">
            <Globe className="input-icon" size={16} />
            <select 
              id="service" 
              value={service} 
              onChange={(e) => setService(e.target.value)}
            >
              <option value="google">Google Translate (Free)</option>
              <option value="openai">OpenAI (Requires API Key)</option>
              <option value="gemini">Google Gemini (Requires API Key)</option>
              <option value="nvidia">NVIDIA NIM (Requires API Key)</option>
            </select>
          </div>
        </div>

        {service === 'openai' && (
          <div className="input-group">
            <label htmlFor="apiKey">OpenAI API Key</label>
            <div className="input-wrapper">
              <Key className="input-icon" size={16} />
              <input 
                id="apiKey" 
                type="password" 
                placeholder="sk-..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <p className="help-text">Your API key is stored securely in your browser's local storage.</p>
          </div>
        )}

        {service === 'gemini' && (
          <div className="input-group">
            <label htmlFor="geminiKey">Gemini API Key</label>
            <div className="input-wrapper">
              <Key className="input-icon" size={16} />
              <input 
                id="geminiKey" 
                type="password" 
                placeholder="AIzaSy..." 
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
            </div>
            <p className="help-text">Your API key is stored securely in your browser's local storage.</p>
          </div>
        )}

        {service === 'nvidia' && (
          <>
            <div className="input-group">
              <label htmlFor="nvidiaKey">NVIDIA API Key</label>
              <div className="input-wrapper">
                <Key className="input-icon" size={16} />
                <input 
                  id="nvidiaKey" 
                  type="password" 
                  placeholder="nvapi-..." 
                  value={nvidiaKey}
                  onChange={(e) => setNvidiaKey(e.target.value)}
                />
              </div>
              <p className="help-text">Get your API key from <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer">build.nvidia.com</a>. Stored locally in your browser.</p>
            </div>

            <div className="input-group">
              <label htmlFor="nvidiaModel">NVIDIA Model</label>
              <div className="input-wrapper">
                <Globe className="input-icon" size={16} />
                <select
                  id="nvidiaModel"
                  value={nvidiaModel}
                  onChange={(e) => setNvidiaModel(e.target.value)}
                >
                  <option value="nvidia/riva-translate-4b-instruct-v1.1">Riva Translate 4B Instruct</option>
                  <option value="meta/llama-3.3-70b-instruct">Llama 3.3 70B Instruct</option>
                  <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B Instruct</option>
                  <option value="meta/llama-3.1-70b-instruct">Llama 3.1 70B Instruct</option>
                  <option value="meta/llama-3.1-405b-instruct">Llama 3.1 405B Instruct</option>
                  <option value="nvidia/llama-3.1-nemotron-70b-instruct">Nemotron 70B Instruct</option>
                  <option value="nvidia/nvidia-nemotron-nano-9b-v2">Nemotron Nano 9B v2</option>
                  <option value="mistralai/mistral-7b-instruct-v0.3">Mistral 7B Instruct</option>
                  <option value="mistralai/mixtral-8x22b-instruct-v0.1">Mixtral 8x22B Instruct</option>
                  <option value="qwen/qwen2.5-7b-instruct">Qwen 2.5 7B Instruct</option>
                  <option value="deepseek-ai/deepseek-r1">DeepSeek R1</option>
                  <option value="openai/gpt-oss-120b">GPT-OSS 120B</option>
                  <option value="openai/gpt-oss-20b">GPT-OSS 20B</option>
                </select>
              </div>
              <p className="help-text">Browse all models at <a href="https://build.nvidia.com/models" target="_blank" rel="noopener noreferrer">build.nvidia.com/models</a>.</p>
            </div>
          </>
        )}

        <div className="input-group overrides-section">
          <label>Custom Translations</label>
          <p className="help-text">When selected text matches exactly, use your custom translation instead of the AI.</p>

          <input
            className="override-input"
            type="text"
            placeholder="Original phrase, e.g. thank you for your hard work"
            value={overrideSource}
            onChange={(e) => setOverrideSource(e.target.value)}
          />
          <div className="override-row">
            <select
              className="override-select"
              value={overrideLanguage}
              onChange={(e) => setOverrideLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <input
              className="override-input"
              type="text"
              placeholder="Custom translation, e.g. お疲れ様です!"
              value={overrideTranslation}
              onChange={(e) => setOverrideTranslation(e.target.value)}
            />
          </div>
          <button type="button" className="add-override-button" onClick={addOverride}>
            <Plus size={14} />
            Add override
          </button>

          {overrides.length > 0 && (
            <ul className="override-list">
              {overrides.map((override, index) => (
                <li key={`${override.language}-${override.source}-${index}`} className="override-item">
                  <div className="override-item-text">
                    <span className="override-source">"{override.source}"</span>
                    <span className="override-arrow">→ {languageName(override.language)} →</span>
                    <span className="override-translation">"{override.translation}"</span>
                  </div>
                  <button
                    type="button"
                    className="override-remove"
                    onClick={() => removeOverride(index)}
                    aria-label="Remove override"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="save-button" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
