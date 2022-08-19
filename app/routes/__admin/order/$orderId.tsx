import { Box, Divider, Grid, Paper, Table, Text, Title } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getOrderDetailId, getOrderId } from "~/controllers/order.server";
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
  const order = await getOrderId(data);
  const detail = await getOrderDetailId(data);

  if (!order || !detail) return json({ success: false }, { status: 400 });

  return json({ success: true, order, detail }, { status: 200 });
};

export default function OrderDetail() {
  const { order, detail } = useLoaderData<LoaderProps>();

  let sumQuantity: number = detail.reduce(
    (curr, val) => curr + Number(val.quantity),
    0
  );

  let sumGrandTotal: number = detail.reduce(
    (curr, val) => curr + Number(val.total),
    0
  );

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
        <Title order={3}>Order ID : {order.orderId}</Title>
      </Paper>
      <Paper
        shadow='sm'
        radius='md'
        style={{
          width: "100%",
          padding: "20px 30px",
          overflow: "auto",
          marginTop: "1rem",
        }}>
        <Divider my={10} />
        <Grid align='center' grow>
          <Grid.Col span={3}>
            <Text weight={700}>Sales Name</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.sales}</Grid.Col>
        </Grid>
        <Divider my={10} />
        <Grid align='center' grow>
          <Grid.Col span={3}>
            <Text weight={700}>Stoer Name</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.storeName}</Grid.Col>
        </Grid>
        <Divider my={10} />
        <Grid align='center' grow>
          <Grid.Col span={3}>
            <Text weight={700}>Phone</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.storePhone}</Grid.Col>
        </Grid>
        <Divider my={10} />
        <Grid align='center' grow>
          <Grid.Col span={3}>
            <Text weight={700}>Address</Text>
          </Grid.Col>
          <Grid.Col span={3}>{order.storeAddress}</Grid.Col>
        </Grid>
        <Divider my={10} />
      </Paper>
      <Paper
        shadow='sm'
        radius='md'
        style={{
          width: "100%",
          padding: "20px 30px",
          overflow: "auto",
          marginTop: "1rem",
        }}>
        <Table verticalSpacing='md' striped highlightOnHover>
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
                <td>{formatRupiah(item.price, "Rp. ")}</td>
                <td>{formatRupiah(item.total, "Rp. ")}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Box style={{ width: "350px", marginTop: "1rem" }}>
          <Table verticalSpacing='md'>
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Text weight={700}>Total Quantity</Text>
                </td>
                <td>
                  <Text weight={700}>{sumQuantity.toString()}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text weight={700}>Total Item</Text>
                </td>
                <td>
                  <Text weight={700}>{detail.length.toString()}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text weight={700}>Grand Total</Text>
                </td>
                <td>
                  <Text weight={700}>
                    {formatRupiah(sumGrandTotal.toString(), "Rp. ")}
                  </Text>
                </td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </Table>
        </Box>
      </Paper>
    </>
  );
}

function formatRupiah(angka: string, prefix: string) {
  var number_string = angka.replace(/[^,\d]/g, "").toString(),
    split = number_string.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  // tambahkan titik jika yang di input sudah menjadi angka ribuan
  if (ribuan) {
    let separator: string;
    separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
  return prefix == undefined ? rupiah : rupiah ? "Rp. " + rupiah : "";
}
