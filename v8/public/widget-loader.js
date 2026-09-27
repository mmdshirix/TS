;(() => {
  // Prevent duplicate loading
  if (window.ChatbotWidgetLoaded) {
    console.log("⚠️ [Widget] Widget script already loaded. Aborting.")
    return
  }
  window.ChatbotWidgetLoaded = true

  const BASE_URL = "https://platform-talksell.ir"
  const widget = {
    container: null,
    button: null,
    iframe: null,
    welcomeNotification: null,
    selectionNotification: null,
    isOpen: false,
    isLoading: false,
    iframeLoaded: false, // Track if iframe has loaded content
    selectedText: "",
    config: {
      id: null,
      position: "bottom-right",
      marginX: "20",
      marginY: "20",
      primaryColor: "#1068da",
      chatIcon: "💬",
      welcomeMessage: "سلام 👋 من هوش مصنوعی تاکسل هستم، تهیه شده برای کسب کار شما ، چطور می‌توانم به شما کمک کنم؟",
      hasImageIcon: false,
    },
    isFrozen: false,
    frozenMessage: "",
  }

  // Utility functions
  function log(msg, data) {
    console.log(`[Widget] ${msg}`, data || "")
  }

  // Create and inject styles
  function createStyles() {
    if (document.getElementById("chatbot-widget-styles")) return

    const style = document.createElement("style")
    style.id = "chatbot-widget-styles"
    style.textContent = `
    @import url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css");
    
    .chatbot-widget-container {
      position: fixed !important;
      z-index: 2147483647 !important;
      font-family: "Vazirmatn", "Vazir", "Tahoma", "Arial", sans-serif !important;
      direction: ltr !important;
      pointer-events: none !important;
      overflow: visible !important;
      display: block !important;
    }
    
    .chatbot-widget-container * {
      font-family: "Vazirmatn", "Vazir", "Tahoma", "Arial", sans-serif !important;
      box-sizing: border-box !important;
    }
    
    /* Ensure iframe can render content */
    .chatbot-widget-container .chatbot-widget-iframe {
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      transform-style: preserve-3d !important;
    }
    
    /* Launcher Button Styles */
    .chatbot-widget-button {
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      background: ${widget.config.primaryColor};
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

    /* Welcome Notification Styles */
    .chatbot-widget-notification {
      position: absolute;
      bottom: 75px;
      right: 0;
      width: 360px;
      background: white;
      border-radius: 20px;
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
      border: 2px solid ${widget.config.primaryColor};
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
      color: ${widget.config.primaryColor};
    }

    .selection-notification-header-icon {
      font-size: 18px;
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
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      font-weight: 500;
    }

    .selection-notification-footer {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }
    
    /* Updated notification content to match new card design */
    .notification-content {
      padding: 0;
      cursor: default;
    }

    .notification-hero-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
      border-radius: 20px 20px 0 0;
    }

    .notification-body {
      padding: 20px;
      text-align: center;
    }

    .notification-text {
      font-size: 16px;
      color: #374151;
      line-height: 1.7;
      margin-bottom: 20px;
      font-weight: 400;
    }

    .notification-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .notification-btn {
      flex: 1;
      padding: 14px 20px;
      border-radius: 12px;
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: "Vazirmatn", sans-serif;
    }

    .notification-btn-primary {
      background: #2563eb;
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
      top: 12px;
      left: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background-color: rgba(255, 255, 255, 0.9);
      color: #1f2937;
      font-size: 22px;
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
    
    /* Iframe Styles */
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
      background: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transform-origin: bottom right !important;
      transform: scale(0.9) translateY(10px) !important;
      transition: opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1), visibility 0.3s cubic-bezier(0.33, 1, 0.68, 1), transform 0.3s cubic-bezier(0.33, 1, 0.68, 1) !important;
      pointer-events: none !important;
      overflow: visible !important;
      display: block !important;
      z-index: auto !important;
    }
    
    .chatbot-widget-container .chatbot-widget-iframe.open {
      opacity: 1 !important;
      visibility: visible !important;
      transform: scale(1) translateY(0) !important;
      pointer-events: auto !important;
      background: white !important;
    }
    
    /* Positioning */
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
    
    /* Comprehensive mobile viewport locking for iOS and Android */
    @media (max-width: 480px) {
      /* Lock body scroll when widget is open on mobile - prevent address bar hide/show */
      body.chatbot-widget-open {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100vh !important;
        height: 100dvh !important;
        height: -webkit-fill-available !important;
        overflow: hidden !important;
        overscroll-behavior: none !important;
        touch-action: none !important;
        -webkit-overflow-scrolling: auto !important;
      }
      
      /* Full-screen iframe with modern viewport units */
      .chatbot-widget-container .chatbot-widget-iframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100vh !important;
        height: 100dvh !important;
        height: -webkit-fill-available !important;
        min-width: 100% !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        min-height: -webkit-fill-available !important;
        max-width: 100% !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
        max-height: -webkit-fill-available !important;
        border-radius: 0 !important;
        transform: translateY(100%) !important;
        transform-origin: bottom center !important;
        transition: transform 0.4s cubic-bezier(0.33, 1, 0.68, 1) !important;
        z-index: 2147483646 !important;
      }
      
      .chatbot-widget-container .chatbot-widget-iframe.open {
        transform: translateY(0) !important;
      }
      
      /* Hide button when widget is open */
      .chatbot-widget-button {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
        transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1) !important;
      }
      
      .chatbot-widget-button.is-open {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: scale(0.8) !important;
      }
      
      /* Mobile notification positioning */
      .chatbot-widget-notification {
        position: fixed !important;
        bottom: 95px !important;
        right: 20px !important;
        width: calc(100vw - 40px) !important;
        max-width: 360px !important;
      }

      /* Mobile selection notification positioning */
      .chatbot-selection-notification {
        position: fixed !important;
        bottom: 95px !important;
        right: 20px !important;
        width: calc(100vw - 40px) !important;
        max-width: 280px !important;
      }
    }
  `

    document.head.appendChild(style)
    log("✅ Styles injected")
  }

  function createSelectionNotification() {
    widget.selectionNotification = document.createElement("div")
    widget.selectionNotification.className = "chatbot-selection-notification"
    widget.selectionNotification.innerHTML = `
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
    `

    // Handle click on selection notification
    widget.selectionNotification.addEventListener("click", (e) => {
      e.stopPropagation()

      const textPreview = widget.selectionNotification.querySelector("#selection-text-preview")
      const selectedText = textPreview ? textPreview.textContent : widget.selectedText

      if (!selectedText) {
        log("⚠️ No selected text found")
        return
      }

      log("🖱️ Selection notification clicked, sending text:", selectedText)

      // Open chatbot if not open
      if (!widget.isOpen) {
        openWidget()
      }

      // Send selected text to chatbot iframe with delay to ensure iframe is ready
      setTimeout(
        () => {
          if (widget.iframe && widget.iframe.contentWindow) {
            widget.iframe.contentWindow.postMessage(
              {
                type: "USER_TEXT_SELECTION",
                payload: {
                  text: selectedText,
                  source: "website",
                  action: "populate_input", // Changed from "explain" to indicate input population
                },
              },
              "*",
            )
            log("✅ Text selection sent to chatbot for input population:", selectedText)
          } else {
            log("⚠️ Iframe not ready to receive message")
          }
        },
        widget.isOpen ? 100 : 500,
      )

      // Hide notification after clicking
      hideSelectionNotification()

      // Clear the browser selection
      window.getSelection().removeAllRanges()
    })
  }

  function handleNotificationClick() {
    log("🖱️ Notification content clicked.")
    openWidget()
  }

  function handleMessage(event) {
    if (event.data && (event.data.type === "orion-chatbot-close" || event.data === "close-widget")) {
      log("🔒 Received close command from iframe.")
      closeWidget()
    }
  }

  function toggleWidget(e) {
    if (e) e.stopPropagation()
    if (widget.isLoading) return
    widget.isOpen ? closeWidget() : openWidget()
  }

  function openWidget() {
    if (widget.isOpen || widget.isFrozen) return
    log("🔓 Opening widget")
    widget.isLoading = true

    widget.welcomeNotification.classList.remove("show")
    widget.selectionNotification.classList.remove("show")

    // Ensure iframe is visible and rendered
    widget.iframe.style.display = "block"
    widget.iframe.style.visibility = "visible"
    
    // Trigger iframe load if not already loaded
    if (!widget.iframe.src) {
      const iframeSrc = `${BASE_URL}/widget/${widget.config.id}`
      widget.iframe.src = iframeSrc
      log("🔄 Reloading iframe source during open")
    }

    // Add open class to trigger CSS transitions
    widget.iframe.classList.add("open")

    widget.button.classList.add("is-open")
    widget.button.querySelector(".chatbot-icon").innerHTML = "×"

    if (window.innerWidth <= 480) {
      const scrollY = window.scrollY
      document.body.style.top = `-${scrollY}px`
      document.body.classList.add("chatbot-widget-open")

      document.documentElement.style.overflow = "hidden"
      document.documentElement.style.height = "100%"
      document.documentElement.style.position = "fixed"
      document.documentElement.style.width = "100%"
    }

    // Wait for iframe to be fully ready before sending message
    setTimeout(() => {
      try {
        if (widget.iframe && widget.iframe.contentWindow) {
          // Force iframe to be visible before messaging
          widget.iframe.style.opacity = "1"
          widget.iframe.style.visibility = "visible"
          
          widget.iframe.contentWindow.postMessage(
            {
              type: "WIDGET_OPENED",
              payload: {
                source: "button_click",
                timestamp: Date.now(),
              },
            },
            "*",
          )
          log("✅ Widget opened message sent to iframe")
        } else {
          log("⚠️ Iframe content window not ready")
        }
      } catch (e) {
        log("⚠️ Error sending message to iframe:", e.message)
      }
    }, 150)

    widget.isOpen = true
    widget.isLoading = false
    log("✅ Widget opened")
  }

  function closeWidget() {
    if (!widget.isOpen) return
    log("🔒 Closing widget")
    widget.isLoading = true

    // Remove open class to trigger CSS transitions
    widget.iframe.classList.remove("open")
    
    // Reset iframe visibility properties after animation
    setTimeout(() => {
      widget.iframe.style.opacity = "0"
      widget.iframe.style.visibility = "hidden"
    }, 300)

    widget.button.classList.remove("is-open")
    const iconSpan = widget.button.querySelector(".chatbot-icon")
    iconSpan.innerHTML = widget.config.chatIcon

    if (window.innerWidth <= 480) {
      const scrollY = document.body.style.top
      document.body.classList.remove("chatbot-widget-open")
      document.body.style.top = ""

      document.documentElement.style.overflow = ""
      document.documentElement.style.height = ""
      document.documentElement.style.position = ""
      document.documentElement.style.width = ""

      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
      }
    }

    setTimeout(() => {
      widget.isOpen = false
      widget.isLoading = false
      log("✅ Widget closed")
    }, 200)
  }

  async function checkChatbotStatus() {
    try {
      log("🔍 Checking chatbot subscription status...")
      const response = await fetch(`${BASE_URL}/api/widget/${widget.config.id}/check-status`)

      if (response.ok) {
        const data = await response.json()
        console.log("[Widget] Status check response:", data)

        if (data.shouldFreeze) {
          log("❄️ Chatbot frozen:", data.freezeMessage)
          widget.frozenMessage =
            data.freezeMessage || "چت‌بات شما موقتاً غیرفعال شده است. برای فعال‌سازی مجدد، به حساب تاک‌سل خود مراجعه کنید."
          widget.isFrozen = true
        } else {
          widget.isFrozen = false
        }

        log("✅ Chatbot status checked - showing widget")
        return true
      } else {
        log("⚠️ Failed to check status - showing widget anyway")
        return true
      }
    } catch (err) {
      log("❌ Error checking status:", err)
      return true
    }
  }

  async function fetchChatbotData() {
    try {
      log("📡 Fetching chatbot data...")
      const response = await fetch(`${BASE_URL}/api/chatbots/${widget.config.id}?v=${Date.now()}`)

      if (response.ok) {
        const data = await response.json()
        log("📊 Data received:", data.name)

        widget.config.primaryColor = data.primary_color || "#1068da"
        log(`🎨 Theme color applied: ${widget.config.primaryColor}`)

        if (data.chat_icon) {
          widget.config.chatIcon = data.chat_icon
        }

        if (data.welcome_message) {
          widget.config.welcomeMessage = data.welcome_message
        }

        widget.button.style.background = widget.config.primaryColor
        widget.button.querySelector(".chatbot-icon").innerHTML = widget.config.chatIcon

        const notificationText = widget.welcomeNotification.querySelector(".notification-text")
        if (notificationText) {
          notificationText.innerHTML = widget.config.welcomeMessage
        }
      } else {
        log("⚠️ Failed to fetch chatbot data, using defaults.")
      }
    } catch (err) {
      log("❌ Error fetching data:", err)
    }
  }

  async function init(options = {}) {
    log("🔧 Initializing widget with options:", options)

    if (!options.id) {
      console.error("❌ [Widget] No chatbot ID provided. Aborting.")
      return
    }

    log("🆔 Chatbot ID type:", typeof options.id)
    log("🆔 Chatbot ID value:", options.id)

    widget.config.id = options.id
    widget.config.position = options.position || "bottom-right"
    widget.config.marginX = options.marginX || "20"
    widget.config.marginY = options.marginY || "20"
    widget.config.primaryColor = options.primaryColor || "#1068da"

    createStyles()
    createWidget()

    await checkChatbotStatus()

    await fetchChatbotData()

    // Opt-in: auto-open the chat once per browser session (used by the storefront's
    // "AI" nav tab so a first-time visitor lands directly in the chat). Only opens if
    // the account isn't frozen and the visitor hasn't already dismissed/seen it this
    // session, so it doesn't force itself open again on every page navigation.
    if (options.autoOpen && !widget.isFrozen && !sessionStorage.getItem("chatbot-auto-opened")) {
      sessionStorage.setItem("chatbot-auto-opened", "true")
      openWidget()
    }

    log("✅ Widget initialized")
  }

  function autoInit() {
    log("🔍 Auto-detecting configuration...")
    const scriptTag = document.querySelector("script[data-chatbot-id]")

    if (scriptTag && scriptTag.dataset.chatbotId) {
      log(`🎯 Launcher found for chatbot ID: ${scriptTag.dataset.chatbotId}`)
      log(`🎯 ID type: ${typeof scriptTag.dataset.chatbotId}`)
      log(`🎯 Script tag attributes:`, {
        id: scriptTag.dataset.chatbotId,
        position: scriptTag.dataset.position,
        marginX: scriptTag.dataset.marginX,
        marginY: scriptTag.dataset.marginY,
        primaryColor: scriptTag.dataset.primaryColor,
      })

      init({
        id: scriptTag.dataset.chatbotId,
        position: scriptTag.dataset.position || "bottom-right",
        marginX: scriptTag.dataset.marginX || "20",
        marginY: scriptTag.dataset.marginY || "20",
        primaryColor: scriptTag.dataset.primaryColor || "#1068da",
        autoOpen: scriptTag.dataset.autoOpen === "true",
      })
    } else {
      log("ℹ️ No config found. Waiting for manual init via window.ChatbotWidget.init()")
    }
  }

  window.ChatbotWidget = { init, open: () => openWidget(), close: () => closeWidget(), toggle: () => toggleWidget() }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit)
  } else {
    autoInit()
  }

  function initTextSelectionListener() {
    let lastSelectedText = ""
    let selectionChangeListener = null
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    log("📱 Selection listener initialized - Mobile:", isMobile)

    function processSelection() {
      const selection = window.getSelection()

      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        return
      }

      const text = selection.toString().trim()

      if (!text || text.length === 0) {
        return
      }

      const anchorNode = selection.anchorNode
      const focusNode = selection.focusNode

      if (!anchorNode && !focusNode) return

      const getParentElement = (node) => {
        if (!node) return null
        return node.nodeType === Node.TEXT_NODE ? node.parentElement : node
      }

      const anchorElement = getParentElement(anchorNode)
      const focusElement = getParentElement(focusNode)

      if (widget.container) {
        if (
          (anchorElement && widget.container.contains(anchorElement)) ||
          (focusElement && widget.container.contains(focusElement))
        ) {
          return
        }
      }

      if (text === lastSelectedText) return

      lastSelectedText = text
      log("📝 User selected text:", text)

      let contextElement = null
      try {
        const range = selection.getRangeAt(0)
        contextElement = range.commonAncestorContainer
        if (contextElement.nodeType === Node.TEXT_NODE) {
          contextElement = contextElement.parentElement
        }
      } catch (e) {
        log("⚠️ Could not get context element:", e)
      }

      handleUserSelectedText(text, contextElement)
    }

    function logSelection() {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        log("🔄 Selection changed:", selection.toString().substring(0, 50))
      }
    }

    function stopListening() {
      if (selectionChangeListener) {
        document.removeEventListener("selectionchange", selectionChangeListener)
        selectionChangeListener = null
        log("🛑 Stopped listening to selectionchange")
      }
    }

    function startListening() {
      if (selectionChangeListener) return

      selectionChangeListener = logSelection
      document.addEventListener("selectionchange", selectionChangeListener)
      log("▶️ Started listening to selectionchange")
    }

    document.addEventListener("selectstart", (e) => {
      if (widget.container && e.target && widget.container.contains(e.target)) {
        return
      }

      log("🎯 Selection started")
      hideSelectionNotification()
      lastSelectedText = ""
      startListening()
    })

    document.addEventListener("mouseup", (e) => {
      if (!selectionChangeListener) return

      if (widget.container && e.target && widget.container.contains(e.target)) {
        stopListening()
        return
      }

      setTimeout(() => {
        processSelection()
        stopListening()
      }, 150)
    })

    document.addEventListener("touchend", (e) => {
      if (!selectionChangeListener) return

      if (widget.container && e.target && widget.container.contains(e.target)) {
        stopListening()
        return
      }

      setTimeout(() => {
        processSelection()
        stopListening()
      }, 400)
    })

    document.addEventListener("blur", () => {
      stopListening()
    })

    document.addEventListener("mouseleave", () => {
      stopListening()
    })

    document.addEventListener("click", (e) => {
      if (
        widget.selectionNotification &&
        !widget.selectionNotification.contains(e.target) &&
        !widget.button.contains(e.target)
      ) {
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed || selection.toString().trim() === "") {
          hideSelectionNotification()
          lastSelectedText = ""
        }
      }
    })

    log("✅ Text selection listener initialized with selectstart pattern")
  }

  function hideSelectionNotification() {
    if (widget.selectionNotification) {
      widget.selectionNotification.classList.remove("show")
    }
  }

  function handleUserSelectedText(text, contextElement) {
    if (!text || text.length > 200 || text.length < 2) return

    if (!widget.selectionNotification) {
      log("⚠️ Selection notification element not found")
      return
    }

    const textPreview = widget.selectionNotification.querySelector("#selection-text-preview")
    const wordPreview = widget.selectionNotification.querySelector("#selection-word-preview")

    if (textPreview && wordPreview) {
      const words = text.split(/\s+/).slice(0, 5).join(" ")
      const preview = words.length > 30 ? words.substring(0, 30) + "..." : words

      textPreview.textContent = text
      wordPreview.textContent = preview + (text.split(/\s+/).length > 5 ? "..." : "")

      widget.selectionNotification.classList.add("show")
      log("✅ Selection notification shown for:", preview)
    }

    widget.selectedText = text
  }

  function createWidget() {
    log("🏗️ Creating widget elements...")

    if (!widget.config.id) {
      console.error("❌ [Widget] Cannot create widget - no chatbot ID set!")
      return
    }

    log("✅ Creating widget for chatbot ID:", widget.config.id)

    const existing = document.querySelector(".chatbot-widget-container")
    if (existing) existing.remove()

    widget.container = document.createElement("div")
    widget.container.className = `chatbot-widget-container position-${widget.config.position}`
    widget.container.style.setProperty("--margin-x", `${widget.config.marginX}px`)
    widget.container.style.setProperty("--margin-y", `${widget.config.marginY}px`)

    widget.welcomeNotification = document.createElement("div")
    widget.welcomeNotification.className = "chatbot-widget-notification"

    const closeBtn = document.createElement("button")
    closeBtn.className = "notification-close-btn"
    closeBtn.innerHTML = "×"
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      widget.welcomeNotification.classList.remove("show")
      localStorage.setItem("chatbot-notification-closed", "true")
      log("🖱️ Notification closed via 'X' button.")
    })

    const content = document.createElement("div")
    content.className = "notification-content"
    content.innerHTML = `
      <img src="https://talksell.ir/wp-content/uploads/2025/11/dc.png" alt="Welcome" class="notification-hero-image" />
      <div class="notification-body">
        <div class="notification-text">${widget.config.welcomeMessage}</div>
        <div class="notification-buttons">
          <button class="notification-btn notification-btn-secondary" id="notification-browse-btn">در حال گردشم</button>
          <button class="notification-btn notification-btn-primary" id="notification-start-btn">شروع چت</button>
        </div>
      </div>
    `

    widget.welcomeNotification.appendChild(closeBtn)
    widget.welcomeNotification.appendChild(content)

    setTimeout(() => {
      const startBtn = content.querySelector("#notification-start-btn")
      const browseBtn = content.querySelector("#notification-browse-btn")

      if (startBtn) {
        startBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          log("🖱️ Start chat button clicked")
          openWidget()
        })
      }

      if (browseBtn) {
        browseBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          log("🖱️ Browse button clicked")
          widget.welcomeNotification.classList.remove("show")
          localStorage.setItem("chatbot-notification-closed", "true")
        })
      }
    }, 100)

    log("✅ Welcome notification created.")

    createSelectionNotification()
    log("✅ Selection notification created.")

    widget.button = document.createElement("button")
    widget.button.className = "chatbot-widget-button"
    widget.button.style.background = widget.config.primaryColor
    const iconSpan = document.createElement("span")
    iconSpan.className = "chatbot-icon"
    iconSpan.innerHTML = widget.config.chatIcon
    widget.button.appendChild(iconSpan)
    widget.button.addEventListener("click", toggleWidget)

  widget.iframe = document.createElement("iframe")
  widget.iframe.className = "chatbot-widget-iframe"
  widget.iframe.allow = "microphone"
  widget.iframe.title = "Chatbot"
  widget.iframe.style.display = "block"
  widget.iframe.style.visibility = "hidden"
  widget.iframe.style.opacity = "0"
  widget.iframe.setAttribute("loading", "eager")
  
  const iframeSrc = `${BASE_URL}/widget/${widget.config.id}`
  log("📦 Creating iframe element")
  log("📦 Iframe will load from:", iframeSrc)
  log("📦 Full iframe URL breakdown:", {
    baseUrl: BASE_URL,
    chatbotId: widget.config.id,
    chatbotIdType: typeof widget.config.id,
    fullUrl: iframeSrc,
  })
  
  // Set iframe source to start preloading immediately
  widget.iframe.src = iframeSrc
  log("✅ Iframe source set, preloading started")

    widget.iframe.addEventListener("load", () => {
      log("✅ Iframe load event fired")
      try {
        log("📊 Iframe document state:", {
          readyState: widget.iframe.contentDocument?.readyState,
          title: widget.iframe.contentDocument?.title || "no title",
          bodyExists: !!widget.iframe.contentDocument?.body,
          hasContent: widget.iframe.contentDocument?.body?.children?.length > 0,
        })
      } catch (e) {
        log("⚠️ Cannot access iframe document (cross-origin):", e.message)
      }
      widget.iframeLoaded = true
    })

    widget.iframe.addEventListener("error", (e) => {
      log("❌ Iframe error event fired:", e)
      log("❌ Error details:", {
        message: e.message,
        src: widget.iframe.src,
        readyState: widget.iframe.readyState,
      })
      widget.iframeLoaded = false
    })

    widget.iframe.onerror = (e) => {
      log("❌ Iframe onerror handler triggered:", e)
    }

    setTimeout(() => {
      if (!widget.iframeLoaded) {
        log("⚠️ Iframe has not loaded after 5 seconds")
        log("📊 Iframe state check:", {
          src: widget.iframe.src,
          className: widget.iframe.className,
          parentExists: !!widget.iframe.parentNode,
          readyState: widget.iframe.readyState,
        })

        try {
          const doc = widget.iframe.contentDocument || widget.iframe.contentWindow?.document
          if (doc) {
            log("📄 Iframe document accessible:", {
              readyState: doc.readyState,
              title: doc.title,
              hasBody: !!doc.body,
            })
          } else {
            log("❌ Cannot access iframe document - possible cross-origin issue")
          }
        } catch (err) {
          log("❌ Error accessing iframe document:", err.message)
        }
      }
    }, 5000)

    widget.container.appendChild(widget.iframe)
    widget.container.appendChild(widget.welcomeNotification)
    widget.container.appendChild(widget.selectionNotification)
    widget.container.appendChild(widget.button)
    document.body.appendChild(widget.container)

    window.addEventListener("message", handleMessage)

    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CHATBOT_READY") {
        log("✅ Chatbot signaled ready via postMessage")
        log("📊 Ready signal data:", event.data)
        widget.iframeLoaded = true
      }
    })

    initTextSelectionListener()
    log("✅ Selection change listener initialized")
  }
})()
