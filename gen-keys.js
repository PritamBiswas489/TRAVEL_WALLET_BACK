// gen-keys.js
import { generateKeyPairSync } from "crypto";

// Key agreement pair (X25519)
const clientKA = generateKeyPairSync("x25519");
const serverKA = generateKeyPairSync("x25519");

// Signature pair (Ed25519)
const clientSIG = generateKeyPairSync("ed25519");
const serverSIG = generateKeyPairSync("ed25519");

function exportKeypair(name, kp) {
  console.log(`${name}Public = \n`, kp.publicKey.export({ type: "spki", format: "pem" }));
  console.log(`${name}Private = \n`, kp.privateKey.export({ type: "pkcs8", format: "pem" }));
}

// Client keys
exportKeypair("clientX25519", clientKA);
exportKeypair("clientEd25519", clientSIG);

// Server keys
exportKeypair("serverX25519", serverKA);
exportKeypair("serverEd25519", serverSIG);
