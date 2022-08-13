import { json } from "@remix-run/node";
import { prisma } from "../utils/prisma.server";

type FormSupplier = {
  supplierName: string;
  phone: string;
  address: string;
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
