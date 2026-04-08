/** Client-side checks aligned with backend wallet recharge rules */

export function luhnCheck(cardNumber) {
  const digits = String(cardNumber).replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let parity = digits.length % 2;
  for (let i = 0; i < digits.length; i++) {
    let d = parseInt(digits[i], 10);
    if (i % 2 === parity) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function validateExpiryMMYY(value) {
  const m = /^(\d{2})\/(\d{2})$/.exec(String(value).trim());
  if (!m) return "Use MM/YY format.";
  const month = parseInt(m[1], 10);
  const year = parseInt(m[2], 10);
  if (month < 1 || month > 12) return "Invalid month.";
  const expYear = 2000 + year;
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth() + 1;
  if (expYear < y || (expYear === y && month < mo)) {
    return "This card has expired.";
  }
  return null;
}

export function validateRechargeForm({
  amount,
  cardholderName,
  cardNumber,
  expiryDate,
  cvv,
  billingAddress,
}) {
  const a = parseFloat(amount);
  if (!Number.isFinite(a) || a < 1) {
    return "Enter an amount of at least 1 EGP.";
  }
  const name = String(cardholderName || "").trim();
  if (name.length < 3) {
    return "Enter the full name as shown on the card.";
  }
  const rawCard = String(cardNumber || "").replace(/\D/g, "");
  if (rawCard.length < 13 || rawCard.length > 19) {
    return "Card number must be between 13 and 19 digits.";
  }
  if (!luhnCheck(rawCard)) {
    return "Card number is not valid.";
  }
  const expErr = validateExpiryMMYY(expiryDate);
  if (expErr) return expErr;
  const cv = String(cvv || "").replace(/\D/g, "");
  if (cv.length !== 3 && cv.length !== 4) {
    return "CVV must be 3 or 4 digits.";
  }
  if (String(billingAddress || "").trim().length < 8) {
    return "Enter a complete billing address.";
  }
  return null;
}

export function validateNationalIdEG(value) {
  const s = String(value || "").replace(/\D/g, "");
  if (s.length !== 14) return "National ID must be exactly 14 digits.";
  return null;
}

export function validatePhoneDigits(value) {
  const d = String(value || "").replace(/\D/g, "");
  if (d.length < 10 || d.length > 15) {
    return "Phone must be 10–15 digits.";
  }
  return null;
}
