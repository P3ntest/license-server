import React, { useState } from 'react';
import {
    createStyles,
    Navbar,
    Group,
    Code,
    Text,
    SegmentedControl,
    useMantineColorScheme,
    Center,
    Box,
    Button,
} from '@mantine/core';
import { Apps, Home, Logout, Moon, Sun, SwitchHorizontal } from 'tabler-icons-react';
import { Form, Link, NavLink } from '@remix-run/react';

const useStyles = createStyles((theme, _params, getRef) => {
    const icon = getRef('icon');
    return {
        navbar: {
            backgroundColor: theme.colors[theme.primaryColor][6],
        },

        version: {
            backgroundColor: theme.colors[theme.primaryColor][7],
            color: theme.white,
            fontWeight: 700,
        },

        header: {
            paddingBottom: theme.spacing.md,
            marginBottom: theme.spacing.md * 1.5,
            borderBottom: `1px solid ${theme.colors[theme.primaryColor][7]}`,
        },

        footer: {
            paddingTop: theme.spacing.md,
            marginTop: theme.spacing.md,
            borderTop: `1px solid ${theme.colors[theme.primaryColor][7]}`,
        },

        link: {
            ...theme.fn.focusStyles(),
            'display': 'flex',
            'alignItems': 'center',
            'textDecoration': 'none',
            'fontSize': theme.fontSizes.sm,
            'color': theme.white,
            'padding': `${theme.spacing.xs}px ${theme.spacing.sm}px`,
            'borderRadius': theme.radius.sm,
            'fontWeight': 500,

            '&:hover': {
                backgroundColor: theme.colors[theme.primaryColor][5],
            },
        },

        linkIcon: {
            ref: icon,
            color: theme.white,
            opacity: 0.75,
            marginRight: theme.spacing.sm,
        },

        linkActive: {
            '&, &:hover': {
                backgroundColor: theme.colors[theme.primaryColor][7],
                [`& .${icon}`]: {
                    opacity: 0.9,
                },
            },
        },
    };
});

const data = [
    { link: '/', label: 'Dashboard', icon: Home },
    { link: '/apps', label: 'Apps', icon: Apps },
];

export function DashboardNavBar() {
    const { classes, cx } = useStyles();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const links = data.map(item => (
        <NavLink
            className={cx(classes.link)}
            to={'/dashboard' + item.link}
            key={item.label}
        >
            <item.icon className={classes.linkIcon} />
            <span>{item.label}</span>
        </NavLink>
    ));

    return (
        <Navbar height='100vh' width={{ sm: 300 }} p='md' className={classes.navbar}>
            <Navbar.Section grow>
                <Group className={classes.header} position='apart'>
                    <Text size='lg' weight={700} color='white'>
                        License Server
                    </Text>
                    <Code className={classes.version}>v1.0.0</Code>
                </Group>
                {links}
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
                <Group position='center' my='xl'>
                    <SegmentedControl
                        value={colorScheme}
                        onChange={() => {
                            toggleColorScheme();
                        }}
                        data={[
                            {
                                value: 'light',
                                label: (
                                    <Center>
                                        <Sun size={16} />
                                        <Box ml={10}>Light</Box>
                                    </Center>
                                ),
                            },
                            {
                                value: 'dark',
                                label: (
                                    <Center>
                                        <Moon size={16} />
                                        <Box ml={10}>Dark</Box>
                                    </Center>
                                ),
                            },
                        ]}
                    />
                </Group>
                <Center>
                    <Form action='/logout' method='post'>
                        <Button type='submit'>Logout</Button>
                    </Form>
                </Center>
            </Navbar.Section>
        </Navbar>
    );
}
