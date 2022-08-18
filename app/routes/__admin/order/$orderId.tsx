import { Paper, Title } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getOrderId } from "~/controllers/order.server";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ params }) => {
  const data = params.orderId;
  if (!data) return json({ success: false }, { status: 400 });
  const dataOrder = await getOrderId(data);
  if (!dataOrder) return json({ success: false }, { status: 400 });

  return json({ success: true, dataOrder: dataOrder }, { status: 200 });
};
export default function OrderId() {
  const { dataOrder } = useLoaderData();
  console.log(dataOrder);
  return (
    <>
      <Paper
        radius='md'
        p='xl'
        withBorder
        style={{
          borderWidth: "0px 0px 0px 5px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}>
        <Title order={3}>Order Detail</Title>
      </Paper>
    </>
  );
}
