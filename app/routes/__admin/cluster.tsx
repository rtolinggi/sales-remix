import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Input,
  Menu,
  Paper,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import type { AccordionControlProps } from "@mantine/core";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  IconDeviceFloppy,
  IconDots,
  IconMessageCircle,
  IconPhoto,
  IconTrash,
} from "@tabler/icons";
import { requireUserId } from "~/utils/session.server";
import {
  createCluster,
  createSubCluster,
  deleteCluster,
  getCluster,
} from "~/controllers/cluster.server";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import type { clusters } from "@prisma/client";
import React, { useState } from "react";

type PropsCluster = {
  cluster: Array<clusters>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const cluster = await getCluster();
  return json({ user, cluster }, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
  // Post Sub Cluster
  const formData = await request.formData();
  const action = formData.get("action");

  if (typeof action !== "string")
    return json({ success: false }, { status: 500 });

  if (request.method === "POST" && action === "insertSubCluster") {
    const { clusterId, subClusterName } = Object.fromEntries(
      await request.formData()
    );
    if (typeof subClusterName !== "string" || typeof clusterId !== "string")
      return json({ success: false }, { status: 500 });
    const insertSubScluster = await createSubCluster({
      clusterId: parseInt(clusterId),
      subClusterName,
    });
    if (insertSubScluster) return json({ success: true }, { status: 200 });
    return json({ success: false }, { status: 500 });
  }
  // Post
  if (request.method === "POST" && action === "insertCluster") {
    const { clusterName } = Object.fromEntries(await request.formData());
    if (typeof clusterName !== "string") {
      return json({ success: false }, { status: 400 });
    }
    const insertCluster = await createCluster(clusterName);
    if (insertCluster) {
      return json({ success: false }, { status: 500 });
    }
    return json({ succsee: true, message: insertCluster }, { status: 200 });
  }

  // Delete
  if (request.method === "DELETE") {
    const { clusterId } = Object.fromEntries(await request.formData());
    if (typeof clusterId !== "string")
      return json({ success: false }, { status: 400 });
    await deleteCluster(clusterId);
    return json({ succes: true, data: clusterId }, { status: 200 });
  }
};

export default function Cluster() {
  const { cluster } = useLoaderData<PropsCluster>();
  const [subClusterName, setSubClusterName] = useState<string>("");
  const handleChangeSubClusterName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSubClusterName(event.target.value);
  };
  return (
    <>
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
        <Title order={3}>Cluster</Title>
      </Paper>
      <Paper radius="md" withBorder>
        <Tabs defaultValue="cluster">
          <Tabs.List>
            <Tabs.Tab value="cluster" icon={<IconPhoto size={14} />}>
              <Text>Cluster</Text>
            </Tabs.Tab>
            <Tabs.Tab value="subCluster" icon={<IconMessageCircle size={14} />}>
              <Text>Sub Cluster</Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="cluster" m={20} pt="xs">
            <Form method="post">
              <Group spacing="md" position="center">
                <Text>Cluster Name</Text>
                <Input
                  placeholder="Input Cluster Name"
                  name="clusterName"
                  required
                />
                <Button
                  type="submit"
                  name="action"
                  value="insertCluster"
                  color="white"
                >
                  Add
                </Button>
              </Group>
            </Form>
            <Divider my={10} />
            <Accordion mx="auto" chevronPosition="left" sx={{ maxWidth: 700 }}>
              {cluster?.map((item, index) => (
                <Accordion.Item value={item.clusterName} key={index}>
                  <AccordionControl>
                    <Group grow position="apart">
                      {item.clusterName}
                      <Input
                        type="hidden"
                        name="clusterId"
                        value={item.clusterId}
                      />
                      <Input type="hidden" value={subClusterName} />
                      <Input onChange={handleChangeSubClusterName} />
                    </Group>
                  </AccordionControl>
                  <Accordion.Panel>Panel 1</Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Tabs.Panel>

          <Tabs.Panel value="subCluster" m={20} pt="xs">
            Sub Cluster Content
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </>
  );
}

const AccordionControl: React.FC = (props: AccordionControlProps | any) => {
  const child = props?.children?.props;
  const clusterId = child.children[1].props.value;
  const subClusterName = child.children[2].props.value;
  const submit = useSubmit();
  const handleSubmitInsertSubCluster = () => {
    submit(
      {
        action: "insertSubCluster",
        clusterId: String(clusterId),
        subClusterName,
      },
      { method: "post" }
    );
  };
  const handleSubmitDelete = () => {
    submit(
      { action: "deleteCluster", clusterId: String(clusterId) },
      { method: "delete" }
    );
  };
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Accordion.Control {...props} />
      <Menu position="right" withArrow>
        <Menu.Target>
          <ActionIcon size="lg">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            icon={<IconDeviceFloppy size={20} color="red" />}
            onClick={handleSubmitInsertSubCluster}
          />
          <Menu.Divider />
          <Menu.Item
            icon={<IconTrash size={20} color="red" />}
            onClick={() => console.log(handleSubmitDelete)}
          />
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};
