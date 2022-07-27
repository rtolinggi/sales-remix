import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

type LoaderData = {
  id: string;
  name: string;
  role: string;
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    id: "1138kAsej",
    name: "Rio Tolinggi",
    role: "Admin",
  };

  return json(
    {
      success: true,
      data,
    },
    200
  );
};

export default function Index() {
  const loader = useLoaderData();
  console.log(loader);

  return <>{loader.data.name}</>;
}
