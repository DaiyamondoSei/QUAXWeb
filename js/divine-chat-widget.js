// Divine Intelligence Chat Widget JS
(function() {
  const bubble = document.getElementById('divine-chat-bubble');
  const windowEl = document.getElementById('divine-chat-window');
  const closeBtn = document.getElementById('divine-chat-close');
  const form = document.getElementById('divine-chat-form');
  const input = document.getElementById('divine-chat-input');
  const messages = document.getElementById('divine-chat-messages');

  function showChat() {
    windowEl.style.display = 'flex';
    input.focus();
  }
  function hideChat() {
    windowEl.style.display = 'none';
  }
  bubble.addEventListener('click', showChat);
  bubble.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') showChat(); });
  closeBtn.addEventListener('click', hideChat);

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'divine-message ' + sender;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    addMessage('Divine Intelligence is thinking...', 'ai');
    try {
      const res = await fetch('/.netlify/functions/divine_intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      messages.removeChild(messages.querySelector('.divine-message.ai:last-child'));
      if (data.answer) {
        addMessage(data.answer, 'ai');
      } else {
        addMessage('Sorry, I could not find an answer. Please try again.', 'ai');
      }
    } catch (err) {
      messages.removeChild(messages.querySelector('.divine-message.ai:last-child'));
      addMessage('There was an error connecting to Divine Intelligence.', 'ai');
    }
  });
})(); 