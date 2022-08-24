import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getProduct } from "~/controllers/product.server";

export const loader: LoaderFunction = async () => {
  const result = await getProduct();
  if (!result) return json({ success: false }, { status: 400 });
  return json({ success: true, data: result }, { status: 200 });
};
