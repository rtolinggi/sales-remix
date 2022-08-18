import { Divider, Grid, Paper, Table, Text, Title } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getOrderId } from "~/controllers/order.server";
import { useLoaderData } from "@remix-run/react";

export type Detail = {
  price: string;
  productName: string;
  quantity: string;
  status: string;
  total: string;
};

export type Order = {
  orderId: string;
  sales: string;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  grandTotal: string;
};

export type LoaderProps = {
  success: boolean;
  order: Order;
  detail: Array<Detail>;
};

export const loader: LoaderFunction = async ({ params }) => {
  const data = params.orderId;
  if (!data) return json({ success: false }, { status: 400 });
  const { order, detail } = await getOrderId(data);

  if (!order || !detail) return json({ success: false }, { status: 400 });
  // const totalQuantity = detail.

  return json({ success: true, order, detail }, { status: 200 });
};

export default function OrderDetail() {
  const { order, detail } = useLoaderData<LoaderProps>();
  console.log("Detail : ", order);
  console.log(" Detail Order ", detail);

  return (
    <>
      <Paper
        radius="md"
        p="xl"
        withBorder
        style={{
          borderWidth: "0px 0px 0px 5px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}
      >
        <Title order={3}>Order ID : {order.orderId}</Title>
      </Paper>
      <Paper
        shadow="sm"
        radius="md"
        style={{
          width: "100%",
          padding: "20px",
          overflow: "auto",
          marginTop: "1rem",
        }}
      >
        <Divider my={10} />
        <Grid align="center" grow>
          <Grid.Col span={3}>
            <Text weight={700}>Sales Name</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.sales}</Grid.Col>
        </Grid>
        <Divider my={10} />
        <Grid align="center" grow>
          <Grid.Col span={3}>
            <Text weight={700}>Stoer Name</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.storeName}</Grid.Col>
        </Grid>
        <Divider my={10} />
        <Grid align="center" grow>
          <Grid.Col span={3}>
            <Text weight={700}>Phone</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.storePhone}</Grid.Col>
        </Grid>
        <Divider my={10} />
        <Grid align="center" grow>
          <Grid.Col span={3}>
            <Text weight={700}>Address</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.storeAddress}</Grid.Col>
        </Grid>
        <Divider my={10} />
        <Grid align="center" grow>
          <Grid.Col span={3}>
            <Text weight={700}>Grand Total</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.grandTotal}</Grid.Col>
        </Grid>
        <Divider my={10} />
      </Paper>
      <Paper
        shadow="sm"
        radius="md"
        style={{
          width: "100%",
          padding: "20px",
          overflow: "auto",
          marginTop: "1rem",
        }}
      >
        <Table verticalSpacing="md" striped highlightOnHover>
          <thead>
            <tr>
              <th>No .</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {detail.map((item, index) => (
              <tr key={index}>
                <td>{++index}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.total}</td>
                <td>{item.status}</td>
              </tr>
            ))}
            <tr>
              <td>TOTAL</td>
              <td>123123123</td>
            </tr>
          </tbody>
        </Table>
      </Paper>
    </>
  );
}
