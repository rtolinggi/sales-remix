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
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import { validateAction } from "~/utils/validate.server";
import { createStore, getDataStore } from "~/controllers/store.server";
import type { FormStore } from "~/controllers/store.server";
import { showNotification } from "@mantine/notifications";
import type { StoreTable } from "~/utils/types.server";
import type { stores, sub_clusters } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { openConfirmModal } from "@mantine/modals";
import DataTable from "~/components/DataTable";
import { getSubCluster } from "~/controllers/cluster.server";

type LoaderProps = {
  store: Array<
    stores & {
      subClusters: sub_clusters | undefined;
    }
  >;
  cluster: Array<{
    Id: number;
    clusterid: number;
    subClusterName: string;
  }>;
};

const schema = Z.object({
  subClusterId: Z.string(),
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
  (data) => data.action === "createStore" || data.action === "updateEmploye",
  {
    message: "Action Not Allowed",
    path: ["action"],
  }
);

export type ActionInput = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  // Post
  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });
  console.log(errors);
  const newFormdata = { ...formData };

  if (request.method === "POST" && newFormdata.action === "createStore") {
    delete newFormdata.action;
    const result = await createStore(newFormdata as FormStore);
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
  console.log(cluster);
  const transition = useTransition();
  const [opened, setOpened] = useState<boolean>(false);
  const submit = useSubmit();

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

  const columns = useMemo<ColumnDef<StoreTable, any>[]>(
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
      },
      {
        id: "ownerName",
        accessorKey: "ownerName",
        header: "Owner Name",
      },
      {
        id: "address",
        accessorKey: "address",
        header: "Addres",
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: "Phone",
      },
      {
        id: "subClusterName",
        accessorKey: "subClusterName",
        header: "Sub Cluster",
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
                      title: "Delete Employee",
                      centered: true,
                      children: (
                        <Text size="sm">
                          Are you sure you want to delete employee{" "}
                          {idStore[1] as string}?
                        </Text>
                      ),
                      labels: {
                        confirm: "Delete Employee",
                        cancel: "No don't delete it",
                      },
                      onCancel: () => console.log("Cancel"),
                      onConfirm: () => {
                        submit(
                          {
                            action: "deleteEmploye",
                            email: idStore[1] as string,
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
                  value="updateEmploye"
                  onClick={() => {
                    console.log("Action Update");
                    // setActionUpdate(true);
                    // setUserEmail(idEmail as Array<string>);
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
  console.log(data);

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
    setOpened(false);
  }, [transition]);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        title="Create Store"
        padding="xl"
        size="xl"
        position="right"
      >
        {/* Drawer content */}
        <Form method="post">
          <Stack spacing="sm" align="stretch">
            <TextInput
              variant="filled"
              name="storeName"
              label="Store Name"
              required
            />
            <TextInput
              variant="filled"
              name="ownerName"
              label="Owner Name"
              required
            />
            <NumberInput
              variant="filled"
              name="phone"
              hideControls
              label="No Handphone"
              required
            />
            <Select
              data={["1", "2", "3"]}
              variant="filled"
              name="subClusterId"
              searchable
              clearable
              placeholder="Select Cluster"
              label="Cluster Name"
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
          <Button
            leftIcon={<IconPlus size={20} color="white" />}
            type="submit"
            mt={20}
            name="action"
            value="createStore"
          >
            Save
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
        <Title order={3}>Store</Title>
      </Paper>
      <Button
        leftIcon={<IconPlus size={20} color="white" />}
        onClick={() => setOpened(true)}
      >
        Add Store
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
