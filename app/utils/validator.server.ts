export const validateEmail = (email: string): string | undefined => {
  let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.length || !validEmail.test(email)) {
    return "Please enter a valid email address";
  }
};

export const validatePasswordHash = (
  passwordHash: string
): string | undefined => {
  if (passwordHash.length < 6) {
    return "Password min 6 characters";
  }
};

export const validateConfirmPassword = (
  password1: string,
  password2: string
): string | undefined => {
  if (password1 !== password2) {
    return "Password not Match";
  }
};
