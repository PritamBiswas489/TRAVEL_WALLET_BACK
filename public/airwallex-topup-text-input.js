const currency = "ILS";
const statusEl = document.getElementById("status");

function showStatus(type, message) {
  statusEl.className = type;
  statusEl.textContent = message;
}

document.getElementById("loadBtn").addEventListener("click", async () => {
  const intent_id = document.getElementById("intent_id").value.trim();
  const client_secret = document.getElementById("client_secret").value.trim();

  if (!intent_id || !client_secret) {
    showStatus("error", "Please enter Intent ID and Client Secret");
    return;
  }

  try {
    await window.AirwallexComponentsSDK.init({
      env: "demo",
      enabledElements: ["payments"],
    });

    document.getElementById("dropIn").innerHTML = "";

    const element = await window.AirwallexComponentsSDK.createElement("dropIn", {
      intent_id,
      client_secret,
      currency,
    });

    element.mount("dropIn");
    element.on("success", () =>
      showStatus("success", "Payment submitted. Confirming with server..."),
    );
    element.on("error", (e) =>
      showStatus(
        "error",
        (e && e.detail && e.detail.message) || "Payment failed.",
      ),
    );
  } catch (err) {
    showStatus("error", "Could not load payment form: " + err.message);
  }
});
