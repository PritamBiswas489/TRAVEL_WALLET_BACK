export async function up(queryInterface, Sequelize) {
  console.log('🟢 Migration running: create-airwallex-kyc-account');

  await queryInterface.createTable(
  'airwallex_kyc_account',
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    // Top-level Airwallex account fields
    airwallexAccountId: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Airwallex account id (e.g. acct_xxx)',
    },
    identifier: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    nickname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'e.g. CREATED, ACTIVE, etc.',
    },
    viewType: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'e.g. COMPLETE',
    },

    // account_details — legal entity
    legalEntityId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    legalEntityIdentifier: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    legalEntityType: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'e.g. INDIVIDUAL, BUSINESS',
    },

    // account_details.attachments
    additionalFiles: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    // account_details.individual_details
    firstName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    firstNameEnglish: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lastNameEnglish: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    middleName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    middleNameEnglish: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'YYYY-MM-DD format',
    },
    employer: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    estimatedMonthlyIncome: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    hasMemberHoldingPublicOffice: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    hasPriorFinancialInstitutionRefusal: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    liveSelfieFileId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    nationality: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '2-letter ISO 3166-2 country code',
    },
    occupation: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // FIXED: was STRING, should be JSONB (object with first_name, last_name, middle_name)
    otherNames: {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'object with first_name, last_name, middle_name sub-fields',
    },
    personId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    photoHoldingIdentificationFileId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    residentialAddress: {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'address_line1, address_line2, country_code, postcode, state, suburb',
    },
    residentialAddressEnglish: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    identifications: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'primary identification object (DRIVERS_LICENSE, PASSPORT, PERSONAL_ID)',
    },
    accountUsage: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'card_usage, collection_country_codes, collection_from, expected_monthly_transaction_volume, payout_country_codes, payout_to, product_reference',
    },
    individualDocuments: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'account_details.individual_details.attachments.individual_documents — must include PROOF_OF_ADDRESS tag',
    },

    // account_details.business_details / business_person_details / trustee_details
    businessDetails: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    businessPersonDetails: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    trusteeDetails: {
      type: Sequelize.JSONB,
      allowNull: true,
    },

    // customer_agreements
    agreedToDataUsage: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    agreedToTermsAndConditions: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    // ADDED: required for IL individual KYC
    agreedToBiometricsConsent: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      comment: 'Required for IL - consent to collect and process biometrics data',
    },
    serviceAgreementType: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'e.g. FULL',
    },
    deviceData: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'customer_agreements.terms_and_conditions.device_data',
    },

    // primary_contact
    primaryContactEmail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    primaryContactIdentityFiles: {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'primary_contact.attachments.identity_files',
    },

    // Airwallex-side timestamp
    airwallexCreatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'created_at returned by Airwallex',
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    supportsSearchPath: false,
  }
);


  await queryInterface.addIndex('airwallex_kyc_account', ['userId'], {
    name: 'idx_airwallex_kyc_account_userId',
  });

  await queryInterface.addIndex('airwallex_kyc_account', ['airwallexAccountId'], {
    name: 'idx_airwallex_kyc_account_airwallexAccountId',
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('airwallex_kyc_account', {
    supportsSearchPath: false,
  });
}
