import { Button, Group, LoadingOverlay, Paper, Title } from "@mantine/core";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { Link, useLoaderData, useTransition } from "@remix-run/react";
import { DatePicker } from "@mantine/dates";
import { IconCalendar, IconEyeCheck } from "@tabler/icons";
import { getOrder } from "~/controllers/order.server";
import * as Z from "zod";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { OrderTable } from "~/utils/types.server";
import DataTable from "~/components/DataTable";
import dayjs from "dayjs";

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

const visibility = {
  storeId: false,
  employeeId: false,
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
  const transition = useTransition();

  const data: Array<OrderTable> = order.map((item) => {
    const dataTable = {
      orderId: item.orderId,
      orderDate: String(item.orderDate),
      storeId: item.storeId,
      employeeId: item.employeeId,
      total: item.total.toString(),
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
        cell: (props) => {
          return <>{dayjs(props.getValue()).format("YYYY-MM-DD")}</>;
        },
      },
      {
        id: "total",
        header: "Total",
        accessorKey: "total",
      },
      {
        id: "storeName",
        header: "Store Name(Costumer)",
        accessorKey: "storeName",
      },
      {
        id: "fullName",
        header: "Order By",
        accessorFn: (props) => `${props.firstName} ${props.lastName}`,
      },
      {
        id: "storeId",
        accessorKey: "storeId",
      },
      {
        id: "employeeId",
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
            <>
              <Link to={`${idOrder[1]}`}>
                <Button leftIcon={<IconEyeCheck size={16} />}>
                  View Detail Order
                </Button>
              </Link>
            </>
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
        radius='md'
        p='xl'
        withBorder
        style={{
          borderWidth: "0px 0px 0px 5px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}>
        <Title order={3}>Order</Title>
      </Paper>
      <Paper radius='md' p='md' shadow='sm'>
        <Group position='apart' grow>
          <DatePicker
            variant='filled'
            name='dateForm'
            locale='id'
            placeholder='Date From'
            icon={<IconCalendar size={16} />}
            label='Date From'
            allowFreeInput
            inputFormat='YYYY-MM-DD'
          />
          <DatePicker
            variant='filled'
            name='dateTo'
            locale='id'
            placeholder='Date To'
            icon={<IconCalendar size={16} />}
            label='Date To'
            allowFreeInput
            inputFormat='YYYY-MM-DD'
          />
        </Group>
      </Paper>
      <Paper mt={20} radius='md' p='md' shadow='sm'>
        <DataTable data={data} columns={columns} visibility={visibility} />
      </Paper>
    </>
  );
}
