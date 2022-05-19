import { ActionIcon, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { Check, Clipboard } from 'tabler-icons-react';

export function CopyToClipboardButton({
    content,
    label,
    icon,
    message,
}: {
    content: string;
    label: string;
    icon: React.ReactNode;
    message: string;
}) {
    const { copy, copied } = useClipboard();
    return (
        <Tooltip label={label}>
            <ActionIcon
                disabled={copied}
                variant='hover'
                onClick={() => {
                    copy(content);
                    showNotification({
                        title: 'Copied',
                        message: message,
                        color: 'green',
                        icon: <Clipboard />,
                    });
                }}
            >
                {copied ? <Check /> : icon}
            </ActionIcon>
        </Tooltip>
    );
}
