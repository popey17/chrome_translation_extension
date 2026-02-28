import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Settings, Globe, Key } from 'lucide-react';

const App = () => {
  const [language, setLanguage] = React.useState('es');
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    chrome.storage.local.get(['targetLanguage']).then((res: any) => {
      if (res.targetLanguage) setLanguage(res.targetLanguage);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({
      targetLanguage: language
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
