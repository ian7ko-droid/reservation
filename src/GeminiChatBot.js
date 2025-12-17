import React, { useState } from 'react';

function GeminiChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    try {
      const userMessage = { role: 'user', content: input };
      setMessages([...messages, userMessage]);

      // 改為呼叫本機後端 API，不帶任何金鑰
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { role: 'bot', content: data.reply || '沒有回覆' };
      setMessages([...messages, userMessage, botMessage]);
      setInput('');
    } catch (error) {
      console.error('Failed to fetch:', error);
      alert('無法連接到聊天服務，請稍後再試。');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            {msg.content}
          </p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default GeminiChatBot;