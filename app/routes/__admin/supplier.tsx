import {
  Button,
  Drawer,
  NumberInput,
  Paper,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { IconCirclePlus } from "@tabler/icons";
import React, { useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";
import { createSupplier, getSupplier } from "~/controllers/supplier.server";
import { showNotification } from "@mantine/notifications";
import type { suppliers } from "@prisma/client";
import type { SupplierTable } from "~/utils/types.server";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "~/components/DataTable";

type LoaderPorps = {
  supplier: Array<suppliers>;
};

const schema = Z.object({
  supplierName: Z.string({
    required_error: "Supplier Name is Required",
  }),
  phone: Z.string({
    required_error: "Supplier Name is Require",
  }),
  address: Z.string({
    required_error: "Addres is Required",
  }),
  action: Z.string().optional(),
}).refine(
  (data) =>
    data.action === "createSupplier" || data.action === "updateSupplier",
  {
    message: "Method Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const dataSupplier = await getSupplier();
  if (user && dataSupplier)
    return json({
      success: true,
      supplier: dataSupplier,
    });
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) return json({ success: false, errors }, { status: 400 });

  const newFormData = { ...formData };

  if (request.method === "POST" && newFormData.action === "createSupplier") {
    delete newFormData.action;
    const result = await createSupplier(newFormData);
    if (!result) {
      return json({ success: false }, { status: 400 });
    }
    return json({ success: true }, { status: 200 });
  }
};

export default function Supplier() {
  const [opened, setOpened] = useState<boolean>(false);
  const { supplier } = useLoaderData<LoaderPorps>();
  const transition = useTransition();

  const visibility = {
    supplierId: false,
  };

  const data: Array<SupplierTable> = supplier.map((item) => {
    const dataTable = {
      supplierId: item.supplierId,
      supplierName: item.supplierName,
      phone: item.phone,
      address: item.address,
    };
    return dataTable;
  });

  const columns = React.useMemo<ColumnDef<SupplierTable, any>[]>(
    () => [
      {
        id: "no",
        header: "No.",
        cell: (props) => parseInt(props.row.id) + 1,
      },
      {
        id: "supplierId",
        accessorKey: "supplierId",
      },
      {
        id: "supplierName",
        header: "Supplier Name",
        accessorKey: "supplierName",
      },
      {
        id: "phone",
        header: "Phone",
        accessorKey: "phone",
      },
      {
        id: "address",
        header: "Address",
        accessorKey: "address",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "createSupplier"
    ) {
      showNotification({
        id: "loadingData",
        title: "Create Employee",
        message: "Create Employe Successfully",
        autoClose: true,
      });
    }
    setOpened(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title="Supplier"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method="post">
          <Stack spacing="sm" align="stretch">
            <TextInput
              variant="filled"
              name="supplierName"
              placeholder="Supplier Name"
              label="Supplier Name"
              required
            />
            <NumberInput
              variant="filled"
              name="phone"
              hideControls
              label="No Handphone"
              placeholder="No Handphone"
              required
            />
            <Textarea
              variant="filled"
              name="address"
              placeholder="Address"
              label="Address"
              required
            />
          </Stack>
          <Button type="submit" mt={20} name="action" value="createSupplier">
            Insert
          </Button>
        </Form>
      </Drawer>
      <Paper
        radius="md"
        p="sm"
        withBorder
        style={{
          borderLeftWidth: "5px",
          borderBottomWidth: "0px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}
      >
        <Title order={3}>Supplier</Title>
      </Paper>
      <Button
        leftIcon={<IconCirclePlus size={20} />}
        onClick={() => setOpened(true)}
      >
        Add Supplier
      </Button>
      <Paper
        shadow="sm"
        radius="md"
        style={{
          width: "100%",
          padding: "20px 10px",
          overflow: "auto",
          marginTop: "1rem",
        }}
      >
        <DataTable data={data} columns={columns} visibility={visibility} />
      </Paper>
    </>
  );
}
