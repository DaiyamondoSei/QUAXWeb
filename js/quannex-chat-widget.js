// Quannex Intelligence Chat Widget JS
(function() {
  const bubble = document.getElementById('quannex-chat-bubble');
  const windowEl = document.getElementById('quannex-chat-window');
  const closeBtn = document.getElementById('quannex-chat-close');
  const form = document.getElementById('quannex-chat-form');
  const input = document.getElementById('quannex-chat-input');
  const messages = document.getElementById('quannex-chat-messages');

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
    div.className = 'quannex-message ' + sender;
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
    addMessage('Quannex Intelligence is thinking...', 'ai');
    try {
      const res = await fetch('/.netlify/functions/quannex_intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      messages.removeChild(messages.querySelector('.quannex-message.ai:last-child'));
      if (data.answer) {
        addMessage(data.answer, 'ai');
      } else {
        addMessage('Sorry, Quannex Intelligence could not find an answer. Please try again.', 'ai');
      }
    } catch (err) {
      messages.removeChild(messages.querySelector('.quannex-message.ai:last-child'));
      addMessage('There was an error connecting to Quannex Intelligence.', 'ai');
    }
  });
})(); 