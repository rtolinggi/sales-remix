import { json } from "@remix-run/node";
import { prisma } from "../utils/prisma.server";

export type FormProduct = {
  productId?: string;
  categoryId: string;
  supplierId: string;
  productName: string;
  price: string;
  description: string;
  action?: string;
};
export const getProduct = async () => {
  try {
    const result = await prisma.products.findMany({
      select: {
        productId: true,
        categoryId: true,
        supplierId: true,
        productName: true,
        price: true,
        description: true,
        categorys: {
          select: {
            categoryName: true,
          },
        },
        suppliers: {
          select: {
            supplierName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json(
      { success: true, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const createProduct = async (data: FormProduct) => {
  try {
    const result = await prisma.products.create({
      data: {
        categoryId: parseInt(data.categoryId),
        supplierId: parseInt(data.supplierId),
        productName: data.productName,
        price: parseInt(data.price),
        description: data.description,
      },
    });
    if (!result) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal Server Errorkl" },
      { status: 500 }
    );
  }
};

export const deleteProduct = async (idProduct: string) => {
  try {
    const deleteProductData = await prisma.products.delete({
      where: {
        productId: parseInt(idProduct),
      },
    });
    if (!deleteProductData) return false;
    return deleteProductData;
  } catch (error) {
    console.log(error);
    json({ success: false, error }, { status: 500 });
  }
};

export const updateProduct = async (data: FormProduct) => {
  try {
    const result = await prisma.products.update({
      where: {
        productId: parseInt(JSON.parse(data.productId as string)),
      },
      data: {
        categoryId: parseInt(JSON.parse(data.categoryId)),
        supplierId: parseInt(JSON.parse(data.categoryId)),
        price: parseInt(JSON.parse(data.price)),
        productName: data.productName,
        description: data.description,
      },
    });
    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};

export const getCategory = async () => {
  try {
    const result = await prisma.categorys.findMany({
      orderBy: {
        categoryId: "desc",
      },
    });
    if (!result) return false;
    return result;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};

export const createCategory = async (data: string) => {
  try {
    const insertCategory = await prisma.categorys.create({
      data: {
        categoryName: data,
      },
    });
    if (!insertCategory) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json({ success: false }, { status: 500 });
  }
};

export const deleteCategory = async (data: string) => {
  try {
    const result = await prisma.categorys.delete({
      where: {
        categoryId: parseInt(JSON.parse(data)),
      },
    });
    if (!result) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const updateCategory = async (id: string, name: string) => {
  try {
    const result = await prisma.categorys.update({
      where: {
        categoryId: parseInt(JSON.parse(id)),
      },
      data: {
        categoryName: name,
      },
    });
    if (!result) return false;
    return true;
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
