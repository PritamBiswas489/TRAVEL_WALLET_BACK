export default function AirwallexKycAccount(sequelize, DataTypes) {
  const AirwallexKycAccount = sequelize.define(
    'AirwallexKycAccount',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      // Top-level Airwallex account fields
      airwallexAccountId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      identifier: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      viewType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // account_details — legal entity
      legalEntityId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      legalEntityIdentifier: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      legalEntityType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // account_details.attachments
      additionalFiles: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },

      // account_details.individual_details
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstNameEnglish: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastNameEnglish: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      middleName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      middleNameEnglish: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      employer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estimatedMonthlyIncome: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hasMemberHoldingPublicOffice: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      hasPriorFinancialInstitutionRefusal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      liveSelfieFileId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      occupation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otherNames: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      personId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      photoHoldingIdentificationFileId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      residentialAddress: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      residentialAddressEnglish: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      identifications: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      accountUsage: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      individualDocuments: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },

      // account_details.business_details / business_person_details / trustee_details
      businessDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      businessPersonDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      trusteeDetails: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      // customer_agreements
      agreedToDataUsage: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      agreedToTermsAndConditions: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      agreedToBiometricsConsent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      serviceAgreementType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deviceData: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },

      // primary_contact
      primaryContactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primaryContactIdentityFiles: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },

      // Airwallex-side timestamp
      airwallexCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      userInputData: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
    },
    {
      tableName: 'airwallex_kyc_account',
      timestamps: true,
    },
  );

  return AirwallexKycAccount;
}
