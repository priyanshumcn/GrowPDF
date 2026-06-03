const DISPOSABLE_DOMAINS = [
  'yopmail.com','tempmail.com','temp-mail.org','guerrillamail.com','10minutemail.com',
  'mailinator.com','getnada.com','sharklasers.com','trashmail.com','fakeinbox.com',
  'throwawaymail.com','maildrop.cc','dispostable.com','mintemail.com','spamgourmet.com',
  'mailcatch.com','tempr.email','discard.email','spam4.me','mt2014.com'
];

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, error: 'Email is required' };
  const trimmed = email.trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(trimmed)) return { valid: false, error: 'Please enter a valid email address' };
  const domain = trimmed.split('@')[1];
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' };
  }
  return { valid: true, email: trimmed };
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return { valid: false, error: 'Phone is required' };
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  if (!/^\d{7,15}$/.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid phone number (7-15 digits)' };
  }
  return { valid: true, phone: cleaned };
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return { valid: false, error: 'Password is required' };
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (password.length > 128) return { valid: false, error: 'Password is too long' };
  if (!/[A-Za-z]/.test(password)) return { valid: false, error: 'Password must include a letter' };
  if (!/\d/.test(password)) return { valid: false, error: 'Password must include a number' };
  return { valid: true };
}

export function validateName(name) {
  if (!name || typeof name !== 'string') return { valid: false, error: 'Name is required' };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { valid: false, error: 'Name is too short' };
  if (trimmed.length > 80) return { valid: false, error: 'Name is too long' };
  return { valid: true, name: trimmed };
}

export function validateUPI(upi) {
  if (!upi || typeof upi !== 'string') return { valid: true, upi: '' };
  const trimmed = upi.trim();
  if (!/^[a-zA-Z0-9._-]{3,}@[a-zA-Z]{2,}$/.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid UPI ID (e.g. name@bank)' };
  }
  return { valid: true, upi: trimmed };
}
