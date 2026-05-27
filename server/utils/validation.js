const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  const blockedDomains = ['yopmail.com', 'tempmail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.email', 'sharklasers.com', 'grr.la', 'dispostable.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (blockedDomains.includes(domain)) return false;
  
  return true;
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateName = (name) => {
  return name.trim().length >= 2;
};

const validateUPI = (upi) => {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upi);
};

module.exports = { validateEmail, validatePhone, validatePassword, validateName, validateUPI };
