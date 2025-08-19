import crypto from 'crypto';

function randomSaltHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex'); // 32 hex chars
}
console.log(randomSaltHex()); // Example usage
 