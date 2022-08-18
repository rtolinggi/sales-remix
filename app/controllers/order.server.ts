import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { Order } from "../routes/__admin/order/$orderId";

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

export const getOrderId = async (id: string) => {
  try {
    const resultOrder = await prisma.orders.findUnique({
      where: {
        orderId: id,
      },
      select: {
        orderId: true,
        employees: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        stores: {
          select: {
            storeName: true,
            phone: true,
            address: true,
          },
        },
        total: true,
      },
    });

    const resultDetailOrder = await prisma.oreders_detail.findMany({
      where: {
        orderId: id,
      },
      select: {
        quantity: true,
        status: true,
        products: {
          select: {
            productName: true,
            price: true,
          },
        },
      },
    });

    if (!resultOrder || !resultDetailOrder) return null;

    const detail = resultDetailOrder.map((item) => {
      return {
        productName: item.products.productName,
        quantity: item.quantity,
        status: item.status,
        price: item.products.price,
        total: item.products.price * item.quantity,
      };
    });

    const order: Order = {
      orderId: resultOrder?.orderId,
      sales: `${resultOrder?.employees.firstName} ${resultOrder?.employees.lastName}`,
      storeName: resultOrder?.stores.storeName,
      storePhone: resultOrder?.stores.phone,
      storeAddress: resultOrder?.stores.address,
      grandTotal: resultOrder.total?.toString() as string,
    };

    return { order, detail };
  } catch (error) {
    console.log(error);
    return json(
      { success: false, message: "Inernal Server Error" },
      { status: 500 }
    );
  }
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
