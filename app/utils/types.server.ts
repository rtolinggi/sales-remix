export type RegisterForm = {
  email: string;
  passwordHash: string;
  confirmPassword: string;
};

export type LoginForm = {
  email: string;
  passwordHash: string;
};
