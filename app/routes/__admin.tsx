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
} from "@mantine/core";
import IAvatar from "../assets/avatar.jpg";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getUser } from "~/utils/session.server";
import { useLoaderData } from "@remix-run/react";
import DarkMode from "~/components/DarkMode";
import UserButton from "~/components/Navbar/NavbarFooter";
import { Outlet } from "@remix-run/react";
import { BrandJavascript } from "tabler-icons-react";
import NavbarTitle from "~/components/Navbar/NavbarTitle";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return user ? json({ data: user }) : redirect("login");
};
export default function AppShellDemo() {
  const { data } = useLoaderData();
  console.log(data);
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="xl"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 250 }}
        >
          <Navbar.Section>
            <NavbarTitle
              name="Rio Tolinggi"
              email="rtolinggi91@gmail.com"
              image={IAvatar}
            />
          </Navbar.Section>
          <Navbar.Section mt="md" grow>
            <p>Content</p>
          </Navbar.Section>
          <Navbar.Section>
            <Divider my="xs" />
            <UserButton
              name="rtolinggi"
              email="rtolinggi@gmail.com"
              image={IAvatar}
            />
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="md">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            <Group spacing="xs">
              <BrandJavascript size={30} strokeWidth={2} color="red" />
              <Text weight={700}>Demo App</Text>
            </Group>
            <Group>
              <DarkMode variant="light" size={18} />
            </Group>
          </div>
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  );
}
