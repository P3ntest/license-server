import { ColorScheme, ColorSchemeProvider } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { LinksFunction } from "@remix-run/node";
import { useState } from "react";
import { DashboardNavBar } from "~/compontents/dashboard/navbar";

import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => {
    return [
        { rel: "stylesheet", href: stylesUrl }
    ];
};

export default function DashboardShell() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value ?? (colorScheme === 'dark' ? 'light' : 'dark'));

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} >
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <DashboardNavBar />
            </MantineProvider>
        </ColorSchemeProvider>
    )
}