import "../config/environment.js";
import db from "../databases/models/index.js";
import UserService from "../services/user.service.js";
const { AirwallexKycAccount } = db;

const findUserKyc = async (req) => {
  const userId = req.user?.id;
  const activeKyc = userId
    ? await UserService.getUserAirwallexKycDetails({ whereFields: { userId } })
    : null;

  // console.log("Active KYC:", activeKyc);
  if (activeKyc) {
    const { airwallexAccountId } = activeKyc;
    ["body", "params", "query"].forEach((key) => {
      if (req[key] && typeof req[key] === "object") {
        req[key].airwallexAccountId = airwallexAccountId;
      }
    });
  }

  return activeKyc;
};

const sendError = (req, res, messageKey) =>
  res.send({
    status: 400,
    data: [],
    error: { message: req.headers.i18n.__(messageKey) },
  });

export const needKycAccount = async (req, res, next) => {
  try {
    const activeKyc = await findUserKyc(req);

    if (!activeKyc) {
      return sendError(req, res, "ACTIVE_KYC_NOT_FOUND");
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export const needActiveKycAccount = async (req, res, next) => {
  try {
    const activeKyc = await findUserKyc(req);

    if (!activeKyc) {
      return sendError(req, res, "ACTIVE_KYC_NOT_FOUND");
    }

    if (activeKyc.status !== "ACTIVE") {
      return sendError(req, res, "KYC_NOT_ACTIVE");
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
