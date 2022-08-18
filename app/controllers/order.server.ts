import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";

export type FormOrder = {
  orderId: string;
  orderDate: string;
  storeId: string;
  employeeId: string;
  total: string;
  storeName: string;
  firstName: string;
  lastName: string;
  action?: string;
};

export const getOrder = async () => {
  try {
    const result = await prisma.orders.findMany({
      select: {
        orderId: true,
        orderDate: true,
        storeId: true,
        employeeId: true,
        total: true,
        stores: {
          select: {
            storeName: true,
          },
        },
        employees: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal server Error" },
      { status: 500 }
    );
  }
};
