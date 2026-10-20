// Nimbus chat widget for any site. Paste one script tag before </body>:
//   <script src="https://nimbus-ai-chatbot.vercel.app/embed.js" async></script>
// It adds a chat button in the corner. The assistant opens in its own frame, so the
// host page's styles and scripts cannot break it.
(function () {
  var script = document.currentScript;
  var base = script && script.src ? new URL(script.src).origin : "";
  if (!base || document.getElementById("nimbus-embed-button")) return;

  var button = document.createElement("button");
  button.id = "nimbus-embed-button";
  button.type = "button";
  button.setAttribute("aria-label", "Open chat");
  button.setAttribute("aria-expanded", "false");
  button.textContent = "Chat";
  button.style.cssText =
    "position:fixed;right:20px;bottom:20px;z-index:2147483000;height:52px;padding:0 20px;" +
    "border:0;border-radius:26px;background:#c23e14;color:#fff;font:600 15px/1 system-ui,sans-serif;" +
    "box-shadow:0 10px 30px rgba(15,27,45,.25);cursor:pointer;";

  var frame = document.createElement("iframe");
  frame.title = "Nimbus assistant";
  frame.src = base + "/?embed=1";
  frame.style.cssText =
    "position:fixed;right:20px;bottom:84px;z-index:2147483000;display:none;border:0;" +
    "width:min(380px,calc(100vw - 40px));height:min(560px,calc(100vh - 120px));" +
    "border-radius:16px;box-shadow:0 24px 60px rgba(15,27,45,.3);background:#fff;";

  button.addEventListener("click", function () {
    var open = frame.style.display === "none";
    frame.style.display = open ? "block" : "none";
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.body.appendChild(frame);
  document.body.appendChild(button);
})();
