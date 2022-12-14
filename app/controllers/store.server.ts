import { prisma } from "../utils/prisma.server";
import { json } from "@remix-run/node";

export type FormStore = {
  storeId?: string;
  subClusterId: string;
  storeName: string;
  ownerName: string;
  address: string;
  phone: string;
  actions?: string;
};

export const getDataStore = async () => {
  try {
    const dataStore = await prisma.stores.findMany({
      select: {
        storeId: true,
        storeName: true,
        ownerName: true,
        phone: true,
        address: true,
        subClusterId: true,
        createdAt: true,
        updatedAt: true,
        subClusters: {
          select: {
            subClusterName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!dataStore) return false;
    return dataStore;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};
export const createStore = async (data: FormStore) => {
  try {
    const insertDataStore = await prisma.stores.create({
      data: {
        subClusterId: parseInt(JSON.parse(data.subClusterId)),
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

export const updateStore = async (data: FormStore) => {
  try {
    const updateDataStore = await prisma.stores.update({
      where: {
        storeId: data.storeId,
      },
      data: {
        storeId: data.storeId,
        subClusterId: parseInt(JSON.parse(data.subClusterId)),
        storeName: data.storeName,
        ownerName: data.ownerName,
        address: data.address,
        phone: data.phone,
      },
    });

    if (!updateDataStore) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};

export const deleteStore = async (idStore: string) => {
  try {
    const deleteStoreData = await prisma.stores.delete({
      where: {
        storeId: idStore,
      },
    });
    if (!deleteStoreData) return json({ success: false }, { status: 400 });
    return deleteStoreData;
  } catch (error) {
    console.log(error);
    json({ success: false, error }, { status: 500 });
  }
};
