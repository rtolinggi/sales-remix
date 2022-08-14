import { json } from "@remix-run/node";
import { prisma } from "../utils/prisma.server";

export type FormSupplier = {
  supplierId?: string;
  supplierName: string;
  phone: string;
  address: string;
  action?: string;
};

export const createSupplier = async (data: FormSupplier) => {
  try {
    const insertSupplier = await prisma.suppliers.create({
      data: {
        supplierName: data.supplierName,
        phone: data.phone,
        address: data.address,
      },
    });
    if (!insertSupplier) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const getSupplier = async () => {
  try {
    const getDataSupplier = await prisma.suppliers.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return getDataSupplier;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};

export const updateSupplier = async (data: FormSupplier) => {
  try {
    const update = await prisma.suppliers.update({
      where: {
        supplierId: parseInt(JSON.parse(data.supplierId as string)),
      },
      data: {
        supplierName: data.supplierName,
        phone: data.phone,
        address: data.address,
      },
    });

    if (!update) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const deleteSupplier = async (id: string) => {
  try {
    const remove = await prisma.suppliers.delete({
      where: {
        supplierId: parseInt(JSON.parse(id)),
      },
    });
    if (!remove) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};
