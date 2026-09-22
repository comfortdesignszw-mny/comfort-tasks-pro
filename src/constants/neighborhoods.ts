export const POPULAR_HOODS = [
  'All Hoods',
  'Avondale',
  'Borrowdale',
  'CBD / Central',
  'Belgravia',
  'Eastlea',
  'Mount Pleasant',
  'Highlands',
  'Avenues',
  'Mabelreign',
  'Greendale',
  'Westgate',
  'Braeside',
  'Waterfalls',
  'Chitungwiza',
  'Downtown',
  'Midtown',
  'Brooklyn',
  'Queens'
];

export const formatWhatsAppLink = (rawPhone: string, message: string): string => {
  // Clean phone number: keep only digits
  let cleaned = rawPhone.replace(/\D/g, '');
  
  // If starts with 0 (e.g. 077... or 071...), convert to international if possible or default to standard
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    // default to Zimbabwe code +263 or generic if 10 digits starting with 0
    cleaned = '263' + cleaned.substring(1);
  }
  
  // If still empty or very short, use placeholder
  if (!cleaned || cleaned.length < 5) {
    cleaned = '1234567890';
  }
  
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};
