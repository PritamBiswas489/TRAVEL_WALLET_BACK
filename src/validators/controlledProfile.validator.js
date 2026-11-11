import Joi from "joi";

export const permissionFields = [
  "debit_card_access",
  "add_money",
  "request_extra_spending",
  "money_transfers",
  "qr_payments",
  "currency_exchange",
  "parent_notifications",
];

const limitSchema = (field, defaultValue) =>
  Joi.number().min(0).default(defaultValue).messages({
    "number.base": `CONTROLLED_PROFILE_${field}_MUST_BE_NUMBER`,
    "number.min": `CONTROLLED_PROFILE_${field}_MUST_BE_NON_NEGATIVE`,
  });

export const createControlledProfileSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    "any.required": "NAME_REQUIRED",
    "string.empty": "NAME_REQUIRED",
    "string.base": "CONTROLLED_PROFILE_NAME_MUST_BE_STRING",
    "string.max": "CONTROLLED_PROFILE_NAME_TOO_LONG",
  }),
  profile_type: Joi.string().valid("family_member", "child_profile").messages({
    "string.base": "CONTROLLED_PROFILE_TYPE_INVALID",
    "string.empty": "CONTROLLED_PROFILE_TYPE_INVALID",
    "any.only": "CONTROLLED_PROFILE_TYPE_INVALID",
  }),
  balance_visibility: Joi.string().valid("spending_allowance", "shared_wallet_balance").messages({
    "string.base": "CONTROLLED_PROFILE_BALANCE_VISIBILITY_INVALID",
    "string.empty": "CONTROLLED_PROFILE_BALANCE_VISIBILITY_INVALID",
    "any.only": "CONTROLLED_PROFILE_BALANCE_VISIBILITY_INVALID",
  }),
  daily_spend_limit: limitSchema("DAILY_SPEND_LIMIT", 100),
  monthly_spend_limit: limitSchema("MONTHLY_SPEND_LIMIT", 1500),
  per_transaction_limit: limitSchema("PER_TRANSACTION_LIMIT", 50),
  ...Object.fromEntries(
    permissionFields.map((field) => [
      field,
      Joi.boolean().messages({
        "boolean.base": `CONTROLLED_PROFILE_${field.toUpperCase()}_MUST_BE_BOOLEAN`,
      }),
    ]),
  ),
}).unknown(true);

const updateFields = [
  "name",
  "daily_spend_limit",
  "monthly_spend_limit",
  "per_transaction_limit",
  ...permissionFields,
];

export const updateControlledProfileSchema = Joi.object(
  Object.fromEntries(
    updateFields.map((field) => [
      field,
      createControlledProfileSchema.extract(field).optional(),
    ]),
  ),
).min(1).required().prefs({ noDefaults: true }).messages({
  "any.required": "CONTROLLED_PROFILE_UPDATE_INVALID",
  "object.base": "CONTROLLED_PROFILE_UPDATE_INVALID",
  "object.min": "CONTROLLED_PROFILE_UPDATE_INVALID",
  "object.unknown": "CONTROLLED_PROFILE_UPDATE_INVALID",
});

export const controlledProfileIdSchema = Joi.string()
  .pattern(/^[1-9][0-9]{0,18}$/)
  .custom((value, helpers) =>
    BigInt(value) <= 9223372036854775807n ? value : helpers.error("any.invalid"),
  )
  .required()
  .messages({
    "any.required": "CONTROLLED_PROFILE_ID_INVALID",
    "string.base": "CONTROLLED_PROFILE_ID_INVALID",
    "string.empty": "CONTROLLED_PROFILE_ID_INVALID",
    "string.pattern.base": "CONTROLLED_PROFILE_ID_INVALID",
    "any.invalid": "CONTROLLED_PROFILE_ID_INVALID",
  });

export const controlledProfileStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
}).required().messages({
  "object.base": "CONTROLLED_PROFILE_STATUS_INVALID",
  "object.unknown": "CONTROLLED_PROFILE_STATUS_INVALID",
  "any.required": "CONTROLLED_PROFILE_STATUS_INVALID",
  "string.base": "CONTROLLED_PROFILE_STATUS_INVALID",
  "string.empty": "CONTROLLED_PROFILE_STATUS_INVALID",
  "any.only": "CONTROLLED_PROFILE_STATUS_INVALID",
});
