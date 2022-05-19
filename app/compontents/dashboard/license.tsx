import { ActionIcon, Badge, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { License } from '@prisma/client';
import {
    Clock,
    ListCheck,
    SquareOff,
    History,
    Package,
    Share,
    Check,
    Clipboard,
} from 'tabler-icons-react';

export function Badges({ license }: { license: License }) {
    return (
        <>
            {license.payload && license.payload != '' ? (
                <Badge color='violet' leftSection={<Package size={9} />}>
                    Payload
                </Badge>
            ) : null}
            {license.ipLimited ? (
                <Badge color='green' leftSection={<ListCheck size={9} />}>
                    Ip Limited
                </Badge>
            ) : null}
            {license.ipBlacklist.length > 0 ? (
                <Badge color='orange' leftSection={<SquareOff size={9} />}>
                    Ip Blacklist
                </Badge>
            ) : null}
            {license.validUntil ? (
                <Badge leftSection={<Clock size={9} />}>Time Limited</Badge>
            ) : null}
            {license.validUntil && new Date(license.validUntil).getTime() < Date.now() ? (
                <Badge color='red' leftSection={<History size={9} />}>
                    Expired
                </Badge>
            ) : null}
        </>
    );
}
