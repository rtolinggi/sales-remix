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
import DarkMode from "~/components/DarkMode";
import UserButton from "~/components/UserButton";
import { Outlet } from "@remix-run/react";
import { BrandJavascript } from "tabler-icons-react";
import NavbarTitle from "~/components/Navbar/NavbarTitle";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return user ? json({ data: user }) : redirect("login");
};
export default function AppShellDemo() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState<boolean>(false);

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
      navbarOffsetBreakpoint='sm'
      navbar={
        <Navbar
          p='md'
          width={{ sm: 280 }}
          hidden={opened}
          hiddenBreakpoint='sm'>
          <Navbar.Section>
            <NavbarTitle
              name='Rio Tolinggi'
              email='rtolinggi91@gmail.com'
              image={IAvatar}
            />
          </Navbar.Section>
          <Navbar.Section mt='md' grow>
            <p>Content</p>
          </Navbar.Section>
          <Navbar.Section>
            <Divider my='xs' />
            <UserButton
              name='rtolinggi'
              email='rtolinggi@gmail.com'
              image={IAvatar}
            />
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={70} p='sm'>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "100%",
              justifyContent: "space-between",
            }}>
            <MediaQuery largerThan='sm' styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size='sm'
                color={theme.colors.gray[6]}
              />
            </MediaQuery>
            <Group>
              <BrandJavascript size={30} strokeWidth={2} color='red' />
              <Text weight={700}>Demo App</Text>
            </Group>
            <div style={{ display: "flex", alignItems: "center" }}>
              <MediaQuery smallerThan='sm' styles={{ display: "none" }}>
                <UserButton image={IAvatar} email='rtolinggi91@gmail.com' />
              </MediaQuery>
              <DarkMode variant='light' size={18} />
            </div>
          </div>
        </Header>
      }>
      <Outlet />
    </AppShell>
  );
}
