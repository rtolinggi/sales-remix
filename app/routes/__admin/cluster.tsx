import {
  Box,
  Button,
  Group,
  Paper,
  Tabs,
  TextInput,
  Title,
  Select,
  Table,
  UnstyledButton,
  ThemeIcon,
  LoadingOverlay,
} from "@mantine/core";
import { json } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
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
  IconFolder,
  IconFolders,
  IconTrash,
} from "@tabler/icons";
import {
  createCluster,
  deleteCluster,
  getCluster,
  getSubCluster,
  updateCluster,
} from "~/controllers/cluster.server";
import type { clusters } from "@prisma/client";
import * as Z from "zod";
import { validateAction } from "~/utils/validate.server";
import { useEffect, useRef, useState } from "react";

type SubCluster = {
  id: string;
  clusterId: string;
  subClusterName: string;
  clusters: {
    clusterName: string;
  };
};

export type ClusterProps = {
  cluster: Array<clusters>;
  subCluster: Array<SubCluster>;
};

const schema = Z.object({
  clusterId: Z.string().optional(),
  clusterName: Z.string(),
  action: Z.string().optional(),
}).refine(
  (data) =>
    data.action === "createCluster" ||
    data.action === "updateCluster" ||
    data.action === "deleteCluster",
  { message: "Methon not Allowed" }
);

export type ActionInput = Z.infer<typeof schema>;

export const action: ActionFunction = async ({ request }) => {
  // Delete
  if (request.method === "DELETE") {
    const { clusterId, action } = Object.fromEntries(await request.formData());
    if (
      typeof clusterId === "string" &&
      typeof action === "string" &&
      action === "deleteCluster"
    ) {
      const result = await deleteCluster(clusterId);
      if (!result) return json({ success: false }, { status: 400 });
      return json({ success: true }, { status: 200 });
    }
    return false;
  }

  const { formData, errors } = await validateAction<ActionInput>({
    request,
    schema,
  });

  if (errors) {
    return json({ success: false, errors }, { status: 400 });
  }

  const newFormData = { ...formData };

  // Create
  if (request.method === "POST" && newFormData.action === "createCluster") {
    const result = await createCluster(newFormData.clusterName);
    if (!result) {
      return json({ success: false, errors }, { status: 400 });
    }
    return json(
      {
        success: true,
      },
      { status: 200 }
    );
  }

  if (request.method === "PUT" && newFormData.action === "updateCluster") {
    delete newFormData.action;
    const result = await updateCluster(
      String(newFormData.clusterId),
      newFormData.clusterName
    );
    if (!result) return json({ success: false }, { status: 400 });
    return json({ success: true }, { status: 200 });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const cluster = await getCluster();
  const subCluster = await getSubCluster();
  return json({ user, cluster: cluster, subCluster }, { status: 200 });
};

export default function Cluster() {
  const { cluster, subCluster } = useLoaderData<ClusterProps>();
  const submit = useSubmit();
  const transition = useTransition();
  const inputClusterRef = useRef<HTMLInputElement | null>(null);
  const inputSubClusterRef = useRef<HTMLInputElement | null>(null);
  const [actionUpdateCluster, setActionUpdateCluster] =
    useState<boolean>(false);
  const [actionUpdateSubCluster, setActionUpdateSubCluster] =
    useState<boolean>(false);
  const [stateClusterId, setStateClusterId] = useState<string>("");
  const [stateSubClusterId, setStateSubClusterId] = useState<string>("");

  const loadingCluster = transition.state === "submitting";

  useEffect(() => {
    if (transition.submission?.formData.get("action") === "createCluster") {
      if (null !== inputClusterRef.current) {
        inputClusterRef.current.value = "";
        inputClusterRef.current.focus();
      }
    }
    if (transition.submission?.formData.get("action") === "updateCluster") {
      if (null !== inputClusterRef.current) {
        inputClusterRef.current.value = "";
        inputClusterRef.current.focus();
      }
      setActionUpdateCluster(false);
    }
    if (transition.submission?.formData.get("action") === "createSubCluster") {
      if (null !== inputSubClusterRef.current) {
        inputSubClusterRef.current.value = "";
        inputSubClusterRef.current.focus();
      }
    }
    if (transition.submission?.formData.get("action") === "updateSubCluster") {
      if (null !== inputSubClusterRef.current) {
        inputSubClusterRef.current.value = "";
        inputSubClusterRef.current.focus();
      }
      setActionUpdateSubCluster(false);
    }
  }, [transition]);
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
        <Title order={3}>Cluster</Title>
      </Paper>
      <Paper>
        <Tabs defaultValue="gallery">
          <Tabs.List>
            <Tabs.Tab
              value="gallery"
              icon={<IconFolder size={20} color="red" />}
            >
              Cluster
            </Tabs.Tab>
            <Tabs.Tab
              value="messages"
              icon={<IconFolders size={20} color="red" />}
            >
              Sub Cluster
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="gallery" p="xl">
            <Box style={{ width: "350px" }}>
              <Form method={actionUpdateCluster ? "put" : "post"}>
                <Group grow>
                  <TextInput
                    variant="filled"
                    ref={inputClusterRef}
                    label="Cluster"
                    placeholder="Cluster"
                    name="clusterName"
                    required
                  />
                </Group>
                <TextInput
                  type="hidden"
                  name="clusterId"
                  value={stateClusterId}
                />

                <Group my={20}>
                  <Button
                    loading={loadingCluster}
                    type="submit"
                    name="action"
                    value={
                      actionUpdateCluster ? "updateCluster" : "createCluster"
                    }
                    leftIcon={<IconCirclePlus size={20} />}
                  >
                    {actionUpdateCluster ? "Update Cluster" : "Create Cluster"}
                  </Button>
                  {actionUpdateCluster ? (
                    <Button
                      onClick={() => {
                        setActionUpdateCluster(false);
                        if (null !== inputClusterRef.current) {
                          inputClusterRef.current.value = "";
                          inputClusterRef.current.focus();
                        }
                      }}
                    >
                      Cancel Update
                    </Button>
                  ) : undefined}
                </Group>
              </Form>
            </Box>
            <Table verticalSpacing="md" striped highlightOnHover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Cluster Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cluster.map((item, index) => {
                  return (
                    <tr key={item.clusterId}>
                      <td>{index + 1}</td>
                      <td>{item.clusterName}</td>
                      <td>
                        <Group spacing="xs">
                          <ThemeIcon
                            color="red"
                            variant="light"
                            style={{ cursor: "pointer", marginRight: "10px" }}
                          >
                            <UnstyledButton
                              onClick={() => {
                                submit(
                                  {
                                    action: "deleteCluster",
                                    clusterId: JSON.stringify(item.clusterId),
                                  },
                                  {
                                    method: "delete",
                                  }
                                );
                              }}
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
                              name="action"
                              value="updateCluster"
                              onClick={() => {
                                setActionUpdateCluster(true);
                                setStateClusterId(String(item.clusterId));
                                if (null !== inputClusterRef.current) {
                                  inputClusterRef.current.value =
                                    item.clusterName;
                                  inputClusterRef.current.focus();
                                }
                              }}
                            >
                              <IconEdit size={20} stroke={1.5} />
                            </UnstyledButton>
                          </ThemeIcon>
                        </Group>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Tabs.Panel>

          <Tabs.Panel value="messages" p="xl">
            <Box style={{ width: "350px" }}>
              <Form
                method={actionUpdateSubCluster ? "put" : "post"}
                action="/subCluster"
              >
                <Select
                  name="clusterId"
                  data={cluster.map((item) => {
                    return {
                      value: String(item.clusterId),
                      label: item.clusterName,
                    };
                  })}
                  rightSection={<IconChevronDown size={16} />}
                  variant="filled"
                  label="Cluster"
                  searchable
                  clearable
                  placeholder="Select Cluster"
                  required
                />
                <TextInput type="hidden" name="id" value={stateSubClusterId} />
                <Group grow>
                  <TextInput
                    ref={inputSubClusterRef}
                    variant="filled"
                    label="Sub Cluster"
                    placeholder="Sub Cluster"
                    name="subClusterName"
                    required
                  />
                </Group>
                <Group my={20}>
                  <Button
                    loading={loadingCluster}
                    type="submit"
                    name="action"
                    value={
                      actionUpdateSubCluster
                        ? "updateSubCluster"
                        : "createSubCluster"
                    }
                    leftIcon={<IconCirclePlus size={20} />}
                  >
                    {actionUpdateSubCluster
                      ? "Update Sub Cluster"
                      : "Create Sub Cluster"}
                  </Button>
                  {actionUpdateSubCluster ? (
                    <Button
                      onClick={() => {
                        setActionUpdateSubCluster(false);
                        if (null !== inputSubClusterRef.current) {
                          inputSubClusterRef.current.value = "";
                          inputSubClusterRef.current.focus();
                        }
                      }}
                    >
                      Cancel Update
                    </Button>
                  ) : undefined}
                </Group>
              </Form>
            </Box>

            <Table verticalSpacing="md" striped highlightOnHover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Sub Cluster Name</th>
                  <th>Cluster Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <LoadingOverlay
                  visible={
                    transition.state === "submitting" &&
                    transition.submission.formData.get("action") ===
                      "deleteSubCluster"
                  }
                />
                {subCluster.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.subClusterName}</td>
                      <td>{item.clusters.clusterName}</td>
                      <td>
                        <Group spacing="xs">
                          <ThemeIcon
                            color="red"
                            variant="light"
                            style={{ cursor: "pointer", marginRight: "10px" }}
                          >
                            <UnstyledButton
                              onClick={() => {
                                submit(
                                  {
                                    action: "deleteSubCluster",
                                    id: JSON.stringify(item.id),
                                  },
                                  {
                                    method: "delete",
                                    action: "/subCluster",
                                  }
                                );
                              }}
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
                              name="action"
                              value="updateSubCluster"
                              onClick={() => {
                                setActionUpdateSubCluster(true);
                                setStateSubClusterId(String(item.id));
                                if (null !== inputSubClusterRef.current) {
                                  inputSubClusterRef.current.value =
                                    item.subClusterName;
                                  inputSubClusterRef.current.focus();
                                }
                              }}
                            >
                              <IconEdit size={20} stroke={1.5} />
                            </UnstyledButton>
                          </ThemeIcon>
                        </Group>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </>
  );
}
