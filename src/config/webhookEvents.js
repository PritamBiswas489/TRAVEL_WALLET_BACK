 

 export const kycEventNames = [
      "account.connected",
      "account.submitted",
      "account.action_required",
      "account.active",
      "account.suspended",
      "account.dormant",
      "account.closed",
    ];
    export const depositEventNames = [
      "deposit.rejected",
      "deposit.settled",
      "deposit.reversed",
      "deposit.pending",
    ];
    export const transferEventNames = [
      "transfer.new",
      "transfer.settled",
      "transfer.pending",
      "transfer.suspended",
      "transfer.failed",
      "connected_account_transfer.new",
      "connected_account_transfer.pending",
      "connected_account_transfer.settled",
      "connected_account_transfer.suspended",
      "connected_account_transfer.failed"
    ];
    export const chargesWebhookEventNames = [
      "charge.new",
      "charge.pending",
      "charge.settled",
      "charge.suspended",
      "charge.failed",
    ];
    export const cardholderWebhookEventNames = [
      "issuing.cardholder.pending",
      "issuing.cardholder.incomplete",
      "issuing.cardholder.ready",
      "issuing.cardholder.disabled",
      "issuing.cardholder.deleted",
    ];
    export const debitCardWebhookEventNames = [
      "issuing.card.modified",
      "issuing.card.pending",
      "issuing.card.failed",
      "issuing.card.inactive",
      "issuing.card.active",
      "issuing.card.lost",
      "issuing.card.stolen",
      "issuing.card.closed",
      "issuing.card.blocked",
      "issuing.card.expired",
      "issuing.card.low_remaining_transaction_limit",
    ];
    export const cardTransactionsWebhookEventNames = [
      "issuing.card_transaction.authorized",
      "issuing.card_transaction.verified",
      "issuing.card_transaction.cleared",
      "issuing.card_transaction.reversed",
      "issuing.card_transaction.expired",
      "issuing.card_transaction.declined",
      "issuing.card_transaction.modified"
    ];
    export const transactionDisputeWebhookEventNames = [
      "issuing.transaction_dispute.created",
      "issuing.transaction_dispute.submitted",
      "issuing.transaction_dispute.accepted",
      "issuing.transaction_dispute.rejected",
      "issuing.transaction_dispute.modified",
      "issuing.transaction_dispute.expired",
      "issuing.transaction_dispute.canceled",
      "issuing.transaction_dispute.won",
      "issuing.transaction_dispute.lost",
    ];
    export const paymentIntentWebhookEventNames = [
      "payment_intent.cancelled",
      "payment_intent.created",
      "payment_intent.pending",
      "payment_intent.requires_capture",
      "payment_intent.requires_customer_action",
      "payment_intent.requires_payment_method",
      "payment_intent.succeeded",
      "payment_intent.updated",
      "payment_intent.pending_review",
      "payment_intent.payment_failed",
    ];

    //fund split events
    export const fundSplitWebhookEventNames = [
      "funds_split.created",
      "funds_split.failed",
      "funds_split.released",
      "funds_split.settled",
    ];

    export const paymentIntentReturnWebhookEventNames = [
      "refund.received",
      "refund.accepted",
      "refund.settled",
      "refund.failed",
      "refund.succeeded"
    ];

    export const offboardingWebhookEventNames = [
      "account.offboarding.pending",
      "account.offboarding.completed",
      "account.offboarding.cancelled",
    ];

    export const paymentAttemptWebhookEventNames = [
      "payment_attempt.authentication_failed",
      "payment_attempt.authentication_redirected",
      "payment_attempt.authorization_failed",
      "payment_attempt.authorized",
      "payment_attempt.cancelled",
      "payment_attempt.capture_failed",
      "payment_attempt.capture_requested",
      "payment_attempt.expired",
      "payment_attempt.failed_to_process",
      "payment_attempt.paid",
      "payment_attempt.pending_authorization",
      "payment_attempt.received",
      "payment_attempt.risk_declined",
      "payment_attempt.settled",
    ];

    export const directBankTransferWebhookEventNames = [
      "payout.transfer.overdue",
      "payout.transfer.processing",
      "payout.transfer.sent",
      "payout.transfer.paid",
      "payout.transfer.failed",
      "payout.transfer.cancellation_requested",
      "payout.transfer.cancelled",
      "payout.transfer.funding.requires_funding_confirmation",
      "payout.transfer.funding.scheduled",
      "payout.transfer.funding.processing",
      "payout.transfer.funding.funded",
      "payout.transfer.funding.failed",
      "payout.transfer.funding.cancelled",
      "payout.transfer.funding.reversed"
    ];

    export const balanceImpactingWebhooks = [
      // Direct Balance Events
      "balance.va.top_up", // Wallet balance increase via Virtual Account (Plus)
      "balance.ga.top_up", // Wallet balance increase via Global Account (Plus)
      "balance.adjustment", // Balance change due to adjustment (Plus / Minus)

      // Customer Balance Transactions (Bank Transfer Payments)
      "customer_balance_transaction.bank_transfer.received", // Bank transfer received (Plus pending)
      "customer_balance_transaction.bank_transfer.succeeded", // Bank transfer accepted onto balance (Plus)
      "customer_balance_transaction.bank_transfer.failed", // Bank transfer rejected (informational)
      "customer_balance_transaction.applied_to_payment", // Funds applied to payment (Minus)
      "customer_balance_transaction.bank_transfer_reversal.succeeded", // Reversal succeeded, funds returned (Minus)
      "customer_balance_transaction.bank_transfer_reversal.failed", // Reversal failed (informational)

      // Direct Debit Payouts
      "direct_debit.settled", // Debited from Wallet balance (Minus)
      "direct_debit.returned", // Credited back to Wallet balance (Plus)

      // Connected Accounts: Transfers & Charges
      "connected_account_transfer.settled", // Funds settled in target wallet - Latest API (Plus)
      "charge.settled", // Funds settled in target wallet (Plus)

      // Wallet Transfers (Beta / Older API)
      "wallet_transfer.settled", // Received by beneficiary wallet (Plus)
      "wallet_transfer.failed", // Transfer failed, funds returned (Plus)

      // Payout Transfer Funding (Latest API)
      "payout.transfer.funding.funded", // Transfer successfully funded (Minus)
      "payout.transfer.funding.reversed", // Funding reversed, deducted from Wallet (Minus)
      "payout.transfer.funding.failed", // Funding failed (informational)

      // Batch Transfer Funding
      "payout.batch_transfers.funding.funded", // Batch transfer funded (Minus)
      "payout.batch_transfers.funding.reversed", // Batch funding reversed (Minus)
      "payout.batch_transfers.funding.failed", // Batch funding failed (informational)

      // Transfer Funding (Older API versions 2024-01-31 to 2024-08-07)
      "payment.funding.funded", // Transfer successfully funded (Minus)
      "payment.funding.reversed", // Deducted from Wallet balance after recall (Minus)
      "payment.funding.failed", // Funding failed (informational)
      "payment.cancelled", // Funds returned to Wallet (Plus)
    ];

    export const registeredWebhookEventNames = new Set([
      ...kycEventNames,
      ...depositEventNames,
      ...transferEventNames,
      ...chargesWebhookEventNames,
      ...cardholderWebhookEventNames,
      ...debitCardWebhookEventNames,
      ...cardTransactionsWebhookEventNames,
      ...transactionDisputeWebhookEventNames,
      ...paymentIntentWebhookEventNames,
      ...fundSplitWebhookEventNames,
      ...paymentIntentReturnWebhookEventNames,
      ...offboardingWebhookEventNames,
      ...paymentAttemptWebhookEventNames,
      ...directBankTransferWebhookEventNames,
      ...balanceImpactingWebhooks,
    ]);

 