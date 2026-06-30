let translateBtn: HTMLButtonElement | null = null;
let currentSelectionRange: Range | null = null;

// Create the premium CSS for the button
const injectStyles = () => {
  if (document.getElementById('ai-translator-styles')) return;
  const style = document.createElement('style');
  style.id = 'ai-translator-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=swap');
    
    .ai-translate-ext-btn {
      position: absolute;
      z-index: 2147483647; /* Max z-index */
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 8px 16px;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 
                  0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      pointer-events: none;
      backdrop-filter: blur(8px);
    }
    
    .ai-translate-ext-btn.ai-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    
    .ai-translate-ext-btn:hover {
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      transform: translateY(-2px) scale(1.02);
    }
    
    .ai-translate-ext-btn:active {
      transform: translateY(1px) scale(0.98);
    }
    
    .ai-translate-ext-btn svg {
      width: 16px;
      height: 16px;
    }
    
    .ai-translate-ext-btn.ai-loading .ai-icon {
      display: none;
    }
    
    .ai-translate-ext-btn .ai-spinner {
      display: none;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }
    
    .ai-translate-ext-btn.ai-loading .ai-spinner {
      display: block;
    }
    
    .ai-explain-box {
      position: absolute;
      z-index: 2147483647;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      padding: 20px;
      width: 320px;
      max-height: 400px;
      overflow-y: auto;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      animation: fadeInScale 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .ai-explain-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    
    .ai-explain-title {
      font-weight: 600;
      color: #4f46e5;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .ai-explain-close {
      cursor: pointer;
      color: #9ca3af;
      transition: color 0.2s;
    }
    
    .ai-explain-close:hover {
      color: #1f2937;
    }
    
    .ai-explain-content {
      font-size: 14px;
    }

    .ai-explain-content p {
      margin: 0 0 10px 0;
    }

    .ai-explain-content p:last-child {
      margin-bottom: 0;
    }

    .ai-explain-content h3,
    .ai-explain-content h4,
    .ai-explain-content h5,
    .ai-explain-content h6 {
      margin: 14px 0 6px 0;
      font-size: 13px;
      font-weight: 600;
      color: #4f46e5;
    }

    .ai-explain-content h3:first-child,
    .ai-explain-content h4:first-child {
      margin-top: 0;
    }

    .ai-explain-content ul,
    .ai-explain-content ol {
      margin: 0 0 10px 0;
      padding-left: 20px;
    }

    .ai-explain-content li {
      margin-bottom: 4px;
    }

    .ai-explain-content strong {
      font-weight: 600;
      color: #111827;
    }

    .ai-explain-content code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      background: rgba(99, 102, 241, 0.1);
      color: #4338ca;
      padding: 1px 5px;
      border-radius: 4px;
    }
    
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};

const createButton = () => {
  injectStyles();
  if (translateBtn) return translateBtn;
  
  translateBtn = document.createElement('button');
  translateBtn.className = 'ai-translate-ext-btn';
  
  // Icon and text
  translateBtn.innerHTML = `
    <div class="ai-btn-group" style="display: flex; gap: 4px;">
      <div class="ai-action-btn ai-action-translate" style="display: flex; align-items: center; gap: 6px;">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8l6 6"/>
          <path d="M4 14l6-6 2-3"/>
          <path d="M2 5h12"/>
          <path d="M7 2h1"/>
          <path d="M22 22l-5-10-5 10"/>
          <path d="M14 18h6"/>
        </svg>
        <span class="ai-text">Translate</span>
      </div>
      <div style="width: 1px; background: rgba(255,255,255,0.2); margin: 4px 2px;"></div>
      <div class="ai-action-btn ai-action-explain" style="display: flex; align-items: center; gap: 6px;">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span class="ai-text-explain">Explain</span>
      </div>
    </div>
    <div class="ai-spinner"></div>
  `;
  
  document.body.appendChild(translateBtn);
  
  translateBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  const translateAction = translateBtn.querySelector('.ai-action-translate')!;
  const explainAction = translateBtn.querySelector('.ai-action-explain')!;
  
  translateAction.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleActionClick('translate');
  });
  
  explainAction.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleActionClick('explain');
  });
  
  return translateBtn;
};

const hideButton = () => {
  if (translateBtn) {
    translateBtn.classList.remove('ai-visible');
    setTimeout(() => {
      // Force hide to prevent clicking invisible element
      if (translateBtn && !translateBtn.classList.contains('ai-visible')) {
        translateBtn.style.top = '-9999px';
        translateBtn.style.left = '-9999px';
      }
    }, 200);
  }
};

const showButton = (x: number, y: number) => {
  const btn = createButton();
  btn.classList.remove('ai-loading');
  const translateText = btn.querySelector('.ai-text')!;
  const explainText = btn.querySelector('.ai-text-explain')!;
  const btnGroup = btn.querySelector('.ai-btn-group')! as HTMLElement;
  
  translateText.textContent = 'Translate';
  explainText.textContent = 'Explain';
  btnGroup.style.display = 'flex';
  
  // Position the button slightly below and right of the cursor
  btn.style.left = `${x + 10}px`;
  btn.style.top = `${y + 15}px`;
  btn.classList.add('ai-visible');
};

document.addEventListener('mouseup', (e) => {
  // If we clicked on the button or explanation box, don't hide
  if (e.target && (e.target as HTMLElement).closest('.ai-translate-ext-btn, .ai-explain-box')) {
    return;
  }
  
  // Close any open explanation boxes
  const existingBox = document.querySelector('.ai-explain-box');
  if (existingBox) existingBox.remove();
  
  // Small delay to ensure single clicks correctly clear the selection before checking
  setTimeout(() => {
    let text = '';
    
    // Check if we are inside a textarea or input field
    const activeElement = document.activeElement as HTMLElement | null;
    const isTextInput = activeElement && (
      activeElement.tagName === 'TEXTAREA' || 
      (activeElement.tagName === 'INPUT' && (
        (activeElement as HTMLInputElement).type === 'text' ||
        (activeElement as HTMLInputElement).type === 'search'
      ))
    );

    if (isTextInput) {
      const inputEl = activeElement as HTMLInputElement | HTMLTextAreaElement;
      text = inputEl.value.substring(inputEl.selectionStart || 0, inputEl.selectionEnd || 0).trim();
    } else {
      const selection = window.getSelection();
      text = selection?.toString().trim() || '';
      if (text && text.length > 0 && selection && selection.rangeCount > 0) {
        currentSelectionRange = selection.getRangeAt(0).cloneRange();
      }
    }
    
    if (text && text.length > 0) {
      showButton(e.pageX, e.pageY);
    } else {
      hideButton();
      currentSelectionRange = null;
    }
  }, 10);
});

async function handleActionClick(action: 'translate' | 'explain') {
  let text = '';

  const activeElement = document.activeElement as HTMLElement | null;
  const isTextInput = activeElement && (
    activeElement.tagName === 'TEXTAREA' || 
    (activeElement.tagName === 'INPUT' && (
      (activeElement as HTMLInputElement).type === 'text' ||
      (activeElement as HTMLInputElement).type === 'search'
    ))
  );

  if (isTextInput) {
    const inputEl = activeElement as HTMLInputElement | HTMLTextAreaElement;
    text = inputEl.value.substring(inputEl.selectionStart || 0, inputEl.selectionEnd || 0).trim();
  } else {
    const selection = window.getSelection();
    text = selection?.toString().trim() || '';
  }
  
  if (!text) return;
  
  const btn = translateBtn!;
  btn.classList.add('ai-loading');
  (btn.querySelector('.ai-btn-group')! as HTMLElement).style.display = 'none';

  const resetButton = () => {
    btn.classList.remove('ai-loading');
    (btn.querySelector('.ai-btn-group')! as HTMLElement).style.display = 'flex';
  };

  // If the extension was reloaded/updated, this stale content script can no longer
  // reach the service worker. Detect it early and prompt a page refresh.
  if (!chrome.runtime?.id) {
    alert('The AI Translator extension was updated. Please refresh this page to continue.');
    resetButton();
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: action,
      text: text
    });
    
    if (response && response.success) {
      if (action === 'translate') {
        replaceSelectionWithText(response.resultText);
        hideButton();
      } else {
        showExplanationBox(response.resultText);
        hideButton();
      }
    } else {
      alert('Action Error: ' + (response?.error || 'Unknown error'));
      resetButton();
    }
  } catch (error: any) {
    const message = String(error?.message || error);
    if (message.includes('Extension context invalidated') || message.includes('message port closed')) {
      alert('The AI Translator extension was updated. Please refresh this page to continue.');
    } else {
      alert('Extension Error: ' + message);
    }
    resetButton();
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lightweight Markdown renderer for the explanation box. Escapes HTML first, then
// applies a safe subset of formatting (headings, bold, italic, code, lists).
function renderMarkdown(raw: string): string {
  const escaped = escapeHtml(raw.trim());
  const lines = escaped.split('\n');
  let html = '';
  let inList: 'ul' | 'ol' | null = null;

  const inline = (text: string) =>
    text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');

  const closeList = () => {
    if (inList) {
      html += `</${inList}>`;
      inList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length + 2, 6);
      html += `<h${level}>${inline(heading[2])}</h${level}>`;
      continue;
    }

    const ordered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (ordered) {
      if (inList !== 'ol') {
        closeList();
        html += '<ol>';
        inList = 'ol';
      }
      html += `<li>${inline(ordered[2])}</li>`;
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unordered) {
      if (inList !== 'ul') {
        closeList();
        html += '<ul>';
        inList = 'ul';
      }
      html += `<li>${inline(unordered[1])}</li>`;
      continue;
    }

    closeList();
    html += `<p>${inline(trimmed)}</p>`;
  }

  closeList();
  return html;
}

function showExplanationBox(content: string) {
  // Remove existing box if any
  const existingBox = document.querySelector('.ai-explain-box');
  if (existingBox) existingBox.remove();

  const box = document.createElement('div');
  box.className = 'ai-explain-box';
  
  // Position it near where the button was
  if (translateBtn) {
    box.style.left = translateBtn.style.left;
    box.style.top = translateBtn.style.top;
  }

  box.innerHTML = `
    <div class="ai-explain-header">
      <span class="ai-explain-title">Explanation</span>
      <svg class="ai-explain-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>
    <div class="ai-explain-content">${renderMarkdown(content)}</div>
  `;

  document.body.appendChild(box);

  box.querySelector('.ai-explain-close')!.addEventListener('click', () => {
    box.remove();
  });
}

function replaceSelectionWithText(newText: string) {
  // Check if we are inside a textarea or input field
  const activeElement = document.activeElement as HTMLElement | null;
  const isTextInput = activeElement && (
    activeElement.tagName === 'TEXTAREA' || 
    (activeElement.tagName === 'INPUT' && (
      (activeElement as HTMLInputElement).type === 'text' ||
      (activeElement as HTMLInputElement).type === 'search'
    ))
  );

  if (isTextInput) {
    const inputEl = activeElement as HTMLInputElement | HTMLTextAreaElement;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    
    if (start !== null && end !== null) {
      // Replace text within the input
      const currentVal = inputEl.value;
      inputEl.value = currentVal.substring(0, start) + newText + currentVal.substring(end);
      
      // Move cursor to the end of the newly inserted text
      inputEl.selectionStart = inputEl.selectionEnd = start + newText.length;
      
      // Dispatch an input event so frameworks like React pick up the change
      const event = new Event('input', { bubbles: true });
      inputEl.dispatchEvent(event);
      return;
    }
  }

  // Standard DOM node selection logic
  if (!currentSelectionRange) return;
  
  const selection = window.getSelection();
  // Ensure the selection matches our saved range
  selection?.removeAllRanges();
  selection?.addRange(currentSelectionRange);
  
  // Delete the original selection
  currentSelectionRange.deleteContents();

  // Handle line breaks in the translated text
  const textParts = newText.split('\n');
  const fragment = document.createDocumentFragment();

  textParts.forEach((part, index) => {
    if (part) {
      fragment.appendChild(document.createTextNode(part));
    }
    // Add a <br> for every newline, except after the very last part
    if (index < textParts.length - 1) {
      fragment.appendChild(document.createElement('br'));
    }
  });

  // Insert our translated text (with potential <br> tags)
  currentSelectionRange.insertNode(fragment);
  
  // Clear selection
  selection?.removeAllRanges();
  currentSelectionRange = null;
}
