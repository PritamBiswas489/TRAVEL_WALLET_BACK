import db from "../databases/models/index.js";

const { AirwallexBeneficiaryList } = db;

export async function createBeneficiary(beneficiaryData, userId) {
  try {
    const beneficiary = await AirwallexBeneficiaryList.create({
      userId,
      mainId: beneficiaryData.id,
      nickname: beneficiaryData.nickname,
      type: beneficiaryData.beneficiary.type,
      entityType: beneficiaryData.beneficiary.entity_type,
      payerEntityType: beneficiaryData.payer_entity_type,
      accountName: beneficiaryData.beneficiary.bank_details.account_name,
      accountNumber: beneficiaryData.beneficiary.bank_details.account_number,
      accountCurrency: beneficiaryData.beneficiary.bank_details.account_currency,
      bankName: beneficiaryData.beneficiary.bank_details.bank_name,
      bankCountryCode: beneficiaryData.beneficiary.bank_details.bank_country_code,
      swiftCode: beneficiaryData.beneficiary.bank_details.swift_code,
      streetAddress: beneficiaryData.beneficiary.address.street_address,
      city: beneficiaryData.beneficiary.address.city,
      state: beneficiaryData.beneficiary.address.state,
      postcode: beneficiaryData.beneficiary.address.postcode,
      countryCode: beneficiaryData.beneficiary.address.country_code,
      dateOfBirth: beneficiaryData.beneficiary.date_of_birth,
      personalEmail: beneficiaryData.beneficiary.additional_info.personal_email,
      transferMethods: beneficiaryData.transfer_methods,
    });

    return beneficiary;
  } catch (error) {
    throw new Error(`Failed to create beneficiary: ${error.message}`);
  }
}

export async function getBeneficiariesByUser(userId, { page = 1, limit = 10 } = {}) {
  try {
    const { rows, count } = await AirwallexBeneficiaryList.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      beneficiaries: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch beneficiaries: ${error.message}`);
  }
}

export async function getBeneficiaryById(id) {
  try {
    return await AirwallexBeneficiaryList.findByPk(id);
  } catch (error) {
    throw new Error(`Failed to fetch beneficiary: ${error.message}`);
  }
}
