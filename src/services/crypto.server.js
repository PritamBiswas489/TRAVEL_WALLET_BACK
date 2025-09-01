import "../config/environment.js";

 

import CryptoService from "./crypto.service.js";

const SERVER_X25519_PRIV_PEM = process.env.SERVER_X25519_PRIV_PEM;
const CLIENT_X25519_PUB_PEM = process.env.CLIENT_X25519_PUB_PEM;
const CLIENT_ED25519_PUB_PEM = process.env.CLIENT_ED25519_PUB_PEM;

export async function buildDecryptRequest(payload) {

    const { envelope, sig } = payload;
    if (!await CryptoService.verifyEnvelope(CLIENT_ED25519_PUB_PEM, envelope, sig)) {
      return { error: "Invalid signature" };
    }

    const salt = Buffer.from(envelope.salt, "base64");
    const aesKey = await CryptoService.deriveAesKey({
      privPem: SERVER_X25519_PRIV_PEM,
      pubPem: CLIENT_X25519_PUB_PEM,
      salt,
    });

    const data = await CryptoService.decryptJson(aesKey, envelope);

    return data;

}