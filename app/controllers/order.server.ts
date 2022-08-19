import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { status_order } from "@prisma/client";

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
    if (!resultOrder) return null;

    const order = {
      orderId: resultOrder?.orderId,
      sales: `${resultOrder?.employees.firstName} ${resultOrder?.employees.lastName}`,
      storeName: resultOrder?.stores.storeName,
      storePhone: resultOrder?.stores.phone,
      storeAddress: resultOrder?.stores.address,
      grandTotal: resultOrder.total?.toString() as string,
    };

    return order;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const getOrderDetailId = async (id: string) => {
  try {
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
            productId: true,
          },
        },
      },
    });
    if (!resultDetailOrder) return null;

    const detail = resultDetailOrder.map((item) => {
      return {
        productId: item.products.productId.toString(),
        productName: item.products.productName,
        quantity: item.quantity.toString(),
        status: String(item.status),
        price: item.products.price.toString(),
        total: (item.products.price * item.quantity).toString(),
      };
    });

    return detail;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
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

export const updateStatusOrderItem = async (data: {
  orderId: string;
  productId: string;
  status: status_order;
}) => {
  try {
    const result = await prisma.oreders_detail.update({
      where: {
        orderId_productId: {
          orderId: data.orderId,
          productId: Number(data.productId),
        },
      },
      data: {
        status: data.status,
      },
    });

    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
