import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import ThemeProvider from "./themes";
import { NotificationsProvider } from "@mantine/notifications";
import { StylesPlaceholder } from "@mantine/remix";
import { ModalsProvider } from "@mantine/modals";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

const Document: React.FC = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <StylesPlaceholder />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

const App = () => {
  return (
    <Document>
      <ThemeProvider>
        <ModalsProvider>
          <NotificationsProvider position="top-center" autoClose={5000}>
            <Outlet />
          </NotificationsProvider>
        </ModalsProvider>
      </ThemeProvider>
    </Document>
  );
};

export default App;
