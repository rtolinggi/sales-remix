import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { IconCirclePlus, IconEdit, IconTrash } from "@tabler/icons";
import React, { useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  updateSupplier,
} from "~/controllers/supplier.server";
import { showNotification } from "@mantine/notifications";
import type { suppliers } from "@prisma/client";
import type { SupplierTable } from "~/utils/types.server";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "~/components/DataTable";
import { ExportToExcel } from "~/components/ExportData";
import { openConfirmModal } from "@mantine/modals";

type LoaderPorps = {
  supplier: Array<suppliers>;
};

const schema = Z.object({
  supplierId: Z.string().optional(),
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
  // Delete
  if (request.method === "DELETE") {
    const { supplierId, action } = Object.fromEntries(await request.formData());
    if (
      typeof supplierId === "string" &&
      typeof action === "string" &&
      action === "deleteSupplier"
    ) {
      const result = await deleteSupplier(supplierId);
      if (!result) return json({ success: false }, { status: 400 });
      return json({ success: true }, { status: 200 });
    }
    return false;
  }

  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) return json({ success: false, errors }, { status: 400 });

  const { ...newFormData } = formData;

  // Post
  if (request.method === "POST" && newFormData.action === "createSupplier") {
    delete newFormData.action;
    const result = await createSupplier(newFormData);
    if (!result) {
      return json({ success: false }, { status: 400 });
    }
    return json({ success: true }, { status: 200 });
  }

  // Update
  if (request.method === "PUT" && newFormData.action === "updateSupplier") {
    delete newFormData.action;
    const result = await updateSupplier(newFormData);
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }
};

export default function Supplier() {
  const [opened, setOpened] = useState<boolean>(false);
  const { supplier } = useLoaderData<LoaderPorps>();
  const transition = useTransition();
  const submit = useSubmit();
  const [actionUpdate, setActionUpdate] = useState<boolean>(false);
  const [dataSupplier, setDataSupplier] = useState<Array<string>>([]);

  const visibility = {
    supplierId: false,
    createdAt: false,
    updatedAt: false,
  };

  const data: Array<SupplierTable> = supplier.map((item) => {
    const dataTable = {
      supplierId: String(item.supplierId),
      supplierName: item.supplierName,
      phone: item.phone,
      address: item.address,
      createdAt: JSON.stringify(String(item.createdAt)),
      updatedAt: JSON.stringify(String(item.updatedAt)),
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
        enableGlobalFilter: true,
        filterFn: "arrIncludesAll",
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
      {
        id: "createdAt",
        accessorKey: "createdAtate",
      },
      {
        id: "updatedAt",
        accessorKey: "updatedAt",
      },
      {
        id: "action",
        header: "Actions",
        cell: (props) => {
          const idSupplier = props.row
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
                          {idSupplier[2] as string}?
                        </Text>
                      ),
                      labels: {
                        confirm: "Delete Store",
                        cancel: "No don't delete it",
                      },
                      onCancel: () => console.log("Cancel"),
                      onConfirm: () => {
                        submit(
                          {
                            action: "deleteSupplier",
                            supplierId: idSupplier[1] as string,
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
                    setActionUpdate(true);
                    setDataSupplier(idSupplier as Array<string>);
                    setOpened(true);
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

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "createSupplier"
    ) {
      showNotification({
        id: "loadingData",
        title: "Create Supplier",
        message: "Create Supplier Successfully",
        autoClose: true,
      });
    }
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "updateSupplier"
    ) {
      showNotification({
        id: "loadingData",
        title: "Update Supplier",
        message: "Update Supplier Successfully",
        autoClose: true,
      });
      setActionUpdate(false);
    }
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "deleteSupplier"
    ) {
      showNotification({
        id: "loadingData",
        title: "Delete Supplier",
        message: "Delete Supplier Successfully",
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
          setActionUpdate(false);
          setOpened(false);
        }}
        title="Supplier"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method={actionUpdate ? "put" : "post"}>
          <Stack spacing="sm" align="stretch">
            {actionUpdate ? (
              <TextInput
                name="supplierId"
                value={String(dataSupplier[1])}
                type="hidden"
              />
            ) : undefined}
            <TextInput
              defaultValue={actionUpdate ? dataSupplier[2] : undefined}
              variant="filled"
              name="supplierName"
              placeholder="Supplier Name"
              label="Supplier Name"
              required
            />
            <NumberInput
              defaultValue={
                actionUpdate ? parseInt(dataSupplier[3]) : undefined
              }
              variant="filled"
              name="phone"
              hideControls
              label="No Handphone"
              placeholder="No Handphone"
              required
            />
            <Textarea
              defaultValue={actionUpdate ? dataSupplier[4] : undefined}
              variant="filled"
              name="address"
              placeholder="Address"
              label="Address"
              required
            />
          </Stack>
          <Button
            type="submit"
            mt={20}
            name="action"
            value={actionUpdate ? "updateSupplier" : "createSupplier"}
          >
            {actionUpdate ? "Update" : "Insert"}
          </Button>
        </Form>
      </Drawer>
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
        <Title order={3}>Supplier</Title>
      </Paper>
      <Group spacing="xs">
        <Button
          leftIcon={<IconCirclePlus size={20} />}
          onClick={() => setOpened(true)}
        >
          Create Supplier
        </Button>
        <ExportToExcel apiData={data} fileName="Supplier" />
      </Group>
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
