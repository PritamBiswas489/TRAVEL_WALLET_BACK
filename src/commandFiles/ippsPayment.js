import { parseThaiQR,mapQRToQueryParams } from "../libraries/ipps/qrParser.js";
let qrCode = "00020101021230820016A0000006770101120115010753600037405021500000220066077703204611316260181X00000053037645406178.225802TH5918LIMTRENDEMPORIUM6212070846113162630427E5";
//qrCode = "00020101021129390016A000000677010111031500499901412395353037645802TH630425F7";
const parsed = parseThaiQR(qrCode);
const walletId = "400110891234567";
const overrideAmount = 100; // Optional: only needed if parsed.amount is null
const queryParams = mapQRToQueryParams(parsed, walletId, overrideAmount ?? null);

console.log("Parsed QR:", parsed);
console.log("================================================")
console.log("Mapped Query Params:", queryParams);