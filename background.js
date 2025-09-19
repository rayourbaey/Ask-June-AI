let questions = [];
let intervalId = null;

fetch(chrome.runtime.getURL("question.txt"))
  .then(res => res.text())
  .then(text => {
    questions = text.split("\n").map(l => l.trim()).filter(Boolean);
  })
  .catch(err => console.error("❌ Gagal membaca question.txt:", err));

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "start") {
    if (!questions.length) return sendResponse({ success: false, error: "question.txt kosong!" });

    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(async () => {
      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: sendChat,
          args: [randomQ]
        });
      }
    }, msg.interval * 1000);

    sendResponse({ success: true });
  }

  if (msg.action === "stop") {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    sendResponse({ success: true });
  }

  return true;
});

function sendChat(question) {
  const textarea = document.querySelector('textarea[placeholder="Type your question here..."]');
  if (!textarea) return console.error("❌ Textarea tidak ditemukan!");

  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  nativeSetter.call(textarea, question);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  setTimeout(() => {
    const button = document.querySelector('button[aria-label="submit"]');
    if (button) {
      button.removeAttribute("disabled");
      button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    } else console.error("❌ Tombol tidak ditemukan!");
  }, 300);
}
