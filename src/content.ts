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
    <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 8l6 6"/>
      <path d="M4 14l6-6 2-3"/>
      <path d="M2 5h12"/>
      <path d="M7 2h1"/>
      <path d="M22 22l-5-10-5 10"/>
      <path d="M14 18h6"/>
    </svg>
    <div class="ai-spinner"></div>
    <span class="ai-text">Translate</span>
  `;
  
  document.body.appendChild(translateBtn);
  
  translateBtn.addEventListener('mousedown', (e) => {
    // Prevent mouse down to clear selection
    e.preventDefault();
    e.stopPropagation();
  });
  
  translateBtn.addEventListener('click', handleTranslateClick);
  
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
  btn.querySelector('.ai-text')!.textContent = 'Translate';
  
  // Position the button slightly below and right of the cursor
  btn.style.left = `${x + 10}px`;
  btn.style.top = `${y + 15}px`;
  btn.classList.add('ai-visible');
};

document.addEventListener('mouseup', (e) => {
  // If we clicked on the button itself, don't hide it
  if (e.target && (e.target as HTMLElement).closest('.ai-translate-ext-btn')) {
    return;
  }
  
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

async function handleTranslateClick(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  
  let text = '';

  // Retrieve text again (either from input/textarea or document selection)
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
  btn.querySelector('.ai-text')!.textContent = 'Translating...';
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text
    });
    
    if (response && response.success) {
      replaceSelectionWithText(response.translatedText);
      hideButton();
    } else {
      alert('Translation Error: ' + (response?.error || 'Unknown error'));
      btn.classList.remove('ai-loading');
      btn.querySelector('.ai-text')!.textContent = 'Translate';
    }
  } catch (error: any) {
    alert('Extension Error: ' + error.message);
    btn.classList.remove('ai-loading');
    btn.querySelector('.ai-text')!.textContent = 'Translate';
  }
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
