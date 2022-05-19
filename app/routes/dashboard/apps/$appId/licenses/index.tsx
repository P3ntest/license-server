import {
    Badge,
    Card,
    Group,
    Text,
    Title,
    Divider,
    SimpleGrid,
    Button,
    Modal,
    Indicator,
    Switch,
    Stack,
    JsonInput,
    Textarea,
    TextInput,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import type { License, LicenseAccess } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import {
    Check,
    Key,
    Plus,
    History,
    Clock,
    SquareOff,
    ListCheck,
    License,
    FileCertificate,
} from 'tabler-icons-react';
import { Badges } from '~/compontents/dashboard/license';
import { getAccount } from '~/services/auth.server';
import { db } from '~/services/db.server';
import { hasPermission } from '~/services/permission.server';
import generateToken from '~/services/token.server';

interface LoaderData {
    licenses: (License & {
        accesses: LicenseAccess[];
    })[];
}

export default function LicenseOverview() {
    const { licenses } = useLoaderData<LoaderData>();

    const actionData = useActionData();

    return (
        <Stack>
            <Group>
                <Title order={2}>Licenses</Title>
                {JSON.stringify(actionData)}
                <AddLicenseButton />
            </Group>
            <SimpleGrid cols={2}>
                {licenses.map(license => (
                    <Link to={license.id} key={license.id}>
                        <Card withBorder p='md'>
                            <Group>
                                <FileCertificate />
                                <Text weight={700}>{license.label}</Text>
                                <Badges license={license} />
                            </Group>
                            <Divider my='md' variant='dashed' />
                            <Stack>
                                <Text color='dimmed'>
                                    Created at{' '}
                                    {new Date(license.createdAt).toLocaleString()}
                                </Text>
                                <Text color='dimmed'>
                                    Last used{' '}
                                    {new Date(
                                        license.accesses
                                            .filter(a => a.allowed)
                                            .sort(
                                                (a, b) =>
                                                    a.time.getTime() - b.time.getTime()
                                            )[0]
                                            ?.time.toString()
                                    ).toLocaleString() ?? 'never'}
                                </Text>
                                <Text color='dimmed'>
                                    Last error{' '}
                                    {new Date(
                                        license.accesses
                                            .filter(a => !a.allowed)
                                            .sort(
                                                (a, b) =>
                                                    a.time.getTime() - b.time.getTime()
                                            )[0]
                                            ?.time.toString()
                                    ).toLocaleString() ?? 'never'}
                                </Text>
                                <Text color='dimmed'>
                                    Total uses{' '}
                                    {license.accesses.filter(a => a.allowed).length}
                                </Text>
                            </Stack>
                        </Card>
                    </Link>
                ))}
            </SimpleGrid>

            {licenses.length === 0 ? <Text color='dimmed'>No licenses found</Text> : null}
        </Stack>
    );
}

const AddLicenseButton = () => {
    const [open, setOpen] = useState<boolean>(false);

    const [isTimeLimited, setIsTimeLimited] = useState<boolean>(false);

    const [isIpLimited, setIsIpLimited] = useState<boolean>(false);

    const onClose = () => {
        setOpen(false);
        setIsIpLimited(false);
        setIsTimeLimited(false);
    };

    return (
        <>
            <Button leftIcon={<Plus />} onClick={() => setOpen(true)}>
                New
            </Button>

            <Modal opened={open} centered onClose={onClose} title='Create new License'>
                <Form method='post'>
                    <Stack>
                        <TextInput label='Label' name='label' />
                        <Switch
                            value='timeLimited'
                            label='Only valid until'
                            checked={isTimeLimited}
                            onChange={e => setIsTimeLimited(e.currentTarget.checked)}
                        />
                        <DatePicker
                            name='validUntil'
                            required={isTimeLimited}
                            placeholder='Pick date'
                            label='Valid until'
                            disabled={!isTimeLimited}
                            renderDay={date => {
                                const day = date.getDate();
                                return (
                                    <Indicator
                                        size={6}
                                        color='blue'
                                        offset={8}
                                        disabled={!isToday(date)}
                                    >
                                        <div>{day}</div>
                                    </Indicator>
                                );
                            }}
                        />
                        <JsonInput name='payload' label='Payload' />
                        <Switch
                            name='ipLimited'
                            value='ipLimited'
                            label='Ip Limited'
                            checked={isIpLimited}
                            onChange={e => setIsIpLimited(e.currentTarget.checked)}
                        />
                        <Textarea
                            name='ips'
                            disabled={!isIpLimited}
                            label='IP Whitelist'
                            autosize
                            placeholder='One IP mask per line'
                        />
                        <Button
                            type='submit'
                            onClick={() => {
                                onClose();
                                showNotification({
                                    title: 'Created',
                                    message: 'License has been created',
                                    icon: <Check />,
                                    color: 'green',
                                });
                            }}
                        >
                            Create
                        </Button>
                    </Stack>
                </Form>
            </Modal>
        </>
    );
};

const isToday = (someDate: Date) => {
    const today = new Date();
    return (
        someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
    );
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const account = await getAccount(request);
    await hasPermission(params.appId!, account.id, true);

    const licenses = await db.license.findMany({
        where: {
            appId: params.appId!,
        },
        include: {
            accesses: true,
        },
    });

    return {
        licenses,
    } as LoaderData;
};

export const action: ActionFunction = async ({ request, params }) => {
    const account = await getAccount(request);
    await hasPermission(params.appId!, account.id, true);

    const formData = await request.formData();

    console.log('ipLimited', formData.has('ipLimited'));

    const license = await db.license.create({
        data: {
            key: generateToken(),
            ipLimited: formData.has('ipLimited'),
            ips: (formData.get('ips') as string)?.split('\n'),
            payload: (formData.get('payload') as string) ?? '',

            label: (formData.get('label') as string) ?? '',

            validUntil: formData.has('isTimeLimited')
                ? new Date(formData.get('validUntil') as string)
                : null,

            appId: params.appId!,
        },
    });

    return {
        license,
    };
};
