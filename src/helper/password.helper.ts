export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
  code?: string;
}

export const validatePassword = (
  password: string
): PasswordValidationResult => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long.",
      code: "password-too-short",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter.",
      code: "password-missing-lowercase",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter.",
      code: "password-missing-uppercase",
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character.",
      code: "password-missing-symbol",
    };
  }

  return { isValid: true };
};

export default {
  validatePassword,
};
