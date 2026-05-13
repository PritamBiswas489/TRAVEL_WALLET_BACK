import joi from "joi";

const COUNTRY_CODES = ["IL"];
const CURRENCIES = ["ILS", "USD", "EUR"];
const IDENTIFICATION_TYPES = ["PERSONAL_ID", "DRIVERS_LICENSE", "PASSPORT"];
const CARD_USAGE_VALUES = [
  "GENERAL_EXPENSES", "BUSINESS_EXPENSES", "EDUCATION", "TRAVEL_TRANSPORT",
  "INSURANCE", "SERVICES", "BILLS_UTILITIES", "INVESTMENT", "FEES_CHARGES",
  "HEALTHCARE", "HOUSING", "NO_CARD_USAGE",
];
const COLLECTION_FROM_VALUES = [
  "ALLOWANCE_FROM_FAMILY", "BENEFITS_FROM_STATE", "EMPLOYMENT_INCOME",
  "INVESTMENT_INCOME_NONPROPERTY", "INCOME_FROM_PROPERTY",
  "INCOME_FROM_MARKETPLLACES", "INSURANCE", "LOANS", "SAVINGS",
  "OTHER_THIRD_PARTIES", "PAYMENT_REFUNDS",
];
const PAYOUT_TO_VALUES = [
  "CONNECTED_AWX_ACCOUNT", "EDUCATIONAL_INSTITUTIONS", "FRIENDS_OR_RELATIVES",
  "MARKETPLACE_PLATFORM", "MARKETPLACE_SELLERS", "MOBILITY_PLATFORM",
  "OTHER_THIRD_PARTY_INDIVIDUALS", "OWN_BANK_ACCOUNT",
  "OTHER_THIRD_PARTY_BUSINESSES", "SECURITIES_BROKERS",
];
const PRODUCT_REFERENCE_VALUES = [
  "CREATE_CARDS", "MAKE_TRANSFERS", "MARKETPLACE_WALLET", "MOBILITY_WALLET",
  "OTHERS", "PAYROLL_WALLET", "RECEIVE_TRANSFERS", "TRADE_SECURITIES",
  "TUITION_PAYMENTS",
];

// Accepts a string (single or comma-separated) or an array; validates each item against allowed values
const csvOrArrayOf = (allowedValues) =>
  joi.alternatives().try(
    joi.array().items(joi.string().valid(...allowedValues)),
    joi.string().custom((value, helpers) => {
      const items = value.split(",").map((v) => v.trim());
      const invalid = items.find((v) => !allowedValues.includes(v));
      if (invalid) return helpers.error("any.only");
      return items;
    }),
  ).optional();

export const airwallexKycValidator = async (data) => {
  try {
    const schema = joi.object({
      firstName: joi.string().min(1).max(100).required().messages({
        "string.empty": "FIRST_NAME_REQUIRED",
        "any.required": "FIRST_NAME_REQUIRED",
      }),
      lastName: joi.string().min(1).max(100).required().messages({
        "string.empty": "LAST_NAME_REQUIRED",
        "any.required": "LAST_NAME_REQUIRED",
      }),
      email: joi.string().email({ tlds: { allow: false } }).required().messages({
        "string.email": "INVALID_EMAIL",
        "string.empty": "EMAIL_REQUIRED",
        "any.required": "EMAIL_REQUIRED",
      }),
      dateOfBirth: joi.string().isoDate().required().messages({
        "string.isoDate": "INVALID_DATE_OF_BIRTH_FORMAT",
        "string.empty": "DATE_OF_BIRTH_REQUIRED",
        "any.required": "DATE_OF_BIRTH_REQUIRED",
      }),
      nationality: joi.string().valid(...COUNTRY_CODES).required().messages({
        "any.only": "INVALID_NATIONALITY",
        "string.empty": "NATIONALITY_REQUIRED",
        "any.required": "NATIONALITY_REQUIRED",
      }),
      address: joi.string().min(1).max(255).required().messages({
        "string.empty": "ADDRESS_REQUIRED",
        "any.required": "ADDRESS_REQUIRED",
      }),
      country: joi.string().valid(...COUNTRY_CODES).required().messages({
        "any.only": "INVALID_COUNTRY",
        "string.empty": "COUNTRY_REQUIRED",
        "any.required": "COUNTRY_REQUIRED",
      }),
      postCode: joi.string().min(1).max(20).required().messages({
        "string.empty": "POST_CODE_REQUIRED",
        "any.required": "POST_CODE_REQUIRED",
      }),
      state: joi.string().min(1).max(100).required().messages({
        "string.empty": "STATE_REQUIRED",
        "any.required": "STATE_REQUIRED",
      }),
      suburb: joi.string().min(1).max(100).required().messages({
        "string.empty": "SUBURB_REQUIRED",
        "any.required": "SUBURB_REQUIRED",
      }),
      identificationType: joi.string().valid(...IDENTIFICATION_TYPES).required().messages({
        "any.only": "INVALID_IDENTIFICATION_TYPE",
        "string.empty": "IDENTIFICATION_TYPE_REQUIRED",
        "any.required": "IDENTIFICATION_TYPE_REQUIRED",
      }),
      cardUsage: csvOrArrayOf(CARD_USAGE_VALUES).messages({
        "any.only": "INVALID_CARD_USAGE",
      }),
      collectionCountryCode: csvOrArrayOf(COUNTRY_CODES).messages({
        "any.only": "INVALID_COLLECTION_COUNTRY_CODE",
      }),
      collectionFrom: csvOrArrayOf(COLLECTION_FROM_VALUES).messages({
        "any.only": "INVALID_COLLECTION_FROM",
      }),
      payoutCountryCodes: csvOrArrayOf(COUNTRY_CODES).messages({
        "any.only": "INVALID_PAYOUT_COUNTRY_CODE",
      }),
      payoutTo: csvOrArrayOf(PAYOUT_TO_VALUES).messages({
        "any.only": "INVALID_PAYOUT_TO",
      }),
      productReference: csvOrArrayOf(PRODUCT_REFERENCE_VALUES).messages({
        "any.only": "INVALID_PRODUCT_REFERENCE",
      }),
      monthlyTransactionVolumeCurrency: joi.string().valid(...CURRENCIES).optional().messages({
        "any.only": "INVALID_MONTHLY_TRANSACTION_VOLUME_CURRENCY",
      }),
      monthlyTransactionVolumeAmount: joi.number().positive().optional().messages({
        "number.base": "MONTHLY_TRANSACTION_VOLUME_AMOUNT_MUST_BE_NUMBER",
        "number.positive": "MONTHLY_TRANSACTION_VOLUME_AMOUNT_GREATER_THAN_ZERO",
      }),
      hasMemberHoldingPublicOffice: joi.string().valid("YES", "NO").optional().messages({
        "any.only": "INVALID_HAS_MEMBER_HOLDING_PUBLIC_OFFICE",
      }),
      hasPriorFinancialInstitutionRefusal: joi.string().valid("YES", "NO").optional().messages({
        "any.only": "INVALID_HAS_PRIOR_FINANCIAL_INSTITUTION_REFUSAL",
      }),
      resubmit: joi.boolean().optional().default(false),
    });

    return [null, await schema.validateAsync(data, { convert: true, stripUnknown: true })];
  } catch (e) {
    console.error("Validation error:", e);
    if (e.details) {
      return [
        { status: 400, data: [], error: { message: e.details[0].message } },
        null,
      ];
    }
    return [
      { status: 500, data: [], error: { message: "CATCH_ERROR", reason: e.message } },
      null,
    ];
  }
};
