import { prisma } from "../utils/prisma.server";
import { json } from "@remix-run/node";

export type FormStore = {
  subClusterId: string;
  storeName: string;
  ownerName: string;
  address: string;
  phone: string;
  actions?: string;
};

export const createStore = async (data: FormStore) => {
  try {
    const insertDataStore = await prisma.stores.create({
      data: {
        subClusterId: parseInt(data.subClusterId),
        storeName: data.storeName,
        ownerName: data.ownerName,
        address: data.address,
        phone: data.phone,
      },
    });

    if (!insertDataStore) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};
