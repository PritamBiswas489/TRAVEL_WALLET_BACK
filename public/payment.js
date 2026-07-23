const state = {
    intent: null,
    mode: 'new', // 'saved' | 'new'
    savedMethod: null,
    elementsReady: {
        cardNumber: false,
        expiryDate: false,
        cvcSaved: false,
        cvcNew: false,
    },
    elementsValid: {
        cardNumber: false,
        expiryDate: false,
        cvcSaved: false,
        cvcNew: false,
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
        padding:"7px 20px 7px",
        "::placeholder": { color: "#9aa2b6" },
    },
    invalid: { color: "#d33232" },
};

const darkFieldStyle = {
    base: {
        ...fieldStyle.base,
        color: "#eef1f7",
        "::placeholder": { color: "#6b7690" },
    },
    invalid: { color: "#f2686d" },
};

const ui = {
    appShell: document.querySelector(".app-shell"),
    contentSheet: document.querySelector(".content-sheet"),
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
    savedCardSection: document.querySelector("#saved-card-section"),
    savedCardInfo: document.querySelector("#saved-card-info"),
    newCardSection: document.querySelector("#new-card-section"),
    useDifferentCard: document.querySelector("#use-different-card"),
    useSavedCard: document.querySelector("#use-saved-card"),
    walletPaySection: document.querySelector(".wallet-pay-section"),
    walletDivider: document.querySelector(".wallet-divider"),
    orderSummary: document.querySelector(".order-summary"),
    securityNote: document.querySelector(".security-note"),
    trustRow: document.querySelector(".trust-row"),
    authFormContainer: document.querySelector("#auth-form-container"),
};

/* ---------------------------- Theme handling ---------------------------- */

function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("travel-money-payment-theme", theme); } catch (e) {}
}

if (ui.themeToggle) {
    ui.themeToggle.addEventListener("click", () => {
        setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
    });
}

/* ------------------------------ Page loader ------------------------------ */

function hidePageLoader() {
    if (ui.pageLoader) ui.pageLoader.setAttribute("data-hidden", "true");
}

function showPageLoader() {
    if (ui.pageLoader) ui.pageLoader.setAttribute("data-hidden", "false");
}

/* -------------------------------------------------------------------------- */

function money(amount, currency) {
    return new Intl.NumberFormat("he-IL", { style: "currency", currency }).format(amount);
}

function setMessage(message = "", type = "") {
    ui.message.textContent = message;
    ui.message.className = `payment-message ${type}`;
}

function showSuccessOnlyView(message) {
    if (ui.appShell) ui.appShell.classList.add("app-shell--success");
    if (ui.contentSheet) ui.contentSheet.classList.add("content-sheet--success");
        if (ui.form) ui.form.classList.add("payment-form--success");

        ui.message.className = "payment-message success is-prominent";
        ui.message.innerHTML = `
            <div class="payment-success-card">
                <div class="payment-success-icon" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
                        <path d="m8.2 12.2 2.5 2.5 5.1-5.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3>התשלום הושלם בהצלחה</h3>
                <p>${message || "הטעינה נקלטה, ואפשר לחזור לאפליקציה."}</p>
            </div>
        `;
}

function isFormReady() {
    if (state.mode === 'saved') {
        // Saved card mode: only CVC is required
        return (
            state.elementsReady.cvcSaved &&
            state.elementsValid.cvcSaved &&
            !state.submitting
        );
    }
    // New card mode: name + all three elements required
    return (
        ui.name.value.trim().length > 1 &&
        state.elementsReady.cardNumber &&
        state.elementsReady.expiryDate &&
        state.elementsReady.cvcNew &&
        state.elementsValid.cardNumber &&
        state.elementsValid.expiryDate &&
        state.elementsValid.cvcNew &&
        !state.submitting
    );
}

function setLoading(isLoading) {
    state.submitting = isLoading;
    ui.submit.disabled = isLoading || !isFormReady();
    ui.buttonText.hidden = isLoading;
    ui.loader.hidden = !isLoading;
}

function refreshButton() {
    ui.submit.disabled = !isFormReady();
}

function maybeHideLoaderOnceElementsReady() {
    if (state.mode === 'saved') {
        if (state.elementsReady.cvcSaved) hidePageLoader();
    } else {
        if (
            state.elementsReady.cardNumber &&
            state.elementsReady.expiryDate &&
            state.elementsReady.cvcNew
        ) hidePageLoader();
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
        const errorMessage = detail.error?.message || detail.error_message || "";

        state.elementsValid[key] = complete && !errorMessage;
        container.classList.toggle("is-invalid", Boolean(errorMessage));
        error.textContent = errorMessage;
        refreshButton();
    });
}

/* ── Saved card UI ─────────────────────────────────────────────────────────── */

function showSavedCardMode() {
    state.mode = 'saved';
    if (ui.savedCardSection) ui.savedCardSection.hidden = false;
    if (ui.newCardSection) ui.newCardSection.hidden = true;
    if (ui.useSavedCard) ui.useSavedCard.hidden = true;
    refreshButton();
}

function showNewCardMode() {
    state.mode = 'new';
    if (ui.savedCardSection) ui.savedCardSection.hidden = true;
    if (ui.newCardSection) ui.newCardSection.hidden = false;
    if (ui.useSavedCard) ui.useSavedCard.hidden = !state.savedMethod;
    refreshButton();
}

function renderSavedCard(method) {
    if (!ui.savedCardInfo) return;
    const card = method.card;
    const brand = card.brand.toUpperCase();
    ui.savedCardInfo.textContent =
        `${brand} •••• ${card.last4} — פג תוקף ${card.expiry_month}/${card.expiry_year}`;
}

/* -------------------------------------------------------------------------- */

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

        showSuccessOnlyView("הטעינה נקלטה בארנק בהצלחה.");
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

        // ── Detect saved card ─────────────────────────────────────────────────
        const savedMethods = state?.intent?.customer_payment_methods || [];
        console.log("Saved payment methods:", savedMethods);
        if (savedMethods.length > 0) {
            
            state.savedMethod = savedMethods[0];
            renderSavedCard(state.savedMethod);
            showSavedCardMode();
            
        } else {
            showNewCardMode();
           
        }

        await window.AirwallexComponentsSDK.init({
            env: "demo",
            enabledElements: ["payments"],
        });

        const activeStyle = getCurrentTheme() === "dark" ? darkFieldStyle : fieldStyle;

        // ── Google Pay ────────────────────────────────────────────────────────
        try {
            const googlePay = await window.AirwallexComponentsSDK.createElement("googlePayButton", {
                intent_id: state.intent.id,
                client_secret: state.intent.client_secret,
                origin: window.location.origin,
                countryCode: "IL",
                amount: {
                    value: String(state.intent.amount),
                    currency: state.intent.currency,
                },
                merchantInfo: { merchantName: "Travel Money" },
                buttonType: "buy",
            });

            googlePay.mount("googlePayButton");
            googlePay.on("success", () => handleWalletSuccess("Google Pay"));
            googlePay.on("error", (event) => {
                console.error("Google Pay error", event);
                setMessage("תשלום Google Pay נכשל. נסו שוב.", "error");
            });
        } catch (e) {
            console.warn("Google Pay unavailable:", e);
        }

        // ── Apple Pay ─────────────────────────────────────────────────────────
        try {
            const applePay = await window.AirwallexComponentsSDK.createElement("applePayButton", {
                intent_id: state.intent.id,
                client_secret: state.intent.client_secret,
                countryCode: "IL",
                amount: {
                    value: String(state.intent.amount),
                    currency: state.intent.currency,
                },
                totalPriceLabel: "Travel Money",
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
            console.warn("Apple Pay unavailable:", e);
        }

        // ── CVC element (used in both saved and new card modes) ───────────────
        const savedCvc = await window.AirwallexComponentsSDK.createElement("cvc", {
            style: activeStyle,
            placeholder: "CVV",
            isMasked: true,
            isStandalone: true, // standalone mode for saved card CVC re-entry
            authFormContainer: "auth-form-container",
        });

        savedCvc.mount("cvc-saved");
        bindElementEvents(savedCvc, "cvcSaved", "cvc-saved", "cvc-error");

        const newCvc = await window.AirwallexComponentsSDK.createElement("cvc", {
            style: activeStyle,
            placeholder: "CVV",
            isMasked: true,
        });

        newCvc.mount("cvc-new");
        bindElementEvents(newCvc, "cvcNew", "cvc-new", "cvc-error-new");

        // ── Full split card elements (new card mode only) ─────────────────────
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

        cardNumber.mount("card-number");
        expiryDate.mount("expiry-date");

        bindElementEvents(cardNumber, "cardNumber", "card-number", "card-number-error");
        bindElementEvents(expiryDate, "expiryDate", "expiry-date", "expiry-error");

        // ── Toggle between saved and new card ─────────────────────────────────
        if (ui.useDifferentCard) {
            ui.useDifferentCard.addEventListener("click", () => {
                showNewCardMode();
                refreshButton();
            });
        }

        if (ui.useSavedCard) {
            ui.useSavedCard.addEventListener("click", () => {
                showSavedCardMode();
                refreshButton();
            });
        }

        ui.name.addEventListener("input", refreshButton);

        // ── Form submit ───────────────────────────────────────────────────────
        ui.form.addEventListener("submit", async (event) => {
            event.preventDefault();
            setMessage();

            if (!isFormReady()) {
                setMessage("יש להשלים את כל פרטי התשלום.", "error");
                return;
            }

            try {
                setLoading(true);

                if (state.mode === 'saved') {
                    // ── Confirm with saved card + CVC ─────────────────────────
                    // requires_cvc: true in the consent, so confirm via cvc element
                    await savedCvc.confirm({
                        intent_id: state.intent.id,
                        client_secret: state.intent.client_secret,
                        payment_method_id: state.savedMethod.id,
                        triggered_by: 'customer',
                    });
                } else {
                    // ── Confirm with new card ─────────────────────────────────
                    await cardNumber.confirm({
                        intent_id: state.intent.id,
                        client_secret: state.intent.client_secret,
                        payment_method: {
                            card: { name: ui.name.value.trim() },
                        },
                        // Save the card for future use
                        payment_consent: {
                            next_triggered_by: 'customer',
                        },
                    });
                }

                const verification = await fetch(`/api/front/retrieve-payment-intent/${state.intent.id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const verified = await verification.json();

                if (verified?.data?.status !== "SUCCEEDED") {
                    throw new Error(verified?.data?.message || "התשלום התקבל וממתין לאישור.");
                }

                showSuccessOnlyView("הטעינה נקלטה בארנק בהצלחה.");
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
