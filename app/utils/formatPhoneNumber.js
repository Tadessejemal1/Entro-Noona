export const formatPhoneNumber = (phone) => {
  const icelandicPrefix = '354';
  const ethiopianPrefix = '251';
  const cleanedPhone = phone.replace(/[^+\d]/g, '');

  // Check if it starts with the Icelandic country code and not with '+'
  if (cleanedPhone.startsWith(icelandicPrefix) && !cleanedPhone.startsWith('+')) {
    return `+${cleanedPhone}`;
  }

  // Check if it starts with the Ethiopian country code and not with '+'
  if (cleanedPhone.startsWith(ethiopianPrefix) && !cleanedPhone.startsWith('+')) {
    return `+${cleanedPhone}`;
  }

  // If it doesn't start with '+', prepend '+' and the most likely country code based on length or other criteria
  if (!cleanedPhone.startsWith('+')) {
    // Assuming default to Icelandic if length suggests it
    if (cleanedPhone.length === 7 || cleanedPhone.length === 9) {
      return `+${icelandicPrefix}${cleanedPhone}`;
    }
    // Assuming Ethiopian if length matches typical formats
    else if (cleanedPhone.length === 9 || cleanedPhone.length === 10) {
      return `+${ethiopianPrefix}${cleanedPhone}`;
    }
  }

  // If none of the conditions above are met, return the phone as-is
  return cleanedPhone;
};
   