import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "~/controllers/product.server";

const schema = Z.object({
  categoryId: Z.string().optional(),
  categoryName: Z.string({
    required_error: "Category Name is Require",
  }),
  action: Z.string().optional(),
}).refine(
  (data) =>
    data.action === "createCategory" ||
    data.action === "updateCategory" ||
    data.action === "deleteCategory",
  {
    message: "Method Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const loader: LoaderFunction = async () => {
  return redirect("/product");
};

export const action: ActionFunction = async ({ request }) => {
  // Delete
  if (request.method === "DELETE") {
    const { action, categoryId } = Object.fromEntries(await request.formData());
    if (typeof action !== "string" && typeof categoryId !== "string")
      return json({ success: false }, { status: 400 });

    if (action === "deleteCategory") {
      const result = await deleteCategory(String(categoryId));
      if (!result) return json({ success: false }, { status: 400 });
      return json({ success: true }, { status: 200 });
    }
    return json(
      { success: false, message: "Internal Server error" },
      { status: 500 }
    );
  }

  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) return json({ success: false }, { status: 400 });

  if (request.method === "POST" && formData.action === "createCategory") {
    const result = await createCategory(String(formData.categoryName));
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }

  if (request.method === "PUT" && formData.action === "updateCategory") {
    const result = await updateCategory(
      formData.categoryId as string,
      formData.categoryName as string
    );
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }

  return json(
    { success: false, message: "Internal Server Error" },
    { status: 500 }
  );
};
