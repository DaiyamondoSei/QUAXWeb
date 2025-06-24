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

  // Show/hide chat
  function showChat() {
    windowEl.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
    document.body.style.overflow = 'hidden';
    document.addEventListener('focus', trapFocus, true);
    saveState({ open: true });
  }
  function hideChat() {
    windowEl.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('focus', trapFocus, true);
    bubble.focus();
    saveState({ open: false });
  }
  bubble.addEventListener('click', showChat);
  bubble.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') showChat(); });
  closeBtn.addEventListener('click', hideChat);
  document.addEventListener('keydown', function(e) {
    if (windowEl.style.display !== 'none' && e.key === 'Escape') {
      hideChat();
    }
  });

  // Message helpers
  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'quannex-message ' + sender;
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
  renderHistory();
})(); 