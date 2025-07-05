// Quannex Intelligence Chat Widget JS - Best Practices Implementation
(function() {
  'use strict';
  
  // Error handling wrapper
  function safeExecute(fn, context = 'Unknown') {
    try {
      return fn();
    } catch (error) {
      console.error(`[Quannex Chat Widget] Error in ${context}:`, error);
      return null;
    }
  }

  // Check for required elements
  const requiredElements = [
    'quannex-chat-bubble',
    'quannex-chat-window', 
    'quannex-chat-close',
    'quannex-new-chat-btn',
    'quannex-chat-form',
    'quannex-chat-input',
    'quannex-chat-messages',
    'quannex-chat-header'
  ];

  const elements = {};
  let missingElements = [];

  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      missingElements.push(id);
    } else {
      elements[id.replace('quannex-chat-', '')] = element;
    }
  });

  if (missingElements.length > 0) {
    console.error('[Quannex Chat Widget] Missing required elements:', missingElements);
    return; // Exit if critical elements are missing
  }

  // Get elements with fallback
  const bubble = elements.bubble;
  const windowEl = elements.window;
  const closeBtn = elements.close;
  const newChatBtn = elements['new-chat-btn'];
  const form = elements.form;
  const input = elements.input;
  const messages = elements.messages;
  const header = elements.header;
  
  // Optional elements
  const loader = document.getElementById('quannex-chat-loader');
  const typingIndicator = document.getElementById('quannex-typing-indicator');
  const feedback = document.getElementById('quannex-chat-feedback');
  const feedbackYes = document.getElementById('quannex-feedback-yes');
  const feedbackNo = document.getElementById('quannex-feedback-no');

  // State management with error handling
  const stateManager = {
    get: () => safeExecute(() => {
      return JSON.parse(localStorage.getItem('quannex-chat-state')) || {};
    }, 'State loading') || {},
    
    set: (state) => safeExecute(() => {
      localStorage.setItem('quannex-chat-state', JSON.stringify(state));
    }, 'State saving')
  };

  // Event listener tracking for cleanup
  const eventListeners = new Map();

  function addManagedEventListener(element, event, handler, options = {}) {
    if (!element) return;
    
    const key = `${element.id || 'unknown'}-${event}`;
    
    // Remove existing listener if present
    if (eventListeners.has(key)) {
      const existing = eventListeners.get(key);
      element.removeEventListener(event, existing.handler, existing.options);
    }
    
    element.addEventListener(event, handler, options);
    eventListeners.set(key, { element, event, handler, options });
  }

  // Cleanup function
  function cleanup() {
    eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    eventListeners.clear();
    
    if (resizeTimeout) clearTimeout(resizeTimeout);
    if (closeTimeout) clearTimeout(closeTimeout);
  }

  // Safe HTML rendering
  function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    let sanitized = div.innerHTML;
    
    // Only allow specific highlighting
    sanitized = sanitized.replace(/(Quannex)/gi, '<span class="quannex-highlight">$1</span>');
    
    return sanitized;
  }

  // Performance monitoring
  const performanceMonitor = {
    startTiming(label) {
      if (performance && performance.mark) {
        performance.mark(`quannex-${label}-start`);
      }
    },
    
    endTiming(label) {
      if (performance && performance.mark && performance.measure) {
        performance.mark(`quannex-${label}-end`);
        performance.measure(`quannex-${label}`, `quannex-${label}-start`, `quannex-${label}-end`);
      }
    }
  };

  // Persistent state helpers with error handling
  function saveState(newState) {
    const state = stateManager.get();
    stateManager.set({ ...state, ...newState });
  }
  
  function loadState() {
    return stateManager.get();
  }
  
  function savePosition(left, top) {
    if (typeof left === 'number' && typeof top === 'number') {
      const state = loadState();
      state.position = { left, top };
      saveState(state);
    }
  }
  
  function loadPosition() {
    const state = loadState();
    return state.position || null;
  }

  // Focus trap
  function trapFocus(e) {
    if (!windowEl.contains(document.activeElement)) {
      input.focus();
    }
  }

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // Helper to clamp values within viewport
  function clamp(val, min, max) {
    return Math.max(min, Math.min(val, max));
  }

  // Ensure chat window stays fully visible within viewport
  function clampChatWindowToViewport() {
    if (window.innerWidth <= 600) return; // Only clamp on desktop/tablet
    
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const boxW = windowEl.offsetWidth || 420;
    const boxH = windowEl.offsetHeight || 480;
    
    // Get current position
    let left = parseInt(windowEl.style.left) || 0;
    let top = parseInt(windowEl.style.top) || 0;
    
    // Clamp so the window is always fully visible
    left = clamp(left, 0, winW - boxW);
    top = clamp(top, 0, winH - boxH);
    
    // Apply clamped position
    windowEl.style.left = left + 'px';
    windowEl.style.top = top + 'px';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.transform = 'none';
    
    // Position clamped successfully
  }

  // Helper to reset chat window to center (desktop/tablet)
  function resetChatWindowToCenter() {
    // Ensure window dimensions are calculated
    const boxW = 420; // Use fixed width to ensure consistent calculation
    const boxH = 480; // Use fixed height to ensure consistent calculation
    const centerX = Math.max(0, (window.innerWidth - boxW) / 2);
    const centerY = Math.max(0, (window.innerHeight - boxH) / 2);
    
    windowEl.style.left = centerX + 'px';
    windowEl.style.top = centerY + 'px';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.transform = 'none';
    windowEl.style.position = 'fixed'; // Ensure fixed positioning
    
    // Save centered position
    savePosition(centerX, centerY);
    
    // Window centered successfully
  }

  // Helper to set chat window to mobile default
  function setChatWindowMobileDefault() {
    windowEl.style.position = 'fixed';
    windowEl.style.left = '50%';
    windowEl.style.top = 'auto';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = '16px';
    windowEl.style.transform = 'translateX(-50%)';
  }

  // Drag start handler
  function dragStartHandler(e) {
    // Prevent dragging on scrollbars or other interactive elements within the header
    if (e.target !== header && e.target.closest('button, input, a')) {
      return;
    }
    e.preventDefault();
    isDragging = true;
    
    // Calculate offset from mouse pointer to the top-left corner of the chat window
    const rect = windowEl.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    // Prepare for dragging
    windowEl.style.transition = 'none'; // Disable transitions for smooth dragging
    document.body.style.userSelect = 'none'; // Prevent text selection
    header.style.cursor = 'grabbing'; // Change cursor to indicate dragging
    document.body.classList.add('dragging');
  }

  // Drag move handler
  function dragMoveHandler(e) {
    if (!isDragging) return;
    
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const boxW = windowEl.offsetWidth;
    const boxH = windowEl.offsetHeight;
    
    // Calculate new position
    let left = e.clientX - dragOffsetX;
    let top = e.clientY - dragOffsetY;
    
    // Clamp so the window is always fully visible
    left = clamp(left, 0, winW - boxW);
    top = clamp(top, 0, winH - boxH);
    
    // Apply new position
    windowEl.style.left = left + 'px';
    windowEl.style.top = top + 'px';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.transform = 'none';
  }

  // Drag end handler
  function dragEndHandler() {
    if (isDragging) {
      isDragging = false;
      windowEl.style.transition = '';
      document.body.style.userSelect = '';
      header.style.cursor = 'grab';
      document.body.classList.remove('dragging');
      // Clamp to viewport on drag end
      clampChatWindowToViewport();
      const left = parseInt(windowEl.style.left) || 0;
      const top = parseInt(windowEl.style.top) || 0;
      savePosition(left, top);
    }
  }

  // Double-click header to reset position
  header.addEventListener('dblclick', function(e) {
    e.preventDefault();
    resetToCenter();
  });

  // Add event listeners for dragging
  document.addEventListener('mousemove', dragMoveHandler);
  document.addEventListener('mouseup', dragEndHandler);

  let closeTimeout;

  // --- Animation helpers ---
  function animateOpen() {
    clearTimeout(closeTimeout);
    windowEl.style.display = 'flex';
    windowEl.classList.remove('quannex-chat-animate-out');
    requestAnimationFrame(() => { // Use requestAnimationFrame for smoother animation
      windowEl.classList.add('quannex-chat-animate-in');
      setTimeout(() => input.focus(), 400);
    });
  }
  function animateClose() {
    windowEl.classList.remove('quannex-chat-animate-in');
    windowEl.classList.add('quannex-chat-animate-out');
    closeTimeout = setTimeout(() => {
      windowEl.style.display = 'none';
      windowEl.classList.remove('quannex-chat-animate-out');
    }, 380);
  }
  // On page load, ensure chatbox is hidden and animation classes are reset
  windowEl.style.display = 'none';
  windowEl.classList.remove('quannex-chat-animate-in', 'quannex-chat-animate-out');

  // Helper to reset position to center
  function resetToCenter() {
    const state = loadState();
    delete state.position;
    saveState(state);
    showChat();
  }

  // Show/hide chat (with animation)
  function showChat() {
    const isMobile = window.innerWidth <= 600;
    const wrapper = document.getElementById('quannex-chat-widget-wrapper');

    if (isMobile) {
      setWrapperMobileDefault();
      setChatWindowMobileDefault();
      header.style.cursor = 'default';
      header.removeEventListener('mousedown', dragStartHandler);
    } else {
      setWrapperDesktopDefault();
      
      // Ensure window is fixed positioned for desktop
      windowEl.style.position = 'fixed';
      
      const savedPosition = loadPosition();
      
      // Validate saved position
      let valid = false;
      if (savedPosition && typeof savedPosition.left === 'number' && typeof savedPosition.top === 'number') {
        // Check if within viewport with some tolerance
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const boxW = 420;
        const boxH = 480;
        
        if (
          savedPosition.left >= 0 &&
          savedPosition.left <= winW - boxW &&
          savedPosition.top >= 0 &&
          savedPosition.top <= winH - boxH
        ) {
          valid = true;
        }
      }
      
      if (valid && savedPosition) {
        // Apply saved position
        windowEl.style.left = savedPosition.left + 'px';
        windowEl.style.top = savedPosition.top + 'px';
        windowEl.style.right = 'auto';
        windowEl.style.bottom = 'auto';
        windowEl.style.transform = 'none';
      } else {
        // Reset to center if no valid saved position
        resetChatWindowToCenter();
      }
      
      // Enable dragging on desktop
      header.style.cursor = 'grab';
      header.addEventListener('mousedown', dragStartHandler);
      
      // Ensure it's within viewport bounds
      setTimeout(() => {
      clampChatWindowToViewport();
      }, 100); // Small delay to ensure dimensions are calculated
    }
    
    windowEl.style.pointerEvents = 'auto';
    animateOpen();
    
    saveState({ open: true });
    
    // Chat window positioned and displayed
  }
  function hideChat() {
    animateClose();
    document.body.style.overflow = '';
    document.removeEventListener('focus', trapFocus, true);
    bubble.focus();
    saveState({ open: false });
  }

  bubble.addEventListener('click', function() {
    // Check if chat is currently visible (either displayed or animating in)
    const isVisible = windowEl.style.display === 'flex' || 
                     windowEl.classList.contains('quannex-chat-animate-in');
    
    if (isVisible) {
      hideChat();
    } else {
      showChat();
    }
  });
  bubble.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') showChat(); });
  closeBtn.addEventListener('click', hideChat);
  document.addEventListener('keydown', function(e) {
    if ((windowEl.style.display !== 'none' && e.key === 'Escape') || (windowEl.classList.contains('quannex-chat-animate-in') && e.key === 'Escape')) {
      hideChat();
    }
  });

  // Loader and typing indicator helpers
  function showIndicator(type) {
    if (type === 'loader') {
      loader.style.display = 'flex';
    } else if (type === 'typing') {
      typingIndicator.style.display = 'flex';
    }
  }
  function hideIndicator(type) {
    if (type === 'loader') {
      loader.style.display = 'none';
    } else if (type === 'typing') {
      typingIndicator.style.display = 'none';
    }
  }

  // Feedback helpers
  function showFeedback() {
    feedback.style.display = 'flex';
  }
  function hideFeedback() {
    feedback.style.display = 'none';
  }
  function storeFeedback(val) {
    const state = stateManager.get();
    const feedbackArr = state.feedback || [];
    feedbackArr.push({
      timestamp: Date.now(),
      value: val,
      lastAI: ''
    });
    saveState({ feedback: feedbackArr });
    hideFeedback();
  }
  feedbackYes.addEventListener('click', () => storeFeedback('yes'));
  feedbackNo.addEventListener('click', () => storeFeedback('no'));

  // Enhanced form submission with better error handling
  if (form) {
    addManagedEventListener(form, 'submit', async function(e) {
      e.preventDefault();
      
      const question = input.value.trim();
      if (!question) return;
      
      // Disable form during submission
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      
      addMessage(question, 'user');
      input.value = '';
      if (typeof resizeInput === 'function') resizeInput();
      
      if (typingIndicator) showIndicator('typing');
      if (feedback) hideFeedback();
      
      try {
        const data = await sendMessage(question);
        
        if (data && data.answer) {
          addMessage(data.answer, 'ai');
          if (feedback) showFeedback();
        } else {
          addMessage('Sorry, I could not process your request. Please try again.', 'ai');
        }
      } catch (error) {
        console.error('[Quannex Chat Widget] API Error:', error);
        addMessage(`Error: ${error.message}`, 'ai');
      } finally {
        if (typingIndicator) hideIndicator('typing');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Multi-line textarea: Enter to send, Shift+Enter for newline
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  // Dynamic textarea resizing
  function resizeInput() {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
  }
  input.addEventListener('input', resizeInput);

  // Enhanced resize handling with proper cleanup
  let resizeTimeout;
  addManagedEventListener(window, 'resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      safeExecute(() => {
        const isMobile = window.innerWidth <= 600;
        if (isMobile) {
          setWrapperMobileDefault();
          setChatWindowMobileDefault();
          if (header) {
            header.style.cursor = 'default';
            header.removeEventListener('mousedown', dragStartHandler);
          }
        } else {
          setWrapperDesktopDefault();
          clampChatWindowToViewport();
          if (header) {
            header.style.cursor = 'grab';
            addManagedEventListener(header, 'mousedown', dragStartHandler);
          }
        }
      }, 'Window resize');
    }, 150);
  });

  // Global error handler for unhandled errors
  addManagedEventListener(window, 'error', function(event) {
    if (event.filename && event.filename.includes('quannex-chat-widget')) {
      console.error('[Quannex Chat Widget] Unhandled error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    }
  });

  // Cleanup on page unload
  addManagedEventListener(window, 'beforeunload', cleanup);

  // Initialize with error handling
  safeExecute(() => {
    // Restore state/history on load
    if (loadState().open) {
      showChat();
    }
    
    // Initialize session
    if (!getCurrentSessionId() || !getCurrentSession()) {
      createSession();
    }
    renderHistory(getCurrentSession().messages);
  }, 'Initialization');

  // Export cleanup function for manual cleanup if needed
  if (window.QuannexChatWidget) {
    window.QuannexChatWidget.cleanup = cleanup;
  } else {
    window.QuannexChatWidget = { cleanup };
  }

  // --- Session-based History ---
  function saveSessions(sessions) {
    localStorage.setItem('quannex-chat-sessions', JSON.stringify(sessions));
  }
  function loadSessions() {
    try {
      return JSON.parse(localStorage.getItem('quannex-chat-sessions')) || [];
    } catch { return []; }
  }
  function getCurrentSessionId() {
    return localStorage.getItem('quannex-current-session-id');
  }
  function setCurrentSessionId(id) {
    localStorage.setItem('quannex-current-session-id', id);
  }
  function createSession(initialMessages = []) {
    const id = 'sess-' + Date.now();
    const session = {
      id,
      timestamp: Date.now(),
      messages: initialMessages.length > 0 ? initialMessages : [
        { text: '⚛️ Welcome to Quannex - Your Quantum Nexus! How can I - Quannex Intelligence assist you today? Feel free to ask anything about our platform, features, quantum consciousness or quantum mastery paths!', sender: 'ai', ts: Date.now() }
      ]
    };
    const sessions = loadSessions();
    sessions.push(session);
    saveSessions(sessions);
    setCurrentSessionId(id);
    return session;
  }
  function getCurrentSession() {
    const id = getCurrentSessionId();
    if (!id) return null;
    return loadSessions().find(s => s.id === id) || null;
  }
  function updateCurrentSessionMessages(messages) {
    const id = getCurrentSessionId();
    if (!id) return;
    const sessions = loadSessions();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx !== -1) {
      sessions[idx].messages = messages;
      saveSessions(sessions);
    }
  }
  function deleteSession(id) {
    let sessions = loadSessions();
    sessions = sessions.filter(s => s.id !== id);
    saveSessions(sessions);
    // If current session deleted, start a new one
    if (getCurrentSessionId() === id) {
      const newSession = createSession();
      renderHistory(newSession.messages);
    }
  }
  function clearAllSessions() {
    localStorage.removeItem('quannex-chat-sessions');
    localStorage.removeItem('quannex-current-session-id');
  }
  // --- Modal Logic ---
  const historyBtn = document.getElementById('quannex-history-btn');
  const historyModal = document.getElementById('quannex-history-modal');
  const historyClose = document.getElementById('quannex-history-close');
  const historyClear = document.getElementById('quannex-history-clear');
  const historyList = document.getElementById('quannex-history-list');
  function openHistoryModal() {
    renderSessionList();
    historyModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { // Smooth animation
      historyModal.classList.add('modal-open');
    });
    setTimeout(() => historyClose.focus(), 100);
  }
  function closeHistoryModal() {
    historyModal.classList.remove('modal-open');
    setTimeout(() => {
      historyModal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
    input.focus();
  }
  historyBtn.addEventListener('click', openHistoryModal);
  historyClose.addEventListener('click', closeHistoryModal);
  historyModal.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeHistoryModal();
  });
  historyClear.addEventListener('click', function() {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      clearAllSessions();
      createSession();
      renderSessionList();
      closeHistoryModal();
      renderHistory(getCurrentSession().messages);
    }
  });
  function renderSessionList() {
    const sessions = loadSessions();
    historyList.innerHTML = '';
    if (sessions.length === 0) {
      historyList.innerHTML = '<div style="color:#e0e0ff;text-align:center;padding:32px 0;">No past conversations yet.</div>';
      return;
    }
    sessions.forEach(session => {
      const div = document.createElement('div');
      div.className = 'quannex-history-session';
      // Meta: date/time
      const meta = document.createElement('div');
      meta.className = 'quannex-history-session-meta';
      meta.textContent = new Date(session.timestamp).toLocaleString();
      // Preview: first user message or AI if no user
      const preview = document.createElement('div');
      preview.className = 'quannex-history-session-preview';
      const firstUser = session.messages.find(m => m.sender === 'user');
      preview.textContent = firstUser ? firstUser.text.slice(0, 60) : session.messages[0]?.text.slice(0, 60) || '(No messages)';
      // Actions
      const actions = document.createElement('div');
      actions.className = 'quannex-history-session-actions';
      // Open button
      const openBtn = document.createElement('button');
      openBtn.className = 'quannex-history-session-open';
      openBtn.textContent = 'Open';
      openBtn.onclick = function() {
        setCurrentSessionId(session.id);
        closeHistoryModal();
        renderHistory(getCurrentSession().messages);
      };
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'quannex-history-session-delete';
      delBtn.innerHTML = '🗑️';
      delBtn.onclick = function() {
        if (confirm('Delete this conversation?')) {
          deleteSession(session.id);
          renderSessionList();
        }
      };
      actions.appendChild(openBtn);
      actions.appendChild(delBtn);
      div.appendChild(meta);
      div.appendChild(preview);
      div.appendChild(actions);
      historyList.appendChild(div);
    });
  }
  // --- Chat Rendering ---
  function renderHistory(messagesOverride) {
    messages.innerHTML = '';
    const session = getCurrentSession();
    const msgs = messagesOverride || (session ? session.messages : []);
    
    // Add coherence message as first message if it's a new session
    if (msgs.length === 1 && msgs[0].sender === 'ai') {
      // Add the coherence card as a special message
      const coherenceDiv = document.createElement('div');
      coherenceDiv.className = 'quannex-coherence-card';
      coherenceDiv.innerHTML = `
        <span class="coherence-icon">⚛️</span>
        <div>
          <strong>Quannex</strong> is here to help you find clarity and coherence.<br>
          How can I assist you today?
        </div>
      `;
      messages.appendChild(coherenceDiv);
    }
    
    msgs.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'quannex-message ' + msg.sender + (msg.special ? ' quannex-message-special' : '');
      // Enhance all 'Quannex' mentions
      let html = msg.text.replace(/(Quannex)/gi, '<span class="quannex-highlight">$1</span>');
      div.innerHTML = html;
      messages.appendChild(div);
    });
    
    // Smooth scroll to bottom
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  }
  // --- Message Handling ---
  function addMessage(text, sender, special = false) {
    if (!text || !sender) return;
    
    const session = getCurrentSession();
    if (!session) return;
    
    const messageData = { 
      text: String(text), 
      sender: String(sender), 
      ts: Date.now(), 
      special: Boolean(special) 
    };
    
    session.messages.push(messageData);
    updateCurrentSessionMessages(session.messages);
    renderHistory(session.messages);
  }

  // New function for typing effect
  async function typeMessage(element, text, delay = 20) {
    element.textContent = ''; // Clear existing text
    for (let i = 0; i < text.length; i++) {
      element.textContent += text.charAt(i);
      messages.scrollTop = messages.scrollHeight; // Scroll to bottom
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // New Chat button functionality
  newChatBtn.addEventListener('click', function() {
    const newSession = createSession();
    renderHistory(newSession.messages);
    input.value = ''; // Clear input field
    hideFeedback(); // Hide feedback buttons for new chat
    // Smooth scroll to top to see coherence message
    messages.scrollTop = 0;
  });

  // Helper to reset wrapper styles for desktop/tablet
  function setWrapperDesktopDefault() {
    const wrapper = document.getElementById('quannex-chat-widget-wrapper');
    if (!wrapper) return;
    // Remove all positioning constraints to allow full screen movement
    wrapper.style.position = 'static';
    wrapper.style.left = '';
    wrapper.style.right = '';
    wrapper.style.top = '';
    wrapper.style.bottom = '';
    wrapper.style.width = '';
    wrapper.style.height = '';
    wrapper.style.transform = '';
    wrapper.style.margin = '';
    wrapper.style.padding = '';
    wrapper.style.pointerEvents = 'auto';
  }
  
  // Helper to set wrapper styles for mobile
  function setWrapperMobileDefault() {
    const wrapper = document.getElementById('quannex-chat-widget-wrapper');
    if (!wrapper) return;
    wrapper.style.position = 'fixed';
    wrapper.style.left = '1vw';
    wrapper.style.right = '1vw';
    wrapper.style.width = '98vw';
    wrapper.style.top = 'auto';
    wrapper.style.bottom = '16px';
    wrapper.style.transform = 'none';
    wrapper.style.pointerEvents = 'auto';
  }

  // Enhanced error handling for API calls
  async function sendMessage(question) {
    if (!question || typeof question !== 'string') {
      throw new Error('Invalid question provided');
    }

    performanceMonitor.startTiming('api-call');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch('/.netlify/functions/quannex_intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      performanceMonitor.endTiming('api-call');
      
      return data;
    } catch (error) {
      performanceMonitor.endTiming('api-call');
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }

  function createMessageElement(text, sender, special = false) {
    const div = document.createElement('div');
    div.className = `quannex-message ${sender}${special ? ' quannex-message-special' : ''}`;
    div.innerHTML = sanitizeHTML(text);
    return div;
  }
})();