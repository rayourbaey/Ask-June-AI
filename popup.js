document.getElementById("start").addEventListener("click", () => {
  const sec = parseInt(document.getElementById("interval").value) || 10;
  chrome.runtime.sendMessage({ action: "start", interval: sec }, (res) => {
    if (res.success) alert("⏳ Auto chat dimulai setiap " + sec + " detik.");
    else alert(res.error);
  });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" }, (res) => {
    if (res.success) alert("⛔ Auto chat dihentikan.");
  });
});
