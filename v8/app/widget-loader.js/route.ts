import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = "https://platform-talksell.ir"

  const script = `
(function() {
'use strict';

// Prevent duplicate loading
if (window.ChatbotWidgetLoaded) {
  console.log("⚠️ [Widget] Widget script already loaded. Aborting.");
  return;
}
window.ChatbotWidgetLoaded = true;

const BASE_URL = "${baseUrl}";
let widget = {
  container: null,
  button: null,
  iframe: null,
  welcomeNotification: null,
  selectionNotification: null,
  isOpen: false,
  isLoading: false,
  selectedText: "",
  config: {
    id: null,
    position: 'bottom-right',
    marginX: '20',
    marginY: '20',
    primaryColor: '#1068da',
    chatIcon: '💬',
    welcomeMessage: 'سلام 👋 من هوش مصنوعی تاکسل هستم، تهیه شده برای کسب کار شما ، چطور می‌توانم به شما کمک کنم؟',
    hasImageIcon: false
  },
  isFrozen: false,
  frozenMessage: ""
};

// Utility functions
function log(msg, data) {
  console.log(\`[Widget] \${msg}\`, data || '');
}

function isImageIcon(icon) {
  return icon && (icon.startsWith('http') || icon.startsWith('/uploads/'));
}

// Create and inject styles
function createStyles() {
  if (document.getElementById('chatbot-widget-styles')) return;

  const style = document.createElement('style');
  style.id = 'chatbot-widget-styles';
  style.textContent = \`
    @import url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css");
    
    .chatbot-widget-container {
      position: fixed !important;
      z-index: 2147483647 !important;
      font-family: "Vazirmatn", "Vazir", "Tahoma", "Arial", sans-serif !important;
      direction: ltr !important;
      pointer-events: none !important;
    }
    
    .chatbot-widget-container * {
      font-family: "Vazirmatn", "Vazir", "Tahoma", "Arial", sans-serif !important;
      box-sizing: border-box !important;
    }
    
    .chatbot-widget-button {
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      background: \${widget.config.primaryColor};
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      outline: none !important;
      pointer-events: auto !important;
      position: relative !important;
      overflow: visible !important;
    }

    .chatbot-widget-button:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }
    
    .chatbot-icon {
      transition: transform 0.3s ease, opacity 0.3s ease;
      font-size: 28px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chatbot-icon img {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50%;
    }

    .chatbot-widget-button.is-open .chatbot-icon {
      transform: rotate(180deg);
      font-size: 32px;
    }

    .chatbot-widget-notification {
      position: absolute;
      bottom: 75px;
      right: 0;
      width: 280px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(15px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      direction: rtl;
      overflow: hidden;
    }

    .chatbot-widget-notification.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    /* Selection notification styles */
    .chatbot-selection-notification {
      position: absolute;
      bottom: 75px;
      right: 0;
      width: 280px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      direction: rtl;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid \${widget.config.primaryColor};
    }

    .chatbot-selection-notification.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .chatbot-selection-notification:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
    }

    .selection-notification-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selection-notification-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: \${widget.config.primaryColor};
    }

    .selection-notification-body {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #374151;
      line-height: 1.5;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }
    
    .notification-content {
      padding: 0;
      cursor: default;
    }

    .notification-hero-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
      border-radius: 16px 16px 0 0;
    }

    .notification-body {
      padding: 12px 16px;
      text-align: center;
    }

    .notification-text {
      font-size: 13px;
      color: #374151;
      line-height: 1.5;
      margin-bottom: 12px;
      font-weight: 400;
    }

    .notification-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .notification-btn {
      flex: 1;
      padding: 10px 12px;
      border-radius: 10px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: "Vazirmatn", sans-serif;
    }

    .notification-btn-primary {
      background: \${widget.config.primaryColor};
      color: white;
    }

    .notification-btn-primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .notification-btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .notification-btn-secondary:hover {
      background: #d1d5db;
    }
    
    .notification-close-btn {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background-color: rgba(255, 255, 255, 0.9);
      color: #1f2937;
      font-size: 20px;
      line-height: 1;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .notification-close-btn:hover {
      background-color: #ffffff;
      transform: scale(1.1);
    }

    .chatbot-widget-container .chatbot-widget-iframe {
      position: absolute !important;
      width: 400px !important;
      height: 600px !important;
      min-width: 400px !important;
      min-height: 600px !important;
      bottom: 75px !important;
      right: 0 !important;
      border: none !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
      background: white !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transform-origin: bottom right !important;
      transform: scale(0.9) translateY(10px) !important;
      transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1) !important;
      pointer-events: none !important;
      overflow: hidden !important;
    }
    
    .chatbot-widget-container .chatbot-widget-iframe.open {
      opacity: 1 !important;
      visibility: visible !important;
      transform: scale(1) translateY(0) !important;
      pointer-events: auto !important;
    }
    
    .position-bottom-right {
      bottom: var(--margin-y, 20px) !important;
      right: var(--margin-x, 20px) !important;
    }
    
    .position-bottom-left {
      bottom: var(--margin-y, 20px) !important;
      left: var(--margin-x, 20px) !important;
    }
    
    .position-top-right {
      top: var(--margin-y, 20px) !important;
      right: var(--margin-x, 20px) !important;
    }
    
    .position-top-left {
      top: var(--margin-y, 20px) !important;
      left: var(--margin-x, 20px) !important;
    }
    
    @media (max-width: 480px) {
      .chatbot-widget-container {
        width: 100%;
        height: 100%;
        top: 0 !important;
        left: 0 !important;
        bottom: auto !important;
        right: auto !important;
      }
      .chatbot-widget-container .chatbot-widget-iframe {
        width: 100vw !important;
        height: 100vh !important;
        min-width: 100vw !important;
        min-height: 100vh !important;
        border-radius: 0 !important;
        top: 0 !important;
        left: 0 !important;
        bottom: auto !important;
        right: auto !important;
        transform: translateY(100%) !important;
        transition: transform 0.4s cubic-bezier(0.33, 1, 0.68, 1) !important;
      }
      .chatbot-widget-container .chatbot-widget-iframe.open {
        transform: translateY(0) !important;
      }
      .chatbot-widget-button {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1) !important;
      }
      .chatbot-widget-button.is-open {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: scale(0.8) !important;
      }
      .chatbot-widget-notification {
        position: fixed !important;
        bottom: 95px !important;
        right: 20px !important;
        width: calc(100vw - 40px) !important;
        max-width: 280px !important;
      }
      .chatbot-selection-notification {
        position: fixed !important;
        bottom: 95px !important;
        right: 20px !important;
        width: calc(100vw - 40px) !important;
        max-width: 280px !important;
      }
    }
  \`;

  document.head.appendChild(style);
  log("✅ Styles injected");
}

function createSelectionNotification() {
  widget.selectionNotification = document.createElement("div");
  widget.selectionNotification.className = "chatbot-selection-notification";
  widget.selectionNotification.innerHTML = \`
    <div class="selection-notification-content">
      <div class="selection-notification-header">
        <span class="selection-ai-icon">🤖</span>
        <span class="selection-ai-title">از هوش مصنوعی بپرس</span>
      </div>
      <div class="selection-notification-body">
        <span class="selection-label">درباره</span>
        <span id="selection-word-preview" class="selection-word-preview"></span>
      </div>
      <span id="selection-text-preview" style="display:none;"></span>
    </div>
  \`;

  widget.selectionNotification.addEventListener("click", (e) => {
    e.stopPropagation();
    const textPreview = widget.selectionNotification.querySelector("#selection-text-preview");
    const selectedText = textPreview ? textPreview.textContent : widget.selectedText;

    if (!selectedText) {
      log("⚠️ No selected text found");
      return;
    }

    log("🖱️ Selection notification clicked, sending text:", selectedText);

    if (!widget.isOpen) {
      openWidget();
    }

    setTimeout(() => {
      if (widget.iframe && widget.iframe.contentWindow) {
        widget.iframe.contentWindow.postMessage({
          type: "USER_TEXT_SELECTION",
          payload: {
            text: selectedText,
            source: "website",
            action: "populate_input"
          }
        }, "*");
        log("✅ Text selection sent to chatbot for input population:", selectedText);
      }
    }, widget.isOpen ? 100 : 500);

    hideSelectionNotification();
    window.getSelection().removeAllRanges();
  });
}

function showSelectionNotification(text) {
  if (!text || text.length < 2) return;

  const preview = widget.selectionNotification.querySelector("#selection-word-preview");
  const hiddenPreview = widget.selectionNotification.querySelector("#selection-text-preview");

  if (preview) {
    const displayText = text.length > 30 ? text.substring(0, 30) + "..." : text;
    preview.textContent = '"' + displayText + '"';
  }
  if (hiddenPreview) {
    hiddenPreview.textContent = text;
  }

  widget.selectedText = text;
  widget.selectionNotification.classList.add("show");
  widget.welcomeNotification.classList.remove("show");
}

function hideSelectionNotification() {
  widget.selectionNotification.classList.remove("show");
}

function setupTextSelectionListener() {
  let selectionTimeout = null;

  document.addEventListener("mouseup", (e) => {
    if (widget.container && widget.container.contains(e.target)) return;

    if (selectionTimeout) clearTimeout(selectionTimeout);

    selectionTimeout = setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString().trim() : "";

      if (selectedText && selectedText.length >= 2) {
        log("📝 Text selected:", selectedText);
        showSelectionNotification(selectedText);
      } else {
        hideSelectionNotification();
      }
    }, 200);
  });

  document.addEventListener("mousedown", (e) => {
    if (widget.selectionNotification && !widget.selectionNotification.contains(e.target)) {
      hideSelectionNotification();
    }
  });
}

function createWidget() {
  log("🏗️ Creating widget elements...");

  const existing = document.querySelector('.chatbot-widget-container');
  if (existing) existing.remove();

  widget.container = document.createElement('div');
  widget.container.className = \`chatbot-widget-container position-\${widget.config.position}\`;
  widget.container.style.setProperty('--margin-x', \`\${widget.config.marginX}px\`);
  widget.container.style.setProperty('--margin-y', \`\${widget.config.marginY}px\`);

  widget.welcomeNotification = document.createElement('div');
  widget.welcomeNotification.className = 'chatbot-widget-notification';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'notification-close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.welcomeNotification.classList.remove('show');
    log("🖱️ Notification closed via 'X' button.");
  });

  const content = document.createElement('div');
  content.className = 'notification-content';
  content.innerHTML = \`
    <img src="https://talksell.ir/wp-content/uploads/2025/11/h.png" alt="Welcome" class="notification-hero-image" />
    <div class="notification-body">
      <div class="notification-text">\${widget.config.welcomeMessage}</div>
      <div class="notification-buttons">
        <button class="notification-btn notification-btn-secondary" id="notification-browse-btn">در حال گردشم</button>
        <button class="notification-btn notification-btn-primary" id="notification-start-btn">شروع چت</button>
      </div>
    </div>
  \`;

  widget.welcomeNotification.appendChild(closeBtn);
  widget.welcomeNotification.appendChild(content);

  setTimeout(() => {
    const startBtn = content.querySelector('#notification-start-btn');
    const browseBtn = content.querySelector('#notification-browse-btn');

    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        log("🖱️ Start chat button clicked");
        openWidget();
      });
    }

    if (browseBtn) {
      browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        log("🖱️ Browse button clicked");
        widget.welcomeNotification.classList.remove('show');
      });
    }
  }, 100);

  log("✅ Welcome notification created.");

  // Create selection notification
  createSelectionNotification();

  widget.button = document.createElement('button');
  widget.button.className = 'chatbot-widget-button';
  widget.button.style.background = widget.config.primaryColor;
  const iconSpan = document.createElement('span');
  iconSpan.className = 'chatbot-icon';
  iconSpan.innerHTML = widget.config.chatIcon;
  widget.button.appendChild(iconSpan);
  widget.button.addEventListener('click', toggleWidget);

  widget.iframe = document.createElement('iframe');
  widget.iframe.className = 'chatbot-widget-iframe';
  widget.iframe.src = \`\${BASE_URL}/widget/\${widget.config.id}\`;
  widget.iframe.allow = 'microphone';
  widget.iframe.title = 'Chatbot';

  widget.container.appendChild(widget.iframe);
  widget.container.appendChild(widget.welcomeNotification);
  widget.container.appendChild(widget.selectionNotification);
  widget.container.appendChild(widget.button);
  document.body.appendChild(widget.container);

  window.addEventListener('message', handleMessage);

  // Setup text selection listener
  setupTextSelectionListener();

  setTimeout(() => {
    if (!widget.isOpen) {
      widget.welcomeNotification.classList.add('show');
    }
  }, 2000);

  log("✅ Widget elements created and assembled.");
}

function handleMessage(event) {
    if (event.data && (event.data.type === 'orion-chatbot-close' || event.data === 'close-widget')) {
        log("🔒 Received close command from iframe.");
        closeWidget();
    }
}

function toggleWidget(e) {
  if (e) e.stopPropagation();
  if (widget.isLoading) return;
  widget.isOpen ? closeWidget() : openWidget();
}

function openWidget() {
  if (widget.isOpen) return;
  log("🔓 Opening widget");
  widget.isLoading = true;

  widget.welcomeNotification.classList.remove('show');
  widget.selectionNotification.classList.remove('show');
  widget.iframe.classList.add('open');
  
  widget.button.classList.add('is-open');
  widget.button.querySelector('.chatbot-icon').innerHTML = '×';
  
  setTimeout(() => {
    widget.isOpen = true;
    widget.isLoading = false;
    log("✅ Widget opened");
  }, 100);
}

function closeWidget() {
  if (!widget.isOpen) return;
  log("🔒 Closing widget");
  widget.isLoading = true;

  widget.iframe.classList.remove('open');
  
  widget.button.classList.remove('is-open');
  const iconSpan = widget.button.querySelector('.chatbot-icon');
  iconSpan.innerHTML = widget.config.chatIcon;
  
  setTimeout(() => {
    widget.isOpen = false;
    widget.isLoading = false;
    log("✅ Widget closed");
  }, 200);
}

async function checkChatbotStatus() {
  try {
    log("🔍 Checking chatbot subscription status...");
    const response = await fetch(\`\${BASE_URL}/api/widget/\${widget.config.id}/check-status\`);

    if (response.ok) {
      const data = await response.json();
      log("📊 Status response:", data);

      if (data.shouldFreeze) {
        log("❄️ Chatbot frozen:", data.freezeMessage);
        widget.frozenMessage = data.freezeMessage || "چت‌بات موقتاً غیرفعال است.";
        widget.isFrozen = true;
      } else {
        widget.isFrozen = false;
        widget.frozenMessage = "";
      }
    }
    // Always return true - widget always shows
    return true;
  } catch (err) {
    log("⚠️ Error checking status (widget will still show):", err);
    // On error, allow widget to work
    widget.isFrozen = false;
    return true;
  }
}

async function fetchChatbotData() {
  try {
    log("📡 Fetching chatbot data...");
    const response = await fetch(\`\${BASE_URL}/api/chatbots/\${widget.config.id}?v=\${Date.now()}\`);
    
    if (response.ok) {
      const data = await response.json();
      log("📊 Data received:", data.name);
      
      widget.config.primaryColor = data.primary_color || '#1068da';
      log(\`🎨 Theme color applied: \${widget.config.primaryColor}\`);
      
      if (data.chat_icon) {
        widget.config.chatIcon = data.chat_icon;
      }
      
      if (data.welcome_message) {
        widget.config.welcomeMessage = data.welcome_message;
      }

      widget.button.style.background = widget.config.primaryColor;
      widget.button.querySelector('.chatbot-icon').innerHTML = widget.config.chatIcon;

      const notificationText = widget.welcomeNotification.querySelector('.notification-text');
      if (notificationText) {
        notificationText.innerHTML = widget.config.welcomeMessage;
      }

      const primaryBtn = widget.welcomeNotification.querySelector('.notification-btn-primary');
      if (primaryBtn) {
        primaryBtn.style.background = widget.config.primaryColor;
      }
    } else {
      log("⚠️ Failed to fetch chatbot data, using defaults.");
    }
  } catch (err) {
    log("❌ Error fetching data:", err);
  }
}

async function init(options = {}) {
  log("🔧 Initializing widget with options:", options);

  if (!options.id) {
    console.error("❌ [Widget] No chatbot ID provided. Aborting.");
    return;
  }
  widget.config.id = options.id;
  widget.config.position = options.position || 'bottom-right';
  widget.config.marginX = options.marginX || '20';
  widget.config.marginY = options.marginY || '20';
  widget.config.primaryColor = options.primaryColor || '#1068da';

  createStyles();
  createWidget();

  await checkChatbotStatus();
  await fetchChatbotData();

  log("✅ Widget initialized successfully");
}

function autoInit() {
  log("🔍 Auto-detecting configuration...");
  const scriptTag = document.querySelector('script[data-chatbot-id]');
  
  if (scriptTag && scriptTag.dataset.chatbotId) {
    log(\`🎯 Launcher found for chatbot ID: \${scriptTag.dataset.chatbotId}\`);
    init({
      id: scriptTag.dataset.chatbotId,
      position: scriptTag.dataset.position || 'bottom-right',
      marginX: scriptTag.dataset.marginX || '20',
      marginY: scriptTag.dataset.marginY || '20',
      primaryColor: scriptTag.dataset.primaryColor || '#1068da',
    });
  } else {
    log("ℹ️ No config found. Waiting for manual init via window.ChatbotWidget.init()");
  }
}

window.ChatbotWidget = { init };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

})();
`

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
