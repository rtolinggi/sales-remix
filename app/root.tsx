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

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

const Document: React.FC = ({ children }) => {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
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
        <NotificationsProvider position='top-center' autoClose={5000}>
          <Outlet />
        </NotificationsProvider>
      </ThemeProvider>
    </Document>
  );
};

export default App;
