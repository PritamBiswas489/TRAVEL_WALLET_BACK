import { randomInt } from "node:crypto";
import { Op } from "sequelize";
import { hashStr, compareHashedStr } from "../../libraries/auth.js";

export async function lockActivationCodes(sequelize, userId, transaction) {
  if (!transaction || userId == null) {
    throw new Error("Activation code generation requires a user and transaction");
  }
  await sequelize.query(
    "SELECT pg_advisory_xact_lock(hashtext(:namespace), hashtext(:userId))",
    {
      replacements: {
        namespace: "controlled_profile_activation",
        userId: String(userId),
      },
      transaction,
    },
  );
}

export async function generateActivationCode(profile, transaction) {
  await lockActivationCodes(profile.sequelize, profile.userId, transaction);
  const existingProfiles = await profile.constructor.findAll({
    attributes: ["activation_code_hash"],
    where: {
      userId: profile.userId,
      activation_code_hash: { [Op.ne]: null },
    },
    transaction,
  });

  for (let attempt = 0; attempt < 100; attempt++) {
    const code = String(randomInt(10000)).padStart(4, "0");
    let duplicate = false;
    for (const existing of existingProfiles) {
      if (await compareHashedStr(code, existing.activation_code_hash)) {
        duplicate = true;
        break;
      }
    }
    if (duplicate) continue;

    await profile.update(
      { activation_code_hash: await hashStr(code) },
      { transaction, hooks: false, silent: true },
    );
    return code;
  }
  throw new Error("Unable to generate a unique activation code");
}

export default function ControlledProfiles(sequelize, DataTypes) {
  return sequelize.define(
    "ControlledProfiles",
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
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      name: {
        type: DataTypes.STRING(100),
      },
      profile_type: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      balance_visibility: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      spending_limits: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      permissions: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      mobile_device_details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      activation_code_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "controlled_profiles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeCreate(profile, options) {
          if (!options.transaction || profile.userId == null) {
            throw new Error("Controlled profile creation requires a user and transaction");
          }
        },
        async afterCreate(profile, options) {
          const code = await generateActivationCode(profile, options.transaction);
          Object.defineProperty(profile, "activationCode", { value: code });
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["userId", "activation_code_hash"],
          name: "controlled_profiles_userId_activation_code_hash_unique",
        },
      ],
    },
  );
}