// Quannex Intelligence Chat Widget JS
(function() {
  const bubble = document.getElementById('quannex-chat-bubble');
  const windowEl = document.getElementById('quannex-chat-window');
  const closeBtn = document.getElementById('quannex-chat-close');
  const newChatBtn = document.getElementById('quannex-new-chat-btn');
  const form = document.getElementById('quannex-chat-form');
  const input = document.getElementById('quannex-chat-input');
  const messages = document.getElementById('quannex-chat-messages');
  const loader = document.getElementById('quannex-chat-loader');
  const typingIndicator = document.getElementById('quannex-typing-indicator');
  const feedback = document.getElementById('quannex-chat-feedback');
  const feedbackYes = document.getElementById('quannex-feedback-yes');
  const feedbackNo = document.getElementById('quannex-feedback-no');
  const header = document.getElementById('quannex-chat-header');

  const stateManager = {
    get: () => {
      try {
        return JSON.parse(localStorage.getItem('quannex-chat-state')) || {};
      } catch {
        return {};
      }
    },
    set: (state) => {
      localStorage.setItem('quannex-chat-state', JSON.stringify(state));
    }
  };

  // Persistent state helpers
  function saveState(newState) {
    const state = stateManager.get();
    stateManager.set({ ...state, ...newState });
  }
  function loadState() {
    return stateManager.get();
  }
  function saveFeedback(feedbackArr) {
    const state = stateManager.get();
    state.feedback = feedbackArr;
    stateManager.set(state);
  }
  function loadFeedback() {
    const state = stateManager.get();
    return state.feedback || [];
  }
  function savePosition(left, top) {
    const state = loadState();
    state.position = { left, top };
    saveState(state);
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
    const boxW = windowEl.offsetWidth;
    const boxH = windowEl.offsetHeight;
    const minVisible = 50; // Minimum visible pixels
    let left = parseInt(windowEl.style.left) || 0;
    let top = parseInt(windowEl.style.top) || 0;
    left = clamp(left, -(boxW - minVisible), winW - minVisible);
    top = clamp(top, -(boxH - minVisible), winH - minVisible);
    windowEl.style.left = left + 'px';
    windowEl.style.top = top + 'px';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.transform = 'none';
  }

  // Helper to reset chat window to center (desktop/tablet)
  function resetChatWindowToCenter() {
    const boxW = windowEl.offsetWidth || 420;
    const boxH = windowEl.offsetHeight || 480;
    const centerX = (window.innerWidth - boxW) / 2;
    const centerY = (window.innerHeight - boxH) / 2;
    windowEl.style.left = centerX + 'px';
    windowEl.style.top = centerY + 'px';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.transform = 'none';
  }

  // Helper to set chat window to mobile default
  function setChatWindowMobileDefault() {
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
    dragOffsetX = e.clientX - windowEl.offsetLeft;
    dragOffsetY = e.clientY - windowEl.offsetTop;
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
    const minVisible = 50; // Minimum visible pixels
    // Clamp so the window is always at least minVisible px visible
    let left = clamp(e.clientX - dragOffsetX, -(boxW - minVisible), winW - minVisible);
    let top = clamp(e.clientY - dragOffsetY, -(boxH - minVisible), winH - minVisible);
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
    console.log('Quannex Chat Widget: animateOpen called');
    clearTimeout(closeTimeout);
    windowEl.style.display = 'flex';
    windowEl.classList.remove('quannex-chat-animate-out');
    void windowEl.offsetWidth; // Force reflow for animation
    windowEl.classList.add('quannex-chat-animate-in');
    console.log('Quannex Chat Widget: Animation classes applied, window display:', windowEl.style.display);
    setTimeout(() => input.focus(), 400);
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
    console.log('Quannex Chat Widget: showChat called');
    const isMobile = window.innerWidth <= 600;
    const wrapper = document.getElementById('quannex-chat-widget-wrapper');

    if (isMobile) {
      setWrapperMobileDefault();
      setChatWindowMobileDefault();
      header.style.cursor = 'default';
      header.removeEventListener('mousedown', dragStartHandler);
    } else {
      setWrapperDesktopDefault();
      const savedPosition = loadPosition();
      // Validate saved position
      let valid = false;
      if (savedPosition && typeof savedPosition.left === 'number' && typeof savedPosition.top === 'number') {
        // Check if within viewport
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const boxW = windowEl.offsetWidth;
        const boxH = windowEl.offsetHeight;
        if (
          savedPosition.left >= -(boxW - 50) &&
          savedPosition.left <= winW - 50 &&
          savedPosition.top >= -(boxH - 50) &&
          savedPosition.top <= winH - 50
        ) {
          valid = true;
        }
      }
      // Always clear bottom/right before setting left/top
      windowEl.style.right = 'auto';
      windowEl.style.bottom = 'auto';
      if (valid) {
        windowEl.style.left = savedPosition.left + 'px';
        windowEl.style.top = savedPosition.top + 'px';
        windowEl.style.transform = 'none';
      } else {
        resetChatWindowToCenter();
      }
      header.style.cursor = 'grab';
      header.addEventListener('mousedown', dragStartHandler);
      clampChatWindowToViewport(); // Ensure it's not off-screen on open
    }
    windowEl.style.pointerEvents = 'auto';
  }
  function hideChat() {
    animateClose();
    document.body.style.overflow = '';
    document.removeEventListener('focus', trapFocus, true);
    bubble.focus();
    saveState({ open: false });
  }

  bubble.addEventListener('click', function() {
    console.log('Quannex Chat Widget: Bubble clicked');
    console.log('Current window display:', windowEl.style.display);
    console.log('Current window classes:', windowEl.className);
    
    // Check if chat is currently visible (either displayed or animating in)
    const isVisible = windowEl.style.display === 'flex' || 
                     windowEl.classList.contains('quannex-chat-animate-in');
    
    if (isVisible) {
      console.log('Quannex Chat Widget: Hiding chat');
      hideChat();
    } else {
      console.log('Quannex Chat Widget: Showing chat');
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
    const feedbackArr = loadFeedback();
    feedbackArr.push({
      timestamp: Date.now(),
      value: val,
      lastAI: ''
    });
    saveFeedback(feedbackArr);
    hideFeedback();
  }
  feedbackYes.addEventListener('click', () => storeFeedback('yes'));
  feedbackNo.addEventListener('click', () => storeFeedback('no'));

  // Form submit (multi-line textarea)
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    resizeInput(); // Reset textarea size after sending
    showIndicator('typing');
    hideFeedback();
    try {
      const res = await fetch('/.netlify/functions/quannex_intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      hideIndicator('typing');
      if (data.answer) {
        addMessage(data.answer, 'ai');
        showFeedback();
      } else {
        addMessage('Sorry, Quannex Intelligence could not find an answer. Please try again.', 'ai');
      hideIndicator('typing');
      }
    } catch (err) {
      hideLoader();
      addMessage('There was an error connecting to Quannex Intelligence.', 'ai');
    }
  });

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

  // Restore state/history on load
  if (loadState().open) {
    showChat();
  }
  // Add welcoming message if no history exists
  if (!getCurrentSessionId() || !getCurrentSession()) {
    createSession(); // Create a new session if none exists or current is invalid
  }
  renderHistory(getCurrentSession().messages);


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
    setTimeout(() => historyClose.focus(), 100);
  }
  function closeHistoryModal() {
    historyModal.style.display = 'none';
    document.body.style.overflow = '';
    windowEl.focus();
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
  function renderCoherenceMessage() {
    const coherenceDiv = document.getElementById('quannex-chat-coherence-message');
    if (!coherenceDiv) return;
    coherenceDiv.innerHTML = `<div class="quannex-coherence-card"><span class="coherence-icon">⚛️</span> <span><strong>Quannex</strong> is here to help you find clarity and coherence. How can I assist you today?</span></div>`;
  }
  function renderHistory(messagesOverride) {
    renderCoherenceMessage();
    messages.innerHTML = '';
    const session = getCurrentSession();
    const msgs = messagesOverride || (session ? session.messages : []);
    msgs.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'quannex-message ' + msg.sender + (msg.special ? ' quannex-message-special' : '');
      // Enhance all 'Quannex' mentions
      let html = msg.text.replace(/(Quannex)/gi, '<span class="quannex-highlight">$1</span>');
      div.innerHTML = html;
      messages.appendChild(div);
    });
    messages.scrollTop = messages.scrollHeight;
  }
  // --- Message Handling ---
  function addMessage(text, sender, special) {
    const session = getCurrentSession();
    if (!session) return;
    session.messages.push({ text, sender, ts: Date.now(), special });
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

  // --- On Load: Session Bootstrapping ---
  if (!getCurrentSessionId() || !getCurrentSession()) {
    createSession(); // Create a new session if none exists or current is invalid
  }
  renderHistory(getCurrentSession().messages);

  // New Chat button functionality
  newChatBtn.addEventListener('click', function() {
    const newSession = createSession();
    renderHistory(newSession.messages);
    input.value = ''; // Clear input field
    hideFeedback(); // Hide feedback buttons for new chat
  });

  // Add window resize listener to keep chat window visible and correct mode
  window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
      setWrapperMobileDefault();
      setChatWindowMobileDefault();
      header.style.cursor = 'default';
      header.removeEventListener('mousedown', dragStartHandler);
    } else {
      setWrapperDesktopDefault();
      clampChatWindowToViewport(); // Clamp on resize as well
      header.style.cursor = 'grab';
      header.addEventListener('mousedown', dragStartHandler);
    }
  });
  
  // Helper to reset wrapper styles for desktop/tablet
  function setWrapperDesktopDefault() {
    const wrapper = document.getElementById('quannex-chat-widget-wrapper');
    if (!wrapper) return;
    wrapper.style.left = '';
    wrapper.style.right = '';
    wrapper.style.width = '';
    wrapper.style.top = '';
    wrapper.style.bottom = '';
    wrapper.style.position = '';
    wrapper.style.transform = '';
  }
  // Helper to set wrapper styles for mobile
  function setWrapperMobileDefault() {
    const wrapper = document.getElementById('quannex-chat-widget-wrapper');
    if (!wrapper) return;
    wrapper.style.left = '1vw';
    wrapper.style.right = '1vw';
    wrapper.style.width = '98vw';
    wrapper.style.top = 'auto';
    wrapper.style.bottom = '16px';
    wrapper.style.position = '';
    wrapper.style.transform = 'none';
  }
})();