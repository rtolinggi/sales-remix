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
  isActive: string;
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
    const insertEmployee = await prisma.employees.create({
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
    const updateUserActive = await prisma.users.update({
      where: {
        userId: data.userId,
      },
      data: {
        isActive: Boolean(data.isActive),
      },
    });

    if (insertEmployee && updateUserActive) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return json({ error: "Internal server error", status: 500 });
  }
};

export const deleteEmployee = async (data: string) => {
  try {
    const employeeId = await prisma.users.findFirst({
      where: {
        email: data,
      },
      select: {
        employees: {
          select: {
            employeeId: true,
          },
        },
      },
    });

    //   if (employeeId) {
    //  const deleteEmployeWithUser = await prisma.employees.delete({
    //   where: {
    //     employeeId: employeeId.
    //   }
    // })
    return employeeId;
  } catch (error) {
    console.log(error);
    return false;
  }
};
