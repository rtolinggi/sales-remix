import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";
import {
  createSubCluster,
  deleteSubCluster,
  updateSubCluster,
} from "~/controllers/cluster.server";

const schema = Z.object({
  id: Z.string().optional(),
  clusterId: Z.string({
    required_error: "Cluster id is Require",
  }),
  subClusterName: Z.string({
    required_error: "Sub Cluster Name is Require",
  }),
  action: Z.string().optional(),
}).refine(
  (data) =>
    data.action === "createSubCluster" ||
    data.action === "updateSubCluster" ||
    data.action === "deleteSubClustr",
  {
    message: "Method Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const loader: LoaderFunction = async () => {
  return redirect("/cluster");
};

export const action: ActionFunction = async ({ request }) => {
  // Delete
  if (request.method === "DELETE") {
    const { action, id } = Object.fromEntries(await request.formData());
    if (typeof action !== "string" && typeof id !== "string")
      return json({ success: false }, { status: 400 });

    if (action === "deleteSubCluster") {
      const result = await deleteSubCluster(String(id));
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

  const data = {
    clusterId: parseInt(JSON.parse(formData.clusterId)),
    subClusterName: formData.subClusterName,
  };

  if (request.method === "POST" && formData.action === "createSubCluster") {
    const result = await createSubCluster(data);
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }

  if (request.method === "PUT" && formData.action === "updateSubCluster") {
    const result = await updateSubCluster(data);
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }

  return json(
    { success: false, message: "Internal Server Error" },
    { status: 500 }
  );
};
