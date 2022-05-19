import {
    Breadcrumbs,
    Button,
    Divider,
    Group,
    Stack,
    Title,
    Text,
    Space,
} from '@mantine/core';
import { Link } from '@remix-run/react';
import { ReactNode } from 'react';

export function DashboardHeader({
    title,
    rightSection,
    crumbs,
    divider = true,
}: {
    title: ReactNode;
    rightSection?: ReactNode;
    crumbs?: (string | [string, string])[];
    divider?: boolean;
}) {
    crumbs = crumbs ? [['Dashboard', '/'], ...crumbs] : [['Dashboard', '/']];

    return (
        <>
            <Group position='apart'>
                <Stack>
                    <Title>{title}</Title>
                    <Breadcrumbs>
                        {crumbs?.map((crumb, index) => {
                            if (typeof crumb === 'string') {
                                return <Text key={crumb}>{crumb}</Text>;
                            } else {
                                return (
                                    <Text key={crumb[1]} variant='link'>
                                        <Link
                                            style={{ color: 'inherit' }}
                                            to={'/dashboard' + crumb[1]}
                                        >
                                            {crumb[0]}
                                        </Link>
                                    </Text>
                                );
                            }
                        })}
                    </Breadcrumbs>
                </Stack>
                {rightSection}
            </Group>
            {divider ? <Divider my={20} /> : <Space h={20} />}
        </>
    );
}
