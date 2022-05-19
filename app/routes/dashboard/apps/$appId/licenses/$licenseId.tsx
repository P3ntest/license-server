import {
    Center,
    Group,
    Stack,
    Title,
    Text,
    JsonInput,
    Button,
    Header,
    Table,
    Code,
    Textarea,
    Container,
    TextInput,
    Switch,
} from '@mantine/core';
import type { App, License, LicenseAccess } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { useBooleanToggle, useInputState, useToggle } from '@mantine/hooks';
import {
    ArrowBack,
    ArrowLeft,
    ArrowLoopLeft,
    Box,
    Clock,
    DatabaseExport,
    FileCertificate,
    ShieldCheck,
} from 'tabler-icons-react';
import { Badges } from '~/compontents/dashboard/license';
import { getAccount } from '~/services/auth.server';
import { db } from '~/services/db.server';
import { hasPermission } from '~/services/permission.server';
import { useState } from 'react';

interface LoaderData {
    license: License;
    accesses: LicenseAccess[];
    app: App;
}

export default function LicenseOverview() {
    const { license, accesses, app } = useLoaderData<LoaderData>();
    const [showingKey, setShowingKey] = useState<boolean>(false);

    return (
        <Stack>
            <Link to={`/dashboard/apps/${app.id}/licenses`}>
                <Text color='blue'>
                    <Group>
                        <ArrowLeft />
                        Back to Overview
                    </Group>
                </Text>
            </Link>
            <Group>
                <Title order={3}>
                    <FileCertificate /> {license.label}
                </Title>
                <Badges license={license} />
            </Group>
            <Title order={4}>Token</Title>
            <Group>
                <Text weight={600}>
                    Key:{' '}
                    <Button variant='subtle' onClick={() => setShowingKey(!showingKey)}>
                        {showingKey ? 'Hide' : 'Show'}
                    </Button>
                </Text>
                {showingKey ? <Code>{license.key}</Code> : null}
            </Group>
            <PropEditor license={license} />
            <Title order={4}>Access Log</Title>
            <Table striped highlightOnHover>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Access</th>
                        <th>Client IP</th>
                        <th>Additional Info</th>
                    </tr>
                </thead>
                <tbody>
                    {accesses.map(access => (
                        <tr key={access.id}>
                            <td>
                                <Text>{new Date(access.time).toLocaleString()}</Text>
                            </td>
                            <td>
                                <Text>
                                    {access.allowed ? (
                                        <Text color='green'>
                                            <ShieldCheck />
                                        </Text>
                                    ) : (
                                        <Text color='red'>{access.error}</Text>
                                    )}
                                </Text>
                            </td>
                            <td>
                                <Code>{access.ip}</Code>
                            </td>
                            <td>
                                {access.additional ? (
                                    <Code>
                                        {JSON.stringify(access.additional, null, 2)}
                                    </Code>
                                ) : (
                                    <Text>None</Text>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Stack>
    );
}

const PropEditor = ({ license }: { license: License }) => {
    const [payload, setPayload] = useInputState(license.payload);
    const [label, setLabel] = useInputState(license.label);

    const [ipLimited, setIpLimited] = useBooleanToggle(license.ipLimited);

    const [ipInput, setIpInput] = useInputState(license.ips.join('\n'));
    const [blackListInput, setBlackListInput] = useInputState(
        license.ipBlacklist.join('\n')
    );

    const ips = ipInput.split('\n').filter(ip => ip !== '');
    const ipBlacklist = blackListInput.split('\n').filter(ip => ip !== '');

    const changed =
        payload != license.payload ||
        JSON.stringify(ips) != JSON.stringify(license.ips) ||
        JSON.stringify(ipBlacklist) != JSON.stringify(license.ipBlacklist) ||
        label != license.label ||
        ipLimited != license.ipLimited;

    return (
        <Form method='patch'>
            <Stack>
                <Title order={4}>General</Title>
                <TextInput
                    value={label}
                    onChange={setLabel}
                    label='License Label'
                    placeholder='My license'
                    name='label'
                />
                <Textarea
                    label='Payload'
                    value={payload}
                    onChange={setPayload}
                    placeholder='Payload'
                    autosize
                    name='payload'
                />
                <Title order={4}>IP Access Settings</Title>
                <Switch
                    label='IP Whitelist Enabled'
                    checked={ipLimited}
                    onChange={box => setIpLimited(box.currentTarget.checked)}
                    value='ipLimited'
                    name='ipLimited'
                />
                <Textarea
                    defaultValue={license.ips.join('\n')}
                    label='IP Whitelist'
                    placeholder='One IP per line'
                    value={ipInput}
                    onChange={setIpInput}
                    autosize
                    name='ips'
                />
                <Textarea
                    defaultValue={license.ipBlacklist.join('\n')}
                    label='IP Blacklist'
                    placeholder='One IP per line'
                    value={blackListInput}
                    onChange={setBlackListInput}
                    autosize
                    name='ipBlacklist'
                />
                <Button type='submit' disabled={!changed}>
                    Save
                </Button>
            </Stack>
        </Form>
    );
};

export const loader: LoaderFunction = async ({ params, request }) => {
    const account = await getAccount(request);
    await hasPermission(params.appId!, account.id, true);

    const license = await db.license.findFirst({
        where: {
            id: params.licenseId,
        },
        include: {
            accesses: {
                orderBy: {
                    time: 'desc',
                },
            },
            app: true,
        },
    });

    return {
        license,
        accesses: license!.accesses,
        app: license!.app,
    } as LoaderData;
};

export const action: ActionFunction = async ({ request, params }) => {
    const account = await getAccount(request);
    await hasPermission(params.appId!, account.id, true);

    const formData = await request.formData();

    await db.license.update({
        where: {
            id: params.licenseId!,
        },
        data: {
            label: formData.get('label') as string,
            payload: formData.get('payload') as string,
            ips: (formData.get('ips') as string).split('\n').filter(ip => ip !== ''),
            ipBlacklist: (formData.get('ipBlacklist') as string)
                .split('\n')
                .filter(ip => ip !== ''),
            ipLimited: formData.has('ipLimited'),
        },
    });

    return {};
};
