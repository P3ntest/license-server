import {
    Card,
    Center,
    Group,
    Title,
    Stack,
    Text,
    Blockquote,
    Code,
    ActionIcon,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import type { App, License } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { FileCertificate, Clipboard } from 'tabler-icons-react';
import { CopyToClipboardButton } from '~/compontents/copy';
import { CardHero } from '~/compontents/heros';
import { db } from '~/services/db.server';

interface LoaderData {
    license?: License;
    app?: App;
}

export default function LicenseShare() {
    const { license, app } = useLoaderData<LoaderData>();

    const { copy } = useClipboard();

    if (license === null || license === undefined || !app) {
        return (
            <CardHero>
                <Title order={3}>License not found or deleted</Title>
            </CardHero>
        );
    }

    return (
        <CardHero>
            <Stack>
                <Blockquote
                    color='green'
                    cite={
                        <>
                            Issued to {license.assignedTo} at{' '}
                            {new Date(license.createdAt).toLocaleString()}
                        </>
                    }
                    icon={<FileCertificate />}
                >
                    License for {app.name}
                </Blockquote>
                <Stack spacing='sm'>
                    <Title order={4}>License key</Title>
                    <Group spacing='sm'>
                        <Code>{license.key}</Code>
                        <CopyToClipboardButton
                            label='Copy license key to Clipboard'
                            content={license.key}
                            icon={<Clipboard />}
                            message='License key copied to clipboard'
                        />
                    </Group>
                </Stack>
                <Stack spacing='sm'>
                    <Title order={4}>App ID</Title>
                    <Group spacing='sm'>
                        <Code>{app.id}</Code>
                        <CopyToClipboardButton
                            label='Copy App ID to Clipboard'
                            content={app.id}
                            icon={<Clipboard />}
                            message='App ID copied to clipboard'
                        />
                    </Group>
                </Stack>
            </Stack>
        </CardHero>
    );
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const license = await db.license.findFirst({
        where: {
            key: params.licenseId,
        },
        include: {
            app: true,
        },
    });

    return {
        license,
        app: license?.app,
    };
};
