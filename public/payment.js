const state = {
    intent: null,
    elementsReady: {
        cardNumber: false,
        expiryDate: false,
        cvc: false,
    },
    elementsValid: {
        cardNumber: false,
        expiryDate: false,
        cvc: false,
    },
    submitting: false,
};

const FIELD_HEIGHT = "52px";

const fieldStyle = {
    base: {
        color: "#171a2e",
        fontSize: "16px",
        lineHeight: FIELD_HEIGHT,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: "400",
        "::placeholder": {
            color: "#9aa2b6",
        },
    },
    invalid: {
        color: "#d33232",
    },
};

const darkFieldStyle = {
    base: {
        ...fieldStyle.base,
        color: "#eef1f7",
        "::placeholder": {
            color: "#6b7690",
        },
    },
    invalid: {
        color: "#f2686d",
    },
};

const ui = {
    form: document.querySelector("#payment-form"),
    name: document.querySelector("#cardholder-name"),
    submit: document.querySelector("#submit-payment"),
    buttonText: document.querySelector("#button-text"),
    loader: document.querySelector("#button-loader"),
    message: document.querySelector("#payment-message"),
    amount: document.querySelector("#display-amount"),
    order: document.querySelector("#order-number"),
    pageLoader: document.querySelector("#page-loader"),
    themeToggle: document.querySelector(".theme-toggle"),
};

/* ---------------------------- Theme handling ---------------------------- */

function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem("travel-money-payment-theme", theme);
    } catch (e) {}
}

if (ui.themeToggle) {
    ui.themeToggle.addEventListener("click", () => {
        setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
    });
}

/* ------------------------------ Page loader ------------------------------ */

function hidePageLoader() {
    if (ui.pageLoader) {
        ui.pageLoader.setAttribute("data-hidden", "true");
    }
}

function showPageLoader() {
    if (ui.pageLoader) {
        ui.pageLoader.setAttribute("data-hidden", "false");
    }
}

/* -------------------------------------------------------------------------- */

function money(amount, currency) {
    return new Intl.NumberFormat("he-IL", {
        style: "currency",
        currency,
    }).format(amount);
}

function setMessage(message = "", type = "") {
    ui.message.textContent = message;
    ui.message.className = `payment-message ${type}`;
}

function setLoading(isLoading) {
    state.submitting = isLoading;
    ui.submit.disabled = isLoading || !isFormReady();
    ui.buttonText.hidden = isLoading;
    ui.loader.hidden = !isLoading;
}

function isFormReady() {
    return (
        ui.name.value.trim().length > 1 &&
        Object.values(state.elementsReady).every(Boolean) &&
        Object.values(state.elementsValid).every(Boolean) &&
        !state.submitting
    );
}

function refreshButton() {
    ui.submit.disabled = !isFormReady();
}

function maybeHideLoaderOnceElementsReady() {
    if (Object.values(state.elementsReady).every(Boolean)) {
        hidePageLoader();
    }
}

function bindElementEvents(element, key, containerId, errorId) {
    const container = document.getElementById(containerId);
    const error = document.getElementById(errorId);

    element.on("ready", () => {
        state.elementsReady[key] = true;
        refreshButton();
        maybeHideLoaderOnceElementsReady();
    });

    element.on("focus", () => container.classList.add("is-focused"));
    element.on("blur", () => container.classList.remove("is-focused"));

    element.on("change", (event) => {
        const detail = event?.detail || event || {};
        const complete = Boolean(detail.complete);
        const errorMessage =
            detail.error?.message ||
            detail.error_message ||
            "";

        state.elementsValid[key] = complete && !errorMessage;
        container.classList.toggle("is-invalid", Boolean(errorMessage));
        error.textContent = errorMessage;
        refreshButton();
    });
}

async function getPaymentIntent() {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent_id");
    const response = await fetch(`/api/front/retrieve-payment-intent/${paymentIntentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "לא ניתן להתחיל את התשלום.");
    }

    return response.json();
}

// ─── Shared wallet payment success handler ───────────────────────────────────
// Called by both Google Pay and Apple Pay on their "success" event.
// Re-uses the same server-side verification as the card flow.

async function handleWalletSuccess(label) {
    try {
        const verification = await fetch(`/api/front/retrieve-payment-intent/${state.intent.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const verified = await verification.json();

        if (verified?.data?.status !== "SUCCEEDED") {
            throw new Error(verified?.data?.message || "התשלום התקבל וממתין לאישור.");
        }

        setMessage("התשלום הושלם בהצלחה.", "success");
        console.log(`${label} payment succeeded:`, verified);
        ui.submit.disabled = true;
    } catch (error) {
        console.error(error);
        setMessage(error?.message || "התשלום לא הושלם. נסו שוב.", "error");
    }
}

async function initializePayment() {
    showPageLoader();

    try {
        setMessage();

        const gPaymemtintent = await getPaymentIntent();
        state.intent = gPaymemtintent?.data;
        console.log("Retrieved payment intent:", state.intent);

        ui.amount.textContent = money(state.intent.amount, state.intent.currency);
        ui.buttonText.textContent = `שלם ${money(state.intent.amount, state.intent.currency)}`;
        ui.order.textContent = state.intent.merchant_order_id;

        await window.AirwallexComponentsSDK.init({
            env: "demo",
            enabledElements: ["payments"],
        });

        const activeStyle = getCurrentTheme() === "dark" ? darkFieldStyle : fieldStyle;

        // ── Google Pay ────────────────────────────────────────────────────────
        // The button is only rendered by the SDK when Google Pay is available
        // in the current browser/device, so it is safe to always attempt this.
        try {
            const googlePay = await window.AirwallexComponentsSDK.createElement("googlePayButton", {
                intent_id: state.intent.id,
                client_secret: state.intent.client_secret,
                origin: window.location.origin,
                countryCode: "IL", // ← replace with your merchant country code
                amount: {
                    value: String(state.intent.amount),
                    currency: state.intent.currency,
                },
                merchantInfo: {
                    merchantName: "Travel Money", // ← replace with your store name
                },
                buttonType: "buy",
            });

            googlePay.mount("googlePayButton");

            googlePay.on("success", () => handleWalletSuccess("Google Pay"));
            googlePay.on("error", (event) => {
                console.error("Google Pay error", event);
                setMessage("תשלום Google Pay נכשל. נסו שוב.", "error");
            });
        } catch (e) {
            // Google Pay not available in this environment — fail silently.
            console.warn("Google Pay unavailable:", e);
        }

        // ── Apple Pay ─────────────────────────────────────────────────────────
        // Only rendered in Safari on Apple devices; fails silently elsewhere.
        try {
            const applePay = await window.AirwallexComponentsSDK.createElement("applePayButton", {
                intent_id: state.intent.id,
                client_secret: state.intent.client_secret,
                countryCode: "IL", // ← replace with your merchant country code
                amount: {
                    value: String(state.intent.amount),
                    currency: state.intent.currency,
                },
                totalPriceLabel: "Travel Money", // ← replace with your store name
                buttonType: "buy",
                buttonColor: "black",
            });

            applePay.mount("applePayButton");

            applePay.on("success", () => handleWalletSuccess("Apple Pay"));
            applePay.on("error", (event) => {
                console.error("Apple Pay error", event);
                setMessage("תשלום Apple Pay נכשל. נסו שוב.", "error");
            });
        } catch (e) {
            // Apple Pay not available in this environment — fail silently.
            console.warn("Apple Pay unavailable:", e);
        }

        // ── Split card elements ───────────────────────────────────────────────

        const cardNumber = await window.AirwallexComponentsSDK.createElement("cardNumber", {
            intent: {
                id: state.intent.id,
                amount: state.intent.amount,
                currency: state.intent.currency,
                client_secret: state.intent.client_secret,
            },
            style: activeStyle,
            placeholder: "1234 5678 9012 3456",
            authFormContainer: "auth-form-container",
            allowedCardNetworks: ["visa", "mastercard"],
        });

        const expiryDate = await window.AirwallexComponentsSDK.createElement("expiry", {
            style: activeStyle,
            placeholder: "MM / YY",
        });

        const cvc = await window.AirwallexComponentsSDK.createElement("cvc", {
            style: activeStyle,
            placeholder: "CVV",
            isMasked: true,
            authFormContainer: "auth-form-container",
        });

        cardNumber.mount("card-number");
        expiryDate.mount("expiry-date");
        cvc.mount("cvc");

        bindElementEvents(cardNumber, "cardNumber", "card-number", "card-number-error");
        bindElementEvents(expiryDate, "expiryDate", "expiry-date", "expiry-error");
        bindElementEvents(cvc, "cvc", "cvc", "cvc-error");

        ui.name.addEventListener("input", refreshButton);

        ui.form.addEventListener("submit", async (event) => {
            event.preventDefault();
            setMessage();

            if (!isFormReady()) {
                setMessage("יש להשלים את כל פרטי התשלום.", "error");
                return;
            }

            try {
                setLoading(true);

                await cardNumber.confirm({
                    intent_id: state.intent.id,
                    client_secret: state.intent.client_secret,
                    payment_method: {
                        card: {
                            name: ui.name.value.trim(),
                        },
                    },
                });

                const verification = await fetch(`/api/front/retrieve-payment-intent/${state.intent.id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const verified = await verification.json();

                if (verified?.data?.status !== "SUCCEEDED") {
                    throw new Error(verified?.data?.message || "התשלום התקבל וממתין לאישור.");
                }

                setMessage("התשלום הושלם בהצלחה.", "success");
                console.log("Payment succeeded:", verified);
                setLoading(false);
                ui.submit.disabled = true;
            } catch (error) {
                setLoading(false);
                console.error(error);
                setMessage(
                    error?.message || "התשלום לא הושלם. בדקו את הפרטים ונסו שוב.",
                    "error"
                );
            }
        });

        setMessage();
        window.setTimeout(hidePageLoader, 6000);
    } catch (error) {
        console.error(error);
        setMessage(error?.message || "אירעה שגיאה בטעינת התשלום.", "error");
        hidePageLoader();
    }
}

initializePayment();
