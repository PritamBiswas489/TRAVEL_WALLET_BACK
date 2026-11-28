
import redisClient from "../../config/redis.config.js";

const CACHE_TTL = 600; // 10 minutes

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

      // Legal entity
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

      // Attachments
      additionalFiles: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },

      // Individual details
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

      // Business and trustee details
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

      // Customer agreements
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

      // Primary contact
      primaryContactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primaryContactIdentityFiles: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },

      // Additional information
      airwallexCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      userInputData: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      webhookData: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
      },
      ahfiId: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'airwallex_kyc_account',
      timestamps: true,
    },
  );

  // ==================================================
  // REDIS CACHE HELPERS
  // ==================================================

  const getCacheKey = (field, value) => {
    if (value === null || value === undefined) {
      return null;
    }

    return `airwallex:kyc:${field}:${value}`;
  };

  const getInstanceCacheKeys = (data) => {
    if (!data) return [];

    return [
      getCacheKey('id', data.id),
      getCacheKey('userId', data.userId),
      getCacheKey('account', data.airwallexAccountId),
    ].filter(Boolean);
  };

  // Delete multiple cache keys using ioredis
  const deleteCacheKeys = async (keys = []) => {
    const uniqueKeys = [...new Set(keys.filter(Boolean))];

    if (!uniqueKeys.length) return;

    try {
      await redisClient.del(...uniqueKeys);
    } catch (error) {
      console.error(
        'Airwallex Redis cache deletion error:',
        error.message,
      );
    }
  };

  // Invalidate cache after transaction commits
  const invalidateAfterCommit = async (transaction, keys) => {
    if (transaction) {
      transaction.afterCommit(async () => {
        await deleteCacheKeys(keys);
      });
    } else {
      await deleteCacheKeys(keys);
    }
  };

  // ==================================================
  // CACHE-ENABLED FIND ONE
  // ==================================================

  AirwallexKycAccount.findOneCached = async function (options = {}) {
    const where = options.where || {};

    const supportedFields = [
      'id',
      'userId',
      'airwallexAccountId',
    ];

    const matchingFields = supportedFields.filter(
      (field) =>
        Object.prototype.hasOwnProperty.call(where, field) &&
        where[field] !== null &&
        where[field] !== undefined,
    );

    // Cache only simple queries with exactly one identifier.
    // Complex queries fall back to normal Sequelize findOne.
    const canUseCache =
      matchingFields.length === 1 &&
      Object.keys(where).length === 1 &&
      Object.keys(options).every((key) => key === 'where') &&
      !options.transaction;

    if (!canUseCache) {
      return this.findOne(options);
    }

    const field = matchingFields[0];
    const value = where[field];

    const cacheField =
      field === 'airwallexAccountId' ? 'account' : field;

    const cacheKey = getCacheKey(cacheField, value);

    // 1. Check Redis
    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log('Airwallex Redis cache hit for key:', cacheKey);
        try {
          const parsedData = JSON.parse(cachedData);

          return this.build(parsedData, {
            isNewRecord: false,
            raw: true,
          });
        } catch (parseError) {
          console.error(
            'Airwallex Redis cache parsing error:',
            parseError.message,
          );

          await deleteCacheKeys([cacheKey]);
        }
      }
    } catch (error) {
      console.error(
        'Airwallex Redis read error:',
        error.message,
      );
    }

    // 2. Cache MISS: Fetch from database
    console.log("Fetching from database for options:", options);
    const result = await this.findOne(options);

    if (!result) {
      return null;
    }

    // 3. Save the same record under all three identifiers
    try {
     
      const record = result.toJSON();
      const cacheKeys = getInstanceCacheKeys(record);

      const serializedData = JSON.stringify(record);

      await Promise.all(
        cacheKeys.map((key) =>
          redisClient.set(
            key,
            serializedData,
            'EX',
            CACHE_TTL,
          ),
        ),
      );
    } catch (error) {
      console.error(
        'Airwallex Redis write error:',
        error.message,
      );
    }

    return result;
  };

  // ==================================================
  // INSTANCE HOOKS
  // CREATE / UPDATE / DELETE
  // ==================================================

  // Capture old identifiers before updating
  AirwallexKycAccount.addHook(
    'beforeUpdate',
    (instance) => {
      instance._previousCacheIdentifiers = {
        id: instance.previous('id') ?? instance.id,
        userId: instance.previous('userId') ?? instance.userId,
        airwallexAccountId:
          instance.previous('airwallexAccountId') ??
          instance.airwallexAccountId,
      };
    },
  );

  // After creating a record
  AirwallexKycAccount.addHook(
    'afterCreate',
    async (instance, options) => {
      await invalidateAfterCommit(
        options.transaction,
        getInstanceCacheKeys(instance),
      );
    },
  );

  // After updating a record
  AirwallexKycAccount.addHook(
    'afterUpdate',
    async (instance, options) => {
      const oldKeys = getInstanceCacheKeys(
        instance._previousCacheIdentifiers,
      );

      const newKeys = getInstanceCacheKeys(instance);

      await invalidateAfterCommit(
        options.transaction,
        [...oldKeys, ...newKeys],
      );
    },
  );

  // After deleting a record
  AirwallexKycAccount.addHook(
    'afterDestroy',
    async (instance, options) => {
      await invalidateAfterCommit(
        options.transaction,
        getInstanceCacheKeys(instance),
      );
    },
  );

  // ==================================================
  // BULK UPDATE HOOKS
  // ==================================================

  // Capture identifiers before bulk update
  AirwallexKycAccount.addHook(
    'beforeBulkUpdate',
    async (options) => {
      const rows = await AirwallexKycAccount.findAll({
        where: options.where,
        attributes: [
          'id',
          'userId',
          'airwallexAccountId',
        ],
        transaction: options.transaction,
      });

      options._previousCacheRows = rows.map(
        (row) => row.toJSON(),
      );
    },
  );

  // Invalidate old and new identifiers after bulk update
  AirwallexKycAccount.addHook(
    'afterBulkUpdate',
    async (options) => {
      const keys = [];

      for (const row of options._previousCacheRows || []) {
        keys.push(...getInstanceCacheKeys(row));
      }

      const updatedValues = options.attributes || {};

      if (updatedValues.id !== undefined) {
        keys.push(getCacheKey('id', updatedValues.id));
      }

      if (updatedValues.userId !== undefined) {
        keys.push(
          getCacheKey('userId', updatedValues.userId),
        );
      }

      if (updatedValues.airwallexAccountId !== undefined) {
        keys.push(
          getCacheKey('account', updatedValues.airwallexAccountId),
        );
      }

      await invalidateAfterCommit(
        options.transaction,
        keys,
      );
    },
  );

  // ==================================================
  // BULK DELETE HOOKS
  // ==================================================

  // Capture identifiers before bulk delete
  AirwallexKycAccount.addHook(
    'beforeBulkDestroy',
    async (options) => {
      const rows = await AirwallexKycAccount.findAll({
        where: options.where,
        attributes: [
          'id',
          'userId',
          'airwallexAccountId',
        ],
        transaction: options.transaction,
        paranoid: options.force ? false : undefined,
      });

      options._cacheRowsToDelete = rows.map(
        (row) => row.toJSON(),
      );
    },
  );

  // Invalidate after bulk delete
  AirwallexKycAccount.addHook(
    'afterBulkDestroy',
    async (options) => {
      const keys = [];

      for (const row of options._cacheRowsToDelete || []) {
        keys.push(...getInstanceCacheKeys(row));
      }

      await invalidateAfterCommit(
        options.transaction,
        keys,
      );
    },
  );

  return AirwallexKycAccount;
}
