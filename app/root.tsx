// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  ColorSchemeScript,
  Container,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import cx from "clsx";
import classes from "./root.module.css";
import { HeaderSimple } from "./components/HeaderSimple/HeaderSimple";
import { LoaderFunctionArgs } from "@remix-run/node";
import { supabaseAnonServerClient } from "./api/server";
import { createBrowserClient } from "@supabase/ssr";

const theme = createTheme({
  fontFamily: "Open Sans, sans-serif",
  primaryColor: "blue",
  components: {
    Container: Container.extend({
      classNames: (_, { size }) => ({
        root: cx({ [classes.responsiveContainer]: size === "responsive" }),
      }),
    }),
  },
});

export async function loader({ request }: LoaderFunctionArgs) {
  const supabase = await supabaseAnonServerClient(request);

  const user = await supabase.auth.getUser();

  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    },
    user: user.data.user,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { env, user } = useLoaderData<typeof loader>();

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      // delete cookies on sign out
      const expires = new Date(0).toUTCString();
      document.cookie = `my-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
      document.cookie = `my-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
      document.cookie = `my-access-token=${
        session!.access_token
      }; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
      document.cookie = `my-refresh-token=${
        session!.refresh_token
      }; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
    }
  });

  return (
    <AppShell header={{ height: 60 }} padding={"xl"} bg="gray.0">
      <AppShellHeader mb={"xl"}>
        <HeaderSimple />
      </AppShellHeader>
      <AppShellMain>
        <Outlet context={{ user, supabase }} />
      </AppShellMain>
    </AppShell>
  );
}
