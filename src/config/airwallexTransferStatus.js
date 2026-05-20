export const AIRWALLEX_TRANSFER_STATUS = {
  'DEPOSIT': {
    'type': 'CREDIT',
    'text': 'Deposit',
    'description': 'Funds received into your account',
  },
  'CONVERSION_BUY': {
    'type': 'CREDIT',
    'text': 'FX Conversion Buy',
    'description': 'Funds received after a currency conversion',
  },
  'REFUND': {
    'type': 'CREDIT',
    'text': 'Refund',
    'description': 'Payment refunded back to your account',
  },
  'PAYOUT_REVERSAL': {
    'type': 'CREDIT',
    'text': 'Payout Reversal',
    'description': 'A previously sent payout returned',
  },
  'DD_CREDIT': {
    'type': 'CREDIT',
    'text': 'Direct Debit Credit',
    'description': 'Credit via direct debit',
  },
  'DC_CREDIT': {
    'type': 'CREDIT',
    'text': 'Direct Credit',
    'description': 'Funds credited directly',
  },
  'ISSUING_REFUND': {
    'type': 'CREDIT',
    'text': 'Card Refund',
    'description': 'Merchant refund on an issued card',
  },
  'TRANSFER_IN': {
    'type': 'CREDIT',
    'text': 'Transfer In',
    'description': 'Funds transferred into your account',
  },
  'DEPOSIT_REVERSAL': {
    'type': 'CREDIT',
    'text': 'Deposit Reversal',
    'description': 'A previously received deposit reversed',
  },
  'PAYOUT': {
    'type': 'DEBIT',
    'text': 'Payout',
    'description': 'Funds sent out to a beneficiary',
  },
  'CONVERSION_SELL': {
    'type': 'DEBIT',
    'text': 'FX Conversion Sell',
    'description': 'Funds deducted for a currency conversion',
  },
  'FEE': {
    'type': 'DEBIT',
    'text': 'Fee',
    'description': 'Charges applied by Airwallex',
  },
  'DD_DEBIT': {
    'type': 'DEBIT',
    'text': 'Direct Debit',
    'description': 'Funds debited via direct debit',
  },
  'DC_DEBIT': {
    'type': 'DEBIT',
    'text': 'Direct Credit Debit',
    'description': 'Funds debited directly',
  },
  'ISSUING_CAPTURE': {
    'type': 'DEBIT',
    'text': 'Card Purchase',
    'description': 'Spend captured on an issued card',
  },
  'TRANSFER_OUT': {
    'type': 'DEBIT',
    'text': 'Transfer Out',
    'description': 'Funds transferred out of your account',
  },
  'ADJUSTMENT': {
    'type': 'DEBIT',
    'text': 'Adjustment',
    'description': 'Manual balance adjustment',
  },
  'PURCHASE': {
    'type': 'DEBIT',
    'text': 'Purchase',
    'description': 'A purchase transaction',
  },
  'PAYMENT_RESERVE_HOLD': {
    'type': 'HOLD',
    'text': 'Payment Reserve Hold',
    'description': 'Funds temporarily held from your payment settlements to cover potential chargebacks and refunds',
  },
  'PAYMENT_RESERVE_RELEASE': {
    'type': 'HOLD',
    'text': 'Payment Reserve Release',
    'description': 'Previously held reserve funds released back to your available balance',
  },
  'HOLD': {
    'type': 'HOLD',
    'text': 'Hold',
    'description': 'Funds temporarily held in your account',
  },
  'HOLD_RELEASE': {
    'type': 'HOLD',
    'text': 'Hold Release',
    'description': 'Previously held funds released back to your available balance',
  },
  'ISSUING_AUTHORISATION_HOLD': {
    'type': 'HOLD',
    'text': 'Card Authorization Hold',
    'description': 'Funds reserved when an issued card is used for a purchase (pending clearing)',
  },
  'ISSUING_AUTHORISATION_RELEASE': {
    'type': 'HOLD',
    'text': 'Card Authorization Release',
    'description': 'Reserved card funds released when authorization expires or is reversed',
  },
}