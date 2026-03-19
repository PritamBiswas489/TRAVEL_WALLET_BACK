/**
 * CRC-16 CCITT (0x1021) Utility
 * Used for Thai QR Code validation and Verify Slip QR generation
 * Polynomial: 0x1021 | Initial value: 0xFFFF
 */

/**
 * Calculate CRC-16 CCITT checksum over a string
 * @param {string} data - ASCII string to compute CRC over
 * @returns {string} 4-character uppercase hex CRC value
 */
export function calculateCRC16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Validate CRC-16 of a Thai QR payload
 * CRC tag is "63", calculated over all payload EXCLUDING the 4-char CRC value
 * @param {string} qrPayload - Full raw QR string
 * @returns {{ valid: boolean, expected: string, found: string }}
 */
export function validateQRCRC(qrPayload) {
  // CRC covers everything up to and including "6304" (tag+length of CRC)
  const crcIndex = qrPayload.indexOf("6304");
  if (crcIndex === -1) {
    return { valid: false, expected: null, found: null, error: "CRC tag 63 not found" };
  }

  const dataForCRC = qrPayload.substring(0, crcIndex + 4); // include "6304"
  const foundCRC = qrPayload.substring(crcIndex + 4, crcIndex + 8).toUpperCase();
  const expectedCRC = calculateCRC16(dataForCRC);

  return {
    valid: expectedCRC === foundCRC,
    expected: expectedCRC,
    found: foundCRC,
  };
}

/**
 * Append CRC-16 to a partial QR payload string
 * @param {string} payloadWithoutCRC - payload ending at "6304"
 * @returns {string} complete payload with CRC appended
 */
export function appendCRC16(payloadWithoutCRC) {
  const crc = calculateCRC16(payloadWithoutCRC);
  return payloadWithoutCRC + crc;
}
