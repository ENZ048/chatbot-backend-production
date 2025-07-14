// Modern Chatbot Loader with Embedded OTP Modal & Polished UI
(function () {
  const script = document.currentScript;
  const chatbotId = script.getAttribute("chatbot-id");
  const sessionId = localStorage.getItem("chatbot_session_id") || crypto.randomUUID();
  localStorage.setItem("chatbot_session_id", sessionId);
  const apiBase = "http://13.204.42.62:5000/api";

  const CHATBOT_NAME = "Supa Agent";
  const GREETING_MESSAGE = "Hi there! 👋 I'm your virtual assistant. How can I help you today?";
  const GREETING_SUGGESTIONS = ["Are admissions open?", "What courses are available?", "Give Contact Info"];

  const savedEmail = localStorage.getItem("chatbot_user_email");
  let skipOTP = false;
  let greetingShown = false;

  const container = document.createElement("div");
  document.body.appendChild(container);
  const shadow = container.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; }
    .chat-wrapper {
      position: fixed;
      bottom: 20px;
      right: 20px;
      font-family: sans-serif;
      z-index: 9999;
    }
    .chat-btn {
      background: #4F46E5;
      color: white;
      border: none;
      border-radius: 50%;
      padding: 16px;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .chat-box {
      width: 320px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .chat-header {
      background: #4F46E5;
      color: white;
      padding: 12px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-messages {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      font-size: 14px;
    }
    .chat-input {
      display: flex;
      border-top: 1px solid #eee;
    }
    .chat-input input {
      flex: 1;
      border: none;
      padding: 10px;
      outline: none;
      background: #f1f1f1;
    }
    .chat-input button {
      background: #4F46E5;
      color: white;
      border: none;
      padding: 0 14px;
      cursor: pointer;
    }
    .msg {
      margin: 6px 0;
      padding: 8px 12px;
      border-radius: 16px;
      display: inline-block;
      max-width: 80%;
    }
    .msg.user {
      background: #E0E7FF;
      align-self: flex-end;
      margin-left: auto;
    }
    .msg.bot {
      background: #F3F4F6;
      align-self: flex-start;
    }
    .suggestion {
      background: #E0E7FF;
      border: 1px solid #4F46E5;
      padding: 5px 10px;
      margin: 4px;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      display: inline-block;
    }
    .otp-modal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 16px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.2);
      border-radius: 8px;
      z-index: 10000;
    }
    .otp-modal input {
      padding: 8px;
      margin-top: 10px;
      margin-bottom: 10px;
      width: 100%;
    }
    .otp-modal button {
      width: 100%;
      background: #4F46E5;
      color: white;
      border: none;
      padding: 8px;
      cursor: pointer;
    }
  `;
  shadow.appendChild(style);

  const wrapper = document.createElement("div");
  wrapper.className = "chat-wrapper";
  wrapper.innerHTML = `
    <button class="chat-btn">💬</button>
    <div class="chat-box">
      <div class="chat-header">
        ${CHATBOT_NAME}
        <span style="cursor:pointer;" id="close-chat">✖</span>
      </div>
      <div class="chat-messages" id="messages"></div>
      <div class="chat-input" id="input-box" style="display:none;">
        <input id="user-input" placeholder="Type a message..." />
        <button id="send-btn">➤</button>
      </div>
    </div>
  `;
  shadow.appendChild(wrapper);

  const chatBtn = wrapper.querySelector(".chat-btn");
  const chatBox = wrapper.querySelector(".chat-box");
  const closeBtn = shadow.getElementById("close-chat");
  const messages = shadow.getElementById("messages");
  const inputBox = shadow.getElementById("input-box");
  const userInput = shadow.getElementById("user-input");
  const sendBtn = shadow.getElementById("send-btn");

  chatBtn.onclick = async () => {
    chatBox.style.display = "flex";
    chatBtn.style.display = "none";
    if (savedEmail) {
      const res = await fetch(`${apiBase}/check-session?email=${encodeURIComponent(savedEmail)}&chatbotId=${chatbotId}`);
      const data = await res.json();
      if (res.ok && data.valid) skipOTP = true;
    }
    if (!skipOTP) showOTPModal();
    else enableChat();
  };

  closeBtn.onclick = () => {
    chatBox.style.display = "none";
    chatBtn.style.display = "inline-block";
  };

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showGreeting() {
    if (greetingShown) return;
    greetingShown = true;
    appendMessage("bot", GREETING_MESSAGE);
    GREETING_SUGGESTIONS.forEach(suggestion => {
      const btn = document.createElement("span");
      btn.className = "suggestion";
      btn.textContent = suggestion;
      btn.onclick = () => {
        userInput.value = suggestion;
        sendMessage();
      };
      messages.appendChild(btn);
    });
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage("user", text);
    userInput.value = "";
    appendMessage("bot", "Typing...");
    try {
      const res = await fetch(`${apiBase}/chat/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, chatbotId, sessionId }),
      });
      const data = await res.json();
      messages.lastChild.textContent = data.answer || "No response.";
    } catch {
      messages.lastChild.textContent = "⚠️ Server error.";
    }
  }

  sendBtn.onclick = sendMessage;
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function enableChat() {
    inputBox.style.display = "flex";
    showGreeting();
  }

  function showOTPModal() {
    const modal = document.createElement("div");
    modal.className = "otp-modal";
    modal.innerHTML = `
      <div>Please enter your email to verify:</div>
      <input id="email-input" type="email" placeholder="you@example.com" />
      <button id="request-otp">Send OTP</button>
    `;
    shadow.appendChild(modal);

    modal.querySelector("#request-otp").onclick = () => {
      const email = modal.querySelector("#email-input").value;
      if (!email) return alert("Enter a valid email");
      fetch(`${apiBase}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(() => {
        modal.innerHTML = `
          <div>Enter the OTP sent to your email:</div>
          <input id="otp-input" placeholder="Enter OTP" />
          <button id="verify-otp">Verify</button>
        `;
        modal.querySelector("#verify-otp").onclick = () => {
          const otp = modal.querySelector("#otp-input").value;
          fetch(`${apiBase}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, chatbotId, sessionId })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              localStorage.setItem("chatbot_user_email", email);
              shadow.removeChild(modal);
              enableChat();
            } else {
              alert("Invalid OTP");
            }
          });
        };
      });
    };
  }
})();
