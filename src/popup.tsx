import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Settings, Globe, Key } from 'lucide-react';

const App = () => {
  const [language, setLanguage] = React.useState('es');
  const [saved, setSaved] = React.useState(false);

  const [service, setService] = React.useState('google');
  const [apiKey, setApiKey] = React.useState('');
  const [geminiKey, setGeminiKey] = React.useState('');

  React.useEffect(() => {
    chrome.storage.local.get(['targetLanguage', 'service', 'openaiApiKey', 'geminiApiKey']).then((res: any) => {
      if (res.targetLanguage) setLanguage(res.targetLanguage);
      if (res.service) setService(res.service);
      if (res.openaiApiKey) setApiKey(res.openaiApiKey);
      if (res.geminiApiKey) setGeminiKey(res.geminiApiKey);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({
      targetLanguage: language,
      service: service,
      openaiApiKey: apiKey,
      geminiApiKey: geminiKey
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <Globe className="header-icon" />
        <h1>AI Translator</h1>
      </header>
      
      <main className="popup-content">
        <div className="input-group">
          <label htmlFor="language">Target Language</label>
          <div className="input-wrapper">
            <Settings className="input-icon" size={16} />
            <select 
              id="language" 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="ko">Korean</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="ar">Arabic</option>
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
