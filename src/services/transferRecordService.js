import db from "../databases/models/index.js";

const { AirwallexBeneficiaryList, AirwallexBeneficiaryDirectBankTransfers } = db;

function mapTransferToRecord(transfer) {
  return {
    airwallexTransferId: transfer.id,
    airwallexBeneficiaryId: transfer.beneficiary_id,
    requestId: transfer.request_id,
    shortReferenceId: transfer.short_reference_id,
    reference: transfer.reference,
    reason: transfer.reason,
    remarks: transfer.remarks,
    status: transfer.status,
    fundingStatus: transfer.funding?.status,
    transferAmount: transfer.transfer_amount,
    transferCurrency: transfer.transfer_currency,
    sourceAmount: transfer.source_amount,
    sourceCurrency: transfer.source_currency,
    amountPayerPays: transfer.amount_payer_pays,
    amountBeneficiaryReceives: transfer.amount_beneficiary_receives,
    conversionCurrencyPair: transfer.conversion?.currency_pair,
    conversionRate: transfer.conversion?.rate,
    feeAmount: transfer.fee_amount,
    feeCurrency: transfer.fee_currency,
    feePaidBy: transfer.fee_paid_by,
    swiftChargeOption: transfer.swift_charge_option,
    applicationFeeOptions: transfer.application_fee_options,
    applicationFees: transfer.application_fees,
    transferMethod: transfer.transfer_method,
    transferDate: transfer.transfer_date,
    beneficiaryDetails: transfer.beneficiary,
    payerDetails: transfer.payer,
    airwallexCreatedAt: transfer.created_at,
    airwallexUpdatedAt: transfer.updated_at,
  };
}

export async function createTransferRecord(transfer, userId, beneficiaryId) {
  try {
    return await AirwallexBeneficiaryDirectBankTransfers.create({
      ...mapTransferToRecord(transfer),
      userId,
      beneficiaryListId: beneficiaryId ?? null,
    });
  } catch (error) {
    throw new Error(`Failed to create transfer record: ${error.message}`);
  }
}

export async function getTransfersByUser(userId, { page = 1, limit = 10 } = {}) {
  try {
    const { rows, count } = await AirwallexBeneficiaryDirectBankTransfers.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      transfers: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch transfers: ${error.message}`);
  }
}

export async function updateTransferRecord(transfer, userId) {
  try {
    const record = await AirwallexBeneficiaryDirectBankTransfers.findOne({
      where: { airwallexTransferId: transfer.id, userId },
    });

    if (!record) {
      return null;
    }
    return await record.update(mapTransferToRecord(transfer));
  } catch (error) {
    throw new Error(`Failed to update transfer record: ${error.message}`);
  }
}

export async function getTransferByAirwallexId(airwallexTransferId) {
  try {
    return await AirwallexBeneficiaryDirectBankTransfers.findOne({
      where: { airwallexTransferId },
    });
  } catch (error) {
    throw new Error(`Failed to fetch transfer by Airwallex ID: ${error.message}`);
  }
}
