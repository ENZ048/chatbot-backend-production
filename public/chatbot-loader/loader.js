(async function () {
  const scriptTag = document.currentScript;
  const chatbotId = scriptTag.getAttribute("chatbot-id");
  const sessionId = localStorage.getItem("chatbot_session_id") || crypto.randomUUID();
  localStorage.setItem("chatbot_session_id", sessionId);
  const apiBase = "http://13.204.42.62:5000/api";

  const CHATBOT_NAME = "Supa Agent";
  const GREETING_MESSAGE = "Hi there! 👋 I'm your virtual assistant. How can I help you today?";
  const GREETING_SUGGESTIONS = [
    "Are admissions open?",
    "What courses are available?",
    "Give Contact Info",
  ];

  const savedEmail = localStorage.getItem("chatbot_user_email");
  let skipOTP = false;
  let greetingShown = false;

  if (savedEmail) {
    try {
      const sessionCheck = await fetch(`${apiBase}/check-session?email=${encodeURIComponent(savedEmail)}&chatbotId=${chatbotId}`);
      const sessionData = await sessionCheck.json();
      if (sessionCheck.ok && sessionData.valid) {
        skipOTP = true;
      }
    } catch (err) {
      console.error("Session check failed:", err);
    }
  }

  const style = document.createElement("style");
  style.innerHTML = `#troika-chat-button{position:fixed;bottom:20px;right:20px;width:80px;height:80px;border-radius:50%;color:white;font-size:28px;border:none;background:none;cursor:pointer;z-index:9999;}#troika-chatbox{position:fixed;bottom:90px;right:20px;width:360px;height:520px;max-height:90vh;background:#fff;border-radius:18px;box-shadow:0 16px 40px rgba(0,0,0,0.2);display:none;flex-direction:column;overflow:hidden;z-index:9999;font-family:"Segoe UI",sans-serif}@media(max-width:480px){#troika-chatbox{width:90%;right:5%;bottom:90px;height:75vh}}#troika-header{background:linear-gradient(to right,#4F46E5,#6366F1);color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:15px}#troika-header span{cursor:pointer;font-size:18px}#troika-messages{flex:1;padding:16px;overflow-y:auto;background:#F9FAFB;display:flex;flex-direction:column;gap:12px;box-sizing:border-box}.troika-msg{display:flex;align-items:flex-end;gap:10px}.troika-avatar{width:30px;height:30px;border-radius:50%;object-fit:cover}.troika-bubble{padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.5;max-width:80%;word-wrap:break-word}.user .troika-bubble{background:#E0E7FF;border-bottom-right-radius:4px;margin-left:auto}.bot .troika-bubble{background:#F3F4F6;border-bottom-left-radius:4px;margin-right:auto}#troika-input{display:flex;padding:10px;border-top:1px solid #eee;background:#fff;align-items:center;gap:8px}#troika-input input{all:unset;flex:1;padding:12px 14px;border-radius:10px;background:#f1f1f1;font-size:14px;border:1px solid #ccc;box-sizing:border-box}#troika-input button{background:#4F46E5;border:none;color:white;border-radius:10px;padding:10px 16px;font-size:16px;cursor:pointer;transition:background 0.3s ease;display:flex;align-items:center;justify-content:center}#troika-input button:hover{background:#4338CA}.typing-indicator{font-style:italic;font-size:13px;opacity:0.6}.troika-suggestion-button {
  padding: 6px 12px !important;
  font-size: 12px !important;
  border-radius: 18px !important;
  border: 1px solid #ccc;
  background: #fff;
  color: #c026d3;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}
.troika-suggestion-button:hover {
  background: #f0f0f0;
}


#troika-chat-label{position:fixed;bottom:100px;right:40px;background:#4F46E5;color:white;padding:6px 12px;border-radius:12px;font-size:13px;font-weight:bold;font-family:"Segoe UI",sans-serif;box-shadow:0 4px 10px rgba(0,0,0,0.1);white-space:nowrap;z-index:9999;animation:fadeInUp 0.3s ease}#troika-chat-label::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border-width:6px;border-style:solid;border-color:#4F46E5 transparent transparent transparent}@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`;


  document.head.appendChild(style);

  const el = (tag, attrs = {}, html = "") => {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (html) e.innerHTML = html;
    return e;
  };

  const button = el("button", { id: "troika-chat-button" },
    `<img src="https://raw.githubusercontent.com/ENZ048/FirstRepo/main/photo_2025-07-15_00-07-42.jpg" alt="Chat" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`);
  const label = el("div", { id: "troika-chat-label" }, "Troika AI Assistant");
  const chatbox = el("div", { id: "troika-chatbox" }, `
    <div id="troika-header">${CHATBOT_NAME} <span id="troika-close">✖</span></div>
    <div id="troika-messages"></div>
    <div id="troika-input" style="display:none;">
      <input type="text" placeholder="Type your message..." />
      <button>➤</button>
    </div>
  `);

  document.body.appendChild(button);
  document.body.appendChild(label);
  document.body.appendChild(chatbox);

  const input = chatbox.querySelector("input");
  const sendBtn = chatbox.querySelector("button");
  const messages = chatbox.querySelector("#troika-messages");
  const closeBtn = chatbox.querySelector("#troika-close");
  const inputBox = chatbox.querySelector("#troika-input");

  button.onclick = () => {
    chatbox.style.display = "flex";
    label.style.display = "none";
    document.querySelector("#troika-auth-wrapper")?.remove();
    !skipOTP ? showAuth() : enableChat();
  };

  closeBtn.onclick = () => {
    chatbox.style.display = "none";
    label.style.display = "block";
  };

  function showAuth() {
    const authWrapper = el("div", { id: "troika-auth-wrapper", style: "padding: 20px;" }, `
      <input id="troika-email" type="email" placeholder="Enter your email" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ccc;border-radius:8px;" />
      <button id="request-otp" style="width:100%;padding:10px;background:#4F46E5;color:white;border:none;border-radius:8px;">Send OTP</button>
      <div id="otp-section" style="margin-top:15px;display:none;">
        <input id="troika-otp" type="text" placeholder="Enter OTP" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ccc;border-radius:8px;" />
        <button id="verify-otp" style="width:100%;padding:10px;background:#4F46E5;color:white;border:none;border-radius:8px;">Verify OTP</button>
      </div>
    `);
    chatbox.insertBefore(authWrapper, messages);

    const emailInput = authWrapper.querySelector("#troika-email");
    const otpInput = authWrapper.querySelector("#troika-otp");
    const otpSection = authWrapper.querySelector("#otp-section");

    authWrapper.querySelector("#request-otp").onclick = async () => {
      const email = emailInput.value.trim();
      if (!email) return alert("Enter your email");
      const res = await fetch(`${apiBase}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        alert("OTP sent to your email");
        otpSection.style.display = "block";
      } else {
        alert("Failed to send OTP");
      }
    };

    authWrapper.querySelector("#verify-otp").onclick = async () => {
      const email = emailInput.value.trim().toLowerCase();
      const otp = otpInput.value.trim();
      if (!email || !otp) return alert("Enter both email and OTP");
      const res = await fetch(`${apiBase}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, chatbotId, sessionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("chatbot_user_email", email);
        localStorage.setItem("chatbot_verified_at", new Date().toISOString());
        chatbox.removeChild(authWrapper);
        enableChat();
      } else {
        alert(data.message || "Invalid OTP");
      }
    };
  }

  function enableChat() {
    document.querySelector("#troika-auth-wrapper")?.remove();
    inputBox.style.display = "flex";
    showGreeting();
  }

  function showGreeting() {
    if (greetingShown) return;
    greetingShown = true;
    addMessage("bot", GREETING_MESSAGE);
    showSuggestions(GREETING_SUGGESTIONS);
  }

  function showSuggestions(list) {
    document.getElementById("troika-suggestion-row")?.remove();
    const row = el("div", { id: "troika-suggestion-row", class: "troika-msg user" });
    row.appendChild(el("div", { style: "width: 30px;" }));
    const container = el("div", { style: "display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; max-width: 80%;" });
    list.forEach((text) => {
      const btn = el("button", { class: "troika-suggestion-button" }, text);
      btn.onclick = () => {
        row.remove();
        input.value = text;
        sendMessage();
      };
      container.appendChild(btn);
    });
    row.appendChild(container);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(role, text, avatar = null, suggestions = []) {
    const row = el("div", { class: `troika-msg ${role}` });
    const bubble = el("div", { class: "troika-bubble" }, text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#4F46E5;text-decoration:underline;font-weight:bold">$1</a>'));
    const img = el("img", { class: "troika-avatar", src: avatar || (role === "user" ? "https://cdn-icons-png.flaticon.com/512/149/149071.png" : "https://cdn-icons-png.flaticon.com/512/4712/4712109.png") });
    if (role === "user") {
      row.appendChild(bubble);
      row.appendChild(img);
    } else {
      row.appendChild(img);
      row.appendChild(bubble);
    }
    messages.appendChild(row);

    if (role === "bot" && suggestions.length > 0) {
      const suggBox = el("div", { style: "display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 0 40px;max-width:80%;" });
      suggestions.forEach((text) => {
        const btn = el("button", { class: "troika-suggestion-button" }, text);
        btn.onclick = () => {
          input.value = text;
          sendMessage();
        };
        suggBox.appendChild(btn);
      });
      messages.appendChild(suggBox);
    }
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = el("div", { class: "troika-msg bot", id: "typing-indicator" });
    typing.appendChild(el("img", { class: "troika-avatar", src: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" }));
    typing.appendChild(el("div", { class: "troika-bubble typing-indicator" }, "Typing..."));
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    document.getElementById("typing-indicator")?.remove();
  }

  async function sendMessage() {
    const query = input.value.trim();
    if (!query) return;
    addMessage("user", query);
    showSuggestions([]);
    input.value = "";
    showTyping();

    try {
      const res = await fetch(`${apiBase}/chat/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, chatbotId, sessionId }),
      });
      const data = await res.json();
      removeTyping();
      if (res.ok) {
        addMessage("bot", data.answer || "(No response)");
        if (data.suggestions?.length) showSuggestions(data.suggestions);
      } else {
        addMessage("bot", `❌ ${data.message || "Error"}`);
      }
    } catch (err) {
      removeTyping();
      addMessage("bot", "⚠️ Unable to reach server.");
    }
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
