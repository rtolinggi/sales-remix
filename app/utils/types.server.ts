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
  userId: string | null;
  email: string | undefined;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  jobTitle: string;
  phone: string;
  joinDate: string | null;
  isActive: boolean | undefined;
  address: string | null;
  birthDay: String | null;
  endDate: string | null;
};

export type StoreTable = {
  storeId: string;
  storeName: string;
  ownerName: string | null;
  address: string;
  phone: string;
  subClusterId: number | null;
  subClusterName: string | null | undefined;
};

export type SupplierTable = {
  supplierId: number;
  supplierName: string;
  phone: string;
  address: string;
};
