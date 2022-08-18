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
  subClusterId: string | undefined;
  subClusterName: string | null | undefined;
  createdAt: string;
  updatedAt: string;
};

export type SupplierTable = {
  supplierId: string;
  supplierName: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderTable = {
  orderId: string;
  orderDate: string;
  storeId: string;
  employeeId: string;
  total: string;
  storeName: string;
  firstName: string;
  lastName: string;
};
