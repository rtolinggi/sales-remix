import { prisma } from "../utils/prisma.server";
import type { employees_gender } from "@prisma/client";
import { json } from "@remix-run/node";

export type FormEmployee = {
  userId: string;
  firstName: string;
  lastName: string;
  gender: employees_gender;
  birthDay: string;
  address: string;
  phone: string;
  joinDate: string;
  endDate: string;
  jobTitle: string;
  actions?: string;
};

export const getEmployee = async () => {
  try {
    const employees = prisma.employees.findMany({
      include: {
        users: true,
      },
    });
    return employees;
  } catch (error) {
    console.log(error);
  }
};
export const getEmail = async () => {
  try {
    const email = await prisma.users.findMany({
      include: {
        employees: true,
      },
      where: {
        employees: null,
      },
    });
    return email;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const createEmployee = async (data: FormEmployee) => {
  try {
    const result = await prisma.employees.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        birthDay: new Date(data.birthDay),
        joinDate: new Date(data.joinDate),
        endDate: new Date(data.endDate),
        address: data.address,
        phone: data.phone,
        gender: data.gender,
      },
    });
    return result;
  } catch (error) {
    console.log(error);
    return json({ error: "Internal server error", status: 500 });
  }
};
