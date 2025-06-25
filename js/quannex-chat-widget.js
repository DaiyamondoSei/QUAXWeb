// Quannex Intelligence Chat Widget JS
(function() {
  const bubble = document.getElementById('quannex-chat-bubble');
  const windowEl = document.getElementById('quannex-chat-window');
  const closeBtn = document.getElementById('quannex-chat-close');
  const form = document.getElementById('quannex-chat-form');
  const input = document.getElementById('quannex-chat-input');
  const messages = document.getElementById('quannex-chat-messages');
  const loader = document.getElementById('quannex-chat-loader');
  const feedback = document.getElementById('quannex-chat-feedback');
  const feedbackYes = document.getElementById('quannex-feedback-yes');
  const feedbackNo = document.getElementById('quannex-feedback-no');
  const header = document.getElementById('quannex-chat-header');

  // Persistent state helpers
  function saveState(state) {
    localStorage.setItem('quannex-chat-state', JSON.stringify(state));
  }
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem('quannex-chat-state')) || {};
    } catch { return {}; }
  }
  function saveHistory(history) {
    localStorage.setItem('quannex-chat-history', JSON.stringify(history));
  }
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('quannex-chat-history')) || [];
    } catch { return []; }
  }
  function saveFeedback(feedbackArr) {
    localStorage.setItem('quannex-chat-feedbacks', JSON.stringify(feedbackArr));
  }
  function loadFeedback() {
    try {
      return JSON.parse(localStorage.getItem('quannex-chat-feedbacks')) || [];
    } catch { return []; }
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

  // Drag start
  header.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return; // Only left mouse
    isDragging = true;
    const rect = windowEl.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    windowEl.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });

  // Drag move
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const boxW = windowEl.offsetWidth;
    const boxH = windowEl.offsetHeight;
    let left = clamp(e.clientX - dragOffsetX, 0, winW - boxW);
    let top = clamp(e.clientY - dragOffsetY, 0, winH - boxH);
    windowEl.style.left = left + 'px';
    windowEl.style.top = top + 'px';
    windowEl.style.right = 'auto';
    windowEl.style.bottom = 'auto';
    windowEl.style.position = 'fixed';
    windowEl.style.transform = 'none';
  });

  // Drag end
  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      windowEl.style.transition = '';
      document.body.style.userSelect = '';
    }
  });

  // --- Animation helpers ---
  function animateOpen() {
    windowEl.style.display = 'flex';
    windowEl.classList.remove('quannex-chat-animate-out');
    windowEl.classList.add('quannex-chat-animate-in');
    setTimeout(() => input.focus(), 400);
  }
  function animateClose() {
    windowEl.classList.remove('quannex-chat-animate-in');
    windowEl.classList.add('quannex-chat-animate-out');
    setTimeout(() => {
      windowEl.style.display = 'none';
      windowEl.classList.remove('quannex-chat-animate-out');
    }, 380);
  }
  // On page load, ensure chatbox is hidden and animation classes are reset
  windowEl.style.display = 'none';
  windowEl.classList.remove('quannex-chat-animate-in', 'quannex-chat-animate-out');

  // Show/hide chat (with animation)
  function showChat() {
    windowEl.style.left = '';
    windowEl.style.top = '';
    windowEl.style.right = '';
    windowEl.style.bottom = '';
    windowEl.style.position = '';
    windowEl.style.transform = '';
    animateOpen();
    document.body.style.overflow = 'hidden';
    document.addEventListener('focus', trapFocus, true);
    saveState({ open: true });
    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 10);
  }
  function hideChat() {
    animateClose();
    document.body.style.overflow = '';
    document.removeEventListener('focus', trapFocus, true);
    bubble.focus();
    saveState({ open: false });
    document.removeEventListener('mousedown', handleOutsideClick);
  }

  // Outside click handler
  function handleOutsideClick(e) {
    if (!windowEl.contains(e.target) && !bubble.contains(e.target)) {
      hideChat();
    }
  }

  bubble.addEventListener('click', function() {
    if (windowEl.style.display === 'flex' || windowEl.classList.contains('quannex-chat-animate-in')) {
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

  // Message helpers
  function addMessage(text, sender, special) {
    const div = document.createElement('div');
    div.className = 'quannex-message ' + sender + (special ? ' quannex-message-special' : '');
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    // Save to history
    const history = loadHistory();
    history.push({ text, sender });
    saveHistory(history);
  }
  function renderHistory() {
    messages.innerHTML = '';
    const history = loadHistory();
    history.forEach(msg => addMessage(msg.text, msg.sender));
  }

  // Loader helpers
  function showLoader() {
    loader.style.display = 'flex';
  }
  function hideLoader() {
    loader.style.display = 'none';
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
      lastAI: (loadHistory().slice().reverse().find(m => m.sender === 'ai') || {}).text || ''
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
    showLoader();
    hideFeedback();
    try {
      const res = await fetch('/.netlify/functions/quannex_intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      hideLoader();
      if (data.answer) {
        addMessage(data.answer, 'ai');
        showFeedback();
      } else {
        addMessage('Sorry, Quannex Intelligence could not find an answer. Please try again.', 'ai');
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

  // Restore state/history on load
  if (loadState().open) {
    showChat();
  }
  // Add welcoming message if no history exists
  if (loadHistory().length === 0) {
    addMessage('⚛️ Welcome to Quannex - Your Quantum Nexus! How can I - Quannex Intelligence assist you today? Feel free to ask anything about our platform, features, quantum consciousness or quantum mastery paths!', 'ai');
  }
  renderHistory();

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
  function createSession() {
    const id = 'sess-' + Date.now();
    const session = {
      id,
      timestamp: Date.now(),
      messages: [
        { text: '⚛️ Welcome to Quannex - Your Quantum Nexus! How can I - Quannex Intelligence assist you today? Feel free to ask anything about our platform, features, quantum consciousness or quantum mastery paths!', sender: 'ai', ts: Date.now() },
        { text: 'Quannex is here to find coherence with you.', sender: 'ai', ts: Date.now(), special: true }
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
      renderHistory();
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
        renderHistory();
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
    renderHistory();
  }
  // --- On Load: Session Bootstrapping ---
  if (!getCurrentSessionId() || !getCurrentSession()) {
    // Add 'coherence' message first, then welcome
    const id = 'sess-' + Date.now();
    const session = {
      id,
      timestamp: Date.now(),
      messages: [
        { text: 'Quannex is here to find coherence with you.', sender: 'ai', ts: Date.now(), special: true },
        { text: '⚛️ Welcome to Quannex - Your Quantum Nexus! How can I - Quannex Intelligence assist you today? Feel free to ask anything about our platform, features, quantum consciousness or quantum mastery paths!', sender: 'ai', ts: Date.now() }
      ]
    };
    const sessions = loadSessions();
    sessions.push(session);
    saveSessions(sessions);
    setCurrentSessionId(id);
  }
  renderHistory();
})(); 