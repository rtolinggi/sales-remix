import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  Divider,
  Menu,
  LoadingOverlay,
  Avatar,
} from "@mantine/core";
import IAvatar from "../assets/avatar.jpg";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getUser } from "~/utils/session.server";
import DarkMode from "~/components/DarkMode";
import UserButton from "~/components/UserButton";
import { BrandJavascript } from "tabler-icons-react";
import NavbarTitle from "~/components/Navbar/NavbarTitle";
import { IconLogout, IconMessageCircle, IconSettings } from "@tabler/icons";
import {
  Outlet,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import NavbarContent from "~/components/Navbar/NavbarContent";

type UserProps = {
  data: {
    email: string;
    employees: {
      firstName: string;
      lastName: string;
    };
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return user ? json({ data: user }) : redirect("login");
};

export default function AppShellDemo() {
  const { data } = useLoaderData<UserProps>();
  const logout = useSubmit();
  const transition = useTransition();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState<boolean>(true);
  return (
    <>
      <LoadingOverlay
        visible={
          transition.submission?.formData.get("action") !== "deleteCategory" &&
          transition.submission?.formData.get("action") !== "createCategory" &&
          transition.submission?.formData.get("action") !== "updateCategory" &&
          transition.state === "submitting"
            ? true
            : false
        }
      />
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        fixed
        navbar={
          <Navbar
            p="md"
            width={{ sm: 250 }}
            hidden={opened}
            hiddenBreakpoint="sm"
          >
            <Navbar.Section>
              <NavbarTitle
                name={`${data.employees.firstName} ${data.employees.lastName}`}
                email={data.email}
              />
              <Divider
                my="md"
                labelPosition="center"
                label={
                  <>
                    <Avatar src={IAvatar} size={50} radius="xl" />
                  </>
                }
              />
            </Navbar.Section>
            <Navbar.Section grow>
              <NavbarContent />
            </Navbar.Section>
          </Navbar>
        }
        header={
          <Header height={70} p="sm">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={!opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                />
              </MediaQuery>
              <Group>
                <BrandJavascript size={30} strokeWidth={2} color="red" />
                <Text weight={700}>Demo App</Text>
              </Group>
              <div style={{ display: "flex", alignItems: "center" }}>
                <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                  <Group position="center">
                    <Menu withArrow width={200}>
                      <Menu.Target>
                        <UserButton image={IAvatar} email={data.email} />
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Application</Menu.Label>
                        <Menu.Item icon={<IconSettings size={14} />}>
                          Settings
                        </Menu.Item>
                        <Menu.Item icon={<IconMessageCircle size={14} />}>
                          Messages
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          onClick={() =>
                            logout(
                              { _action: "logout" },
                              {
                                method: "post",
                                action: "logout",
                              }
                            )
                          }
                          icon={<IconLogout size={14} />}
                        >
                          Logout
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </MediaQuery>
                <DarkMode variant="light" size={18} />
              </div>
            </div>
          </Header>
        }
      >
        <Outlet />
      </AppShell>
    </>
  );
}
