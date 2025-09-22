// DRY Validation Functions

// Bank account validation
export const validateBankAccount = {
  routingNumber: (routing: string): boolean => {
    if (!/^\d{9}$/.test(routing)) return false;
    
    const digits = routing.split('').map(Number);
    const checksum = (3 * (digits[0] + digits[3] + digits[6]) + 
                     7 * (digits[1] + digits[4] + digits[7]) + 
                     digits[2] + digits[5] + digits[8]) % 10;
    return checksum === 0;
  },
  
  accountNumber: (account: string): boolean => {
    return /^\d{4,17}$/.test(account);
  },
  
  bankName: (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s&.-]+$/.test(name);
  },
  
  accountHolderName: (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s.-]+$/.test(name);
  }
};

// Form validation
export const validateForm = {
  required: (value: unknown): boolean => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },
  
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },
  
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password: string): boolean => {
    return password.length >= 8;
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
};

// Validation error messages
export const validationMessages = {
  required: 'This field is required',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters',
  phone: 'Please enter a valid phone number',
  routingNumber: 'Please enter a valid 9-digit routing number',
  accountNumber: 'Please enter a valid account number',
  bankName: 'Please enter a valid bank name',
  accountHolderName: 'Please enter a valid account holder name'
};
