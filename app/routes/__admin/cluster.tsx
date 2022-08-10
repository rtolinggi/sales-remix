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
  createSubCluster,
  createCluster,
  deleteCluster,
  getCluster,
} from "~/controllers/cluster.server";
import {
  Form,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import React, { useEffect, useRef, useState } from "react";

type SubClusters = {
  id: number;
  clusterId: number;
  subClusterName: string;
};

type PropsCluster = {
  cluster: Array<{
    clusterId: string;
    clusterName: string;
    sub_clusters?: Array<SubClusters>;
  }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const cluster = await getCluster();
  return json({ user, cluster }, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
  // Post
  if (request.method === "POST") {
    const body = Object.fromEntries(await request.formData());
    console.log(body);

    if (typeof body.action === "string" && body.action === "insertCluster") {
      const { clusterName } = body;
      if (typeof clusterName !== "string")
        return json({ success: false }, { status: 400 });
      const insertCluster = await createCluster(clusterName);
      if (!insertCluster) return json({ success: false }, { status: 400 });
      return json({ success: true }, { status: 200 });
    }

    if (typeof body.action === "string" && body.action === "insertSubCluster") {
      const { clusterId, subClusterName } = body;
      if (typeof clusterId !== "string" && typeof subClusterName !== "string")
        return json({ success: false }, { status: 400 });
      if (subClusterName === "")
        return json({ success: false }, { status: 400 });
      const parseId = parseInt(clusterId as string);
      const nameCluster = subClusterName as string;

      const insertSubCluster = await createSubCluster({
        clusterId: parseId,
        subClusterName: nameCluster,
      });
      if (!insertSubCluster) return json({ success: false }, { status: 500 });
      return json({ success: true }, { status: 200 });
    }

    return json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }

  // Delete
  if (request.method === "DELETE") {
    const body = Object.fromEntries(await request.formData());

    if (typeof body.action == "string" && body.action == "deleteCluster") {
      if (typeof body.clusterId !== "string")
        return json({ success: false }, { status: 400 });
      const deleteClusterId = await deleteCluster(body.clusterId);
      if (!deleteClusterId) return json({ success: false }, { status: 400 });
      return json({ success: true }, { status: 200 });
    }

    return json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export default function Cluster() {
  const { cluster } = useLoaderData<PropsCluster>();
  const transition = useTransition();
  const inputClusterRef = useRef<HTMLInputElement | null>(null);
  const inputSubClusterRef = useRef<HTMLInputElement | null>(null);
  const [subClusterName, setSubClusterName] = useState<string>("");
  const handleChangeSubClusterName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSubClusterName(event.target.value);
  };

  useEffect(() => {
    if (transition.submission?.formData.get("action") === "insertCluster") {
      if (null !== inputClusterRef.current) {
        inputClusterRef.current.value = "";
        inputClusterRef.current.focus();
      }
    }

    if (transition.submission?.formData.get("action") === "insertSubCluster") {
      if (null !== inputSubClusterRef.current) {
        inputSubClusterRef.current.focus();
        inputSubClusterRef.current.value = "";
        setSubClusterName("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition.submission]);
  return (
    <>
      <Paper
        radius='md'
        p='sm'
        withBorder
        style={{
          borderLeftWidth: "5px",
          borderBottomWidth: "0px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}>
        <Title order={3}>Cluster</Title>
      </Paper>
      <Paper radius='md' withBorder>
        <Tabs defaultValue='cluster'>
          <Tabs.List>
            <Tabs.Tab value='cluster' icon={<IconPhoto size={14} />}>
              <Text>Cluster</Text>
            </Tabs.Tab>
            <Tabs.Tab value='subCluster' icon={<IconMessageCircle size={14} />}>
              <Text>Sub Cluster</Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='cluster' m={20} pt='xs'>
            <Form method='post'>
              <Group spacing='md' position='center'>
                <Text>Cluster Name</Text>
                <Input
                  ref={inputClusterRef}
                  placeholder='Input Cluster Name'
                  name='clusterName'
                  required
                />
                <Button
                  type='submit'
                  name='action'
                  value='insertCluster'
                  color='white'>
                  Add
                </Button>
              </Group>
            </Form>
            <Divider my={10} />
            <Accordion mx='auto' chevronPosition='left' sx={{ maxWidth: 700 }}>
              {cluster?.map((item, index) => (
                <Accordion.Item value={item.clusterName} key={index}>
                  <AccordionControl>
                    <Group grow position='apart'>
                      <Text>Cluster - {item.clusterName}</Text>
                      <Input
                        type='hidden'
                        name='clusterId'
                        value={item.clusterId}
                      />
                      <Input
                        type='hidden'
                        value={subClusterName}
                        id={item.clusterId}
                      />
                      <Input
                        onChange={handleChangeSubClusterName}
                        ref={inputSubClusterRef}
                        required
                      />
                    </Group>
                  </AccordionControl>
                  {item?.sub_clusters?.map((subItem, index) => (
                    <Accordion.Panel key={index}>
                      <Text>Sub Cluster - {subItem.subClusterName}</Text>
                    </Accordion.Panel>
                  ))}
                </Accordion.Item>
              ))}
            </Accordion>
          </Tabs.Panel>

          <Tabs.Panel value='subCluster' m={20} pt='xs'>
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
      <Menu position='right' withArrow>
        <Menu.Target>
          <ActionIcon size='lg'>
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            icon={<IconDeviceFloppy size={20} color='red' />}
            onClick={handleSubmitInsertSubCluster}
          />
          <Menu.Divider />
          <Menu.Item
            icon={<IconTrash size={20} color='red' />}
            onClick={handleSubmitDelete}
          />
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};
