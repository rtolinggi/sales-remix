import {
  Badge,
  Box,
  Button,
  LoadingOverlay,
  Menu,
  Paper,
  Table,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  deleteOrder,
  getOrderDetailId,
  getOrderId,
  updateStatusOrderItem,
} from "~/controllers/order.server";
import {
  Link,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import {
  IconArrowBack,
  IconChecks,
  IconDotsVertical,
  IconPaperclip,
  IconPrinter,
  IconTrash,
  IconX,
} from "@tabler/icons";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";
import type { status_order } from "@prisma/client";
import { openConfirmModal } from "@mantine/modals";

export type Detail = {
  productId: string;
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

const schema = Z.object({
  orderId: Z.string(),
  productId: Z.string(),
  status: Z.enum(["PENDING", "CONFIRM", "CANCEL"]),
  action: Z.string().optional(),
}).refine(
  (data) => data.action === "updateStatus" || data.action === "deleteOrder",
  {
    message: "Method Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) return json({ success: false, errors }, { status: 400 });

  const { ...newFormData } = formData;

  if (newFormData.action === "deleteOrder" && request.method === "DELETE") {
    const deleteOrderId = await deleteOrder(newFormData.orderId);
    if (!deleteOrderId) return json({ success: false }, { status: 400 });
    return redirect("/order");
  }

  if (newFormData.action === "updateStatus" && request.method === "PUT") {
    delete newFormData.action;
    const changeStatus = await updateStatusOrderItem({
      orderId: newFormData.orderId,
      productId: newFormData.productId,
      status: newFormData.status as status_order,
    });

    if (!changeStatus) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }
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
  const submit = useSubmit();
  const transition = useTransition();

  let sumQuantity: number = detail
    .filter((item) => {
      return item.status !== "CANCEL";
    })
    .reduce((curr, value) => curr + Number(value.quantity), 0);

  let sumGrandTotal: number = detail
    .filter((item) => {
      return item.status !== "CANCEL";
    })
    .reduce((curr, val) => curr + Number(val.total), 0);

  let sumTotalItem: number = detail.filter((item) => {
    return item.status !== "CANCEL";
  }).length;

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
        <Title order={3}>ORDER ID - {order.orderId}</Title>
      </Paper>
      <Paper
        shadow="sm"
        radius="md"
        style={{
          width: "100%",
          padding: "20px 30px",
          overflow: "auto",
          marginTop: "1rem",
        }}
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Link to={"/order"}>
              <Button leftIcon={<IconArrowBack size={20} />}>Back</Button>
            </Link>
            <Button leftIcon={<IconPrinter size={20} />} ml={10}>
              Print
            </Button>
          </Box>
          <Box>
            <Button
              leftIcon={<IconTrash size={20} />}
              onClick={() =>
                openConfirmModal({
                  title: "Delete Order",
                  centered: true,
                  children: (
                    <Text size="sm">
                      Are you sure you want to delete Order {order.orderId}?
                    </Text>
                  ),
                  labels: {
                    confirm: "Delete Order",
                    cancel: "No don't delete it",
                  },
                  onCancel: () => console.log("Cancel"),
                  onConfirm: () => {
                    submit(
                      {
                        orderId: order.orderId,
                        productId: order.orderId,
                        status: "CANCEL",
                        action: "deleteOrder",
                      },
                      { method: "delete" }
                    );
                  },
                })
              }
            >
              Delete
            </Button>
          </Box>
        </Box>
        <Table verticalSpacing="md">
          <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Text weight={700}>Sales Name</Text>
              </td>
              <td>
                <Text>{order.sales}</Text>
              </td>
            </tr>
            <tr>
              <td>
                <Text weight={700}>Store Name</Text>
              </td>
              <td>
                <Text>{order.storeName}</Text>
              </td>
            </tr>
            <tr>
              <td>
                <Text weight={700}>Phone</Text>
              </td>
              <td>
                <Text>{order.storePhone}</Text>
              </td>
            </tr>
            <tr>
              <td>
                <Text weight={700}>Address</Text>
              </td>
              <td>
                <Text>{order.storeAddress}</Text>
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </Paper>
      <Paper
        shadow="sm"
        radius="md"
        style={{
          width: "100%",
          padding: "20px 30px",
          overflow: "auto",
          marginTop: "1rem",
        }}
      >
        <Paper style={{ overflow: "auto" }}>
          <LoadingOverlay
            visible={
              transition.state === "submitting" ||
              transition.state === "loading"
            }
          />
          <Table verticalSpacing="md" striped highlightOnHover>
            <thead>
              <tr>
                <th>No .</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
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
                  <td>
                    {item.status === "PENDING" ? (
                      <Badge
                        variant="gradient"
                        gradient={{ from: "orange", to: "red" }}
                      >
                        PENDING
                      </Badge>
                    ) : item.status === "CONFIRM" ? (
                      <Badge
                        variant="gradient"
                        gradient={{ from: "teal", to: "lime", deg: 105 }}
                      >
                        CONFIRM
                      </Badge>
                    ) : item.status === "CANCEL" ? (
                      <Badge
                        variant="gradient"
                        gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
                      >
                        CANCEL
                      </Badge>
                    ) : null}
                  </td>
                  <td>
                    <Menu position="right" withArrow>
                      <Menu.Target>
                        <UnstyledButton>
                          <IconDotsVertical size={20} />
                        </UnstyledButton>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          onClick={() =>
                            submit(
                              {
                                orderId: order.orderId,
                                productId: item.productId,
                                status: "CONFIRM",
                                action: "updateStatus",
                              },
                              { method: "put" }
                            )
                          }
                          icon={<IconChecks size={16} color="green" />}
                        >
                          Confirm
                        </Menu.Item>
                        <Menu.Item
                          onClick={() =>
                            submit(
                              {
                                orderId: order.orderId,
                                productId: item.productId,
                                status: "CANCEL",
                                action: "updateStatus",
                              },
                              { method: "put" }
                            )
                          }
                          icon={<IconX size={16} color="red" />}
                        >
                          Cancel
                        </Menu.Item>
                        <Menu.Item
                          onClick={() =>
                            submit(
                              {
                                orderId: order.orderId,
                                productId: item.productId,
                                status: "PENDING",
                                action: "updateStatus",
                              },
                              { method: "put" }
                            )
                          }
                          icon={<IconPaperclip size={16} color="orange" />}
                        >
                          Pending
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Paper>
        <Box
          style={{
            display: "flex",
            maxWidth: "300px",
            marginTop: "1rem",
            overflow: "auto",
          }}
        >
          <Table verticalSpacing="md">
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
                  <Text weight={700}>{sumTotalItem.toString()}</Text>
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

  if (ribuan) {
    let separator: string;
    separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
  return prefix == undefined ? rupiah : rupiah ? "Rp. " + rupiah : "";
}
