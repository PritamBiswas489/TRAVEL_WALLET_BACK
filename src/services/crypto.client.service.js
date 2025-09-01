import "../config/environment.js";
import { randomBytes } from "crypto";
import CryptoService from "./crypto.service.js";

const CLIENT_X25519_PRIV_PEM = process.env.CLIENT_X25519_PRIV_PEM;
const CLIENT_ED25519_PRIV_PEM = process.env.CLIENT_ED25519_PRIV_PEM;
const SERVER_X25519_PUB_PEM = process.env.SERVER_X25519_PUB_PEM;

export async function buildEncryptedRequest(payload) {
  const salt = randomBytes(16);
  const aesKey = await CryptoService.deriveAesKey({
    privPem: CLIENT_X25519_PRIV_PEM,
    pubPem: SERVER_X25519_PUB_PEM,
    salt,
  });

  const enc = await CryptoService.encryptJson(aesKey, {
    ...payload,
    ts: Date.now(),
  });

  const envelope = {
    salt: salt.toString("base64"),
    iv: enc.iv,
    ct: enc.ct,
    tag: enc.tag,
    kid: "client-v1",
  };

  const sig = await CryptoService.signEnvelope(
    CLIENT_ED25519_PRIV_PEM,
    envelope
  );

  return { envelope, sig };
}
