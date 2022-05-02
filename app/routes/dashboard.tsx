import { AppShell, ColorScheme, ColorSchemeProvider, Container, Stack } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { LinksFunction } from "@remix-run/node";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardNavBar } from "~/compontents/dashboard/navbar";

import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => {
    return [
        { rel: "stylesheet", href: stylesUrl }
    ];
};

export default function DashboardShell() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value ?? (colorScheme === 'dark' ? 'light' : 'dark'));

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} >
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <NotificationsProvider>
                    <AppShell navbar={<DashboardNavBar />}>
                        <Container size={"lg"}>
                            <Outlet />
                        </Container>
                    </AppShell>
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    )
}