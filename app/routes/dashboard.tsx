import {
    AppShell,
    ColorScheme,
    ColorSchemeProvider,
    Container,
    Stack,
} from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { LinksFunction } from '@remix-run/node';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardNavBar } from '~/compontents/dashboard/navbar';

import stylesUrl from '~/styles/index.css';

export const links: LinksFunction = () => {
    return [{ rel: 'stylesheet', href: stylesUrl }];
};

export default function DashboardShell() {
    return (
        <AppShell navbar={<DashboardNavBar />} fixed>
            <Container size={'lg'}>
                <Outlet />
            </Container>
        </AppShell>
    );
}
