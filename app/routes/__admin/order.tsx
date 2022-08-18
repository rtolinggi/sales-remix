import {
  Group,
  LoadingOverlay,
  Paper,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { DatePicker } from "@mantine/dates";
import { IconCalendar, IconEdit, IconTrash } from "@tabler/icons";
import { getOrder } from "~/controllers/order.server";
import * as Z from "zod";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { OrderTable } from "~/utils/types.server";
import { openConfirmModal } from "@mantine/modals";
import DataTable from "~/components/DataTable";

type loaderOrder = {
  orderId: string;
  orderDate: string;
  storeId: string;
  employeeId: string;
  total: string;
  stores: {
    storeName: string;
  };
  employees: {
    firstName: string;
    lastName: string;
  };
};

export type loaderProps = {
  order: Array<loaderOrder>;
};

const schema = Z.object({
  orderId: Z.string({
    required_error: "Order Id is Required",
  }),
  orderDate: Z.string({
    required_error: "Order Date is Required",
  }),
  storeId: Z.string({
    required_error: "Store Id is Required",
  }),
  employeeId: Z.string({
    required_error: "Employe Id is required",
  }),
  total: Z.string({
    required_error: "Total is Required",
  }),
  action: Z.string().optional(),
}).refine(
  (data) =>
    data.action === "createOrder" ||
    data.action === "updateOrder" ||
    data.action === "deleteOrder",
  {
    message: "Method Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const order = await getOrder();
  return json({ user: user, order: order }, { status: 200 });
};

export default function Order() {
  const { order } = useLoaderData<Promise<loaderProps>>();
  const submit = useSubmit();
  const transition = useTransition();

  const visibility = {
    storeId: true,
    employeeId: true,
  };

  const data: Array<OrderTable> = order.map((item) => {
    const dataTable = {
      orderId: item.orderId,
      orderDate: item.orderDate,
      storeId: item.storeId,
      employeeId: item.employeeId,
      total: item.total,
      storeName: item.stores.storeName,
      firstName: item.employees.firstName,
      lastName: item.employees.lastName,
    };
    return dataTable;
  });

  const columns = React.useMemo<ColumnDef<OrderTable, any>[]>(
    () => [
      {
        id: "no",
        header: "No.",
        cell: (props) => parseInt(props.row.id) + 1,
      },
      {
        id: "orderId",
        accessorKey: "orderId",
      },
      {
        id: "orderDate",
        header: "Order Date",
        accessorKey: "orderDate",
      },
      {
        id: "total",
        header: "Total",
        accessorKey: "total",
      },
      {
        id: "storeName",
        header: "Store Name",
        accessorKey: "storeName",
      },
      {
        id: "fullName",
        header: "Full Name",
        accessorFn: (props) => `${props.firstName} ${props.lastName}`,
      },
      {
        id: "storeId",
        accessorKey: "storeId",
      },
      {
        id: "empolyeeId",
        accessorKey: "employeeId",
      },
      {
        id: "action",
        header: "Actions",
        cell: (props) => {
          const idOrder = props.row
            .getAllCells()
            .map((item) => item.getValue());
          return (
            <Group spacing="xs">
              <ThemeIcon
                color="red"
                variant="light"
                style={{ cursor: "pointer", marginRight: "10px" }}
              >
                <UnstyledButton
                  onClick={() =>
                    openConfirmModal({
                      title: "Delete Store",
                      centered: true,
                      children: (
                        <Text size="sm">
                          Are you sure you want to delete Store{" "}
                          {idOrder[1] as string}?
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
                            action: "deleteSupplier",
                            supplierId: idOrder[1] as string,
                          },
                          { method: "delete" }
                        );
                      },
                    })
                  }
                >
                  <IconTrash size={20} stroke={1.5} />
                </UnstyledButton>
              </ThemeIcon>
              <ThemeIcon
                color="lime"
                variant="light"
                style={{ cursor: "pointer" }}
              >
                <UnstyledButton
                  type="submit"
                  name="action"
                  value="updateStore"
                  onClick={() => {
                    // setActionUpdate(true);
                    // setDataSupplier(idSupplier as Array<string>);
                    // setOpened(true);
                  }}
                >
                  <IconEdit size={20} stroke={1.5} />
                </UnstyledButton>
              </ThemeIcon>
            </Group>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <LoadingOverlay visible={transition.state === "loading"} />
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
        <Title order={3}>Order</Title>
      </Paper>
      <Paper radius="md" p="md" shadow="sm">
        <Group position="apart" grow>
          <DatePicker
            variant="filled"
            name="dateForm"
            locale="id"
            placeholder="Date From"
            icon={<IconCalendar size={16} />}
            label="Date From"
            allowFreeInput
            inputFormat="YYYY-MM-DD"
          />
          <DatePicker
            variant="filled"
            name="dateTo"
            locale="id"
            placeholder="Date To"
            icon={<IconCalendar size={16} />}
            label="Date To"
            allowFreeInput
            inputFormat="YYYY-MM-DD"
          />
        </Group>
      </Paper>
      <DataTable data={data} columns={columns} visibility={visibility} />
    </>
  );
}
