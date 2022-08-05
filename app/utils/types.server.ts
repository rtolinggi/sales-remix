export type RegisterForm = {
  email: string;
  passwordHash: string;
  confirmPassword: string;
};

export type LoginForm = {
  email: string;
  passwordHash: string;
};

export type EmployeeTable = {
  email: string | undefined;
  firstName: string;
  lastName: string;
  image: string;
  jobTitle: string;
  phone: string;
  joinDate: string | null;
  isActive: boolean | undefined;
};
