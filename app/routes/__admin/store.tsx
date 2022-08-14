import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import * as Z from "zod";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import {
  IconChevronDown,
  IconCirclePlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons";
import React, { forwardRef, useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import { validateAction } from "~/utils/validate.server";
import {
  createStore,
  deleteStore,
  getDataStore,
  updateStore,
} from "~/controllers/store.server";
import type { FormStore } from "~/controllers/store.server";
import { showNotification } from "@mantine/notifications";
import type { StoreTable } from "~/utils/types.server";
import type { clusters, stores, sub_clusters } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { openConfirmModal } from "@mantine/modals";
import { getSubCluster } from "~/controllers/cluster.server";
import DataTable from "~/components/DataTable";
import { ExportToExcel } from "~/components/ExportData";

type LoaderProps = {
  store: Array<
    stores & {
      subClusters: sub_clusters | undefined;
    }
  >;
  cluster: Array<sub_clusters & { clusters: clusters | undefined }>;
};

const schema = Z.object({
  storeId: Z.string().optional(),
  subClusterId: Z.string({
    required_error: "Sub Cluster Id is Required",
  }),
  storeName: Z.string({
    required_error: "Store Name is required",
  }),
  ownerName: Z.string({
    required_error: "Owner Name is required",
  }),
  address: Z.string(),
  phone: Z.string(),
  action: Z.string().optional(),
}).refine(
  (data) => data.action === "createStore" || data.action === "updateStore",
  {
    message: "Action Not Allowed",
    path: ["action"],
  }
);

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  description?: string;
}

export type ActionInput = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  // Delete
  if (request.method === "DELETE") {
    const { storeId, action } = Object.fromEntries(await request.formData());
    if (
      typeof storeId === "string" &&
      typeof action === "string" &&
      action === "deleteStore"
    ) {
      const result = await deleteStore(storeId);
      if (!result) return json({ success: false }, { status: 400 });
      return json({ success: true }, { status: 200 });
    }
  }

  // Post
  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) return json({ success: false, errors }, { status: 400 });

  const newFormdata = { ...formData };

  if (request.method === "POST" && newFormdata.action === "createStore") {
    delete newFormdata.action;
    const result = await createStore(newFormdata);
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }

  // Update
  if (request.method === "PUT" && newFormdata.action === "updateStore") {
    delete newFormdata.action;
    const result = await updateStore(newFormdata as FormStore);
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }

  return json({ success: false }, { status: 500 });
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const dataStore = await getDataStore();
  const dataCluster = await getSubCluster();
  if (!dataStore || !dataCluster)
    return json({ success: false }, { status: 400 });
  return json(
    { store: dataStore, cluster: dataCluster, user },
    { status: 200 }
  );
};

export default function Store() {
  const { store, cluster } = useLoaderData<LoaderProps>();
  const transition = useTransition();
  const [actionUpdate, setActionUpdate] = useState<boolean>(false);
  const [dataStore, setDataStore] = useState<Array<string>>([]);
  const [opened, setOpened] = useState<boolean>(false);
  const submit = useSubmit();

  const seen = new Set();

  useEffect(() => {
    if (!actionUpdate) {
      setOpened(false);
    }
  }, [actionUpdate]);

  const selectClusterData = cluster
    .filter((item) => {
      const duplicate = seen.has(item.subClusterName);
      seen.add(item.subClusterName);
      return !duplicate;
    })
    .map((item) => {
      return {
        value: String(item.id) as string,
        label: item.subClusterName as string | undefined,
        description: item?.clusters?.clusterName,
      };
    });

  const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, description, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
        <Group noWrap>
          <div>
            <Text size="sm">{label}</Text>
            <Text size="xs" color="dimmed">
              Cluster - {description}
            </Text>
          </div>
        </Group>
      </div>
    )
  );

  const visibility = {
    storeId: false,
    subClusterId: false,
  };

  const data: Array<StoreTable> = store.map((item) => {
    const dataTable = {
      storeId: item.storeId,
      storeName: item.storeName,
      ownerName: item.ownerName,
      phone: item.phone,
      address: item.address,
      subClusterId: item.subClusterId,
      subClusterName: item.subClusters?.subClusterName,
    };
    return dataTable;
  });

  const columns = React.useMemo<ColumnDef<StoreTable, any>[]>(
    () => [
      {
        id: "no",
        header: "No.",
        cell: (props) => parseInt(props.row.id) + 1,
      },
      {
        id: "storeId",
        accessorKey: "storeId",
      },
      {
        id: "subClusterId",
        accessorKey: "subClusterId",
      },
      {
        id: "storeName",
        accessorKey: "storeName",
        header: "Store Name",
        filterFn: "arrIncludesAll",
      },
      {
        id: "ownerName",
        accessorKey: "ownerName",
        header: "Owner Name",
        filterFn: "arrIncludesAll",
      },
      {
        id: "address",
        accessorKey: "address",
        header: "Addres",
        filterFn: "arrIncludesAll",
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: "Phone",
        filterFn: "arrIncludesAll",
      },
      {
        id: "subClusterName",
        accessorKey: "subClusterName",
        header: "Sub Cluster",
        filterFn: "arrIncludesAll",
      },
      {
        id: "action",
        header: "Actions",
        cell: (props) => {
          const idStore = props.row
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
                          {idStore[3] as string}?
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
                            action: "deleteStore",
                            storeId: idStore[1] as string,
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
                    setDataStore(idStore as Array<string>);
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

  const handleSubmit = (event: React.SyntheticEvent) => {
    const currentTarget = (event.target as typeof event.target) && {};
    submit(currentTarget, { replace: true });
  };

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "createStore"
    ) {
      showNotification({
        id: "loadingData",
        title: "Create Store",
        message: "Create Store Successfully",
        autoClose: true,
      });
    }

    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "updateStore"
    ) {
      showNotification({
        id: "loadingData",
        title: "Update Store",
        message: "Delete Store Successfully",
        autoClose: true,
      });
    }

    if (
      transition.state === "loading" &&
      transition.submission?.formData.get("action") === "deleteStore"
    ) {
      showNotification({
        id: "loadingData",
        title: "Delete Store",
        message: "Delete Store Successfully",
        autoClose: true,
      });
    }
    setOpened(false);
  }, [transition]);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => {
          setActionUpdate(false);
          setOpened(false);
        }}
        title="Create Store"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method={actionUpdate ? "put" : "post"} onSubmit={handleSubmit}>
          <Stack spacing="sm" align="stretch">
            {actionUpdate ? (
              <TextInput type="hidden" name="storeId" value={dataStore[1]} />
            ) : undefined}
            <TextInput
              defaultValue={actionUpdate ? dataStore[3] : undefined}
              variant="filled"
              name="storeName"
              label="Store Name"
              required
            />
            <TextInput
              defaultValue={actionUpdate ? dataStore[4] : undefined}
              variant="filled"
              name="ownerName"
              label="Owner Name"
              required
            />
            <NumberInput
              defaultValue={actionUpdate ? parseInt(dataStore[6]) : undefined}
              variant="filled"
              name="phone"
              hideControls
              label="No Handphone"
              required
            />
            <Select
              defaultValue={
                actionUpdate ? (String(dataStore[2]) as string) : null
              }
              data={selectClusterData}
              name="subClusterId"
              itemComponent={SelectItem}
              rightSection={<IconChevronDown size={16} />}
              variant="filled"
              label="Cluster"
              searchable
              clearable
              placeholder="Select Cluster"
              filter={(value, item) => {
                if (item.label !== undefined) {
                  const result =
                    item.label
                      .toLowerCase()
                      .includes(value.toLowerCase().trim()) ||
                    item.description
                      .toLowerCase()
                      .includes(value.toLowerCase().trim());
                  return result;
                }
              }}
              required
            />
            <Textarea
              defaultValue={actionUpdate ? dataStore[5] : undefined}
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
            value={actionUpdate ? "updateStore" : "createStore"}
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
        <Title order={3}>Store</Title>
      </Paper>
      <Group spacing="xs">
        <Button
          leftIcon={<IconCirclePlus size={20} />}
          onClick={() => {
            try {
              setActionUpdate(false);
              setOpened(true);
            } catch (error) {
              console.log(error);
            }
          }}
        >
          Create Store
        </Button>
        <ExportToExcel apiData={data} fileName="Store" />
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
