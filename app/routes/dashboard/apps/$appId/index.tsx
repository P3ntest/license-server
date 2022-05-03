import { Button, Code, Container, Divider, Group, JsonInput, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { App } from "@prisma/client";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Check } from "tabler-icons-react";
import { getAccount } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { hasPermission } from "~/services/permission.server";

interface LoaderData {
    app: App
}

export default function AppIndex() {
    const { app } = useLoaderData<LoaderData>();

    const [showingKey, setShowingKey] = useState<boolean>(false);

    const [payload, setPayload] = useState<string>(app.payload);

    const payloadChanged = payload !== app.payload;

    return <Stack spacing="md">
        <div>
            <Title order={3}>Tokens</Title>
            <Text weight={600}>Key: <Button variant="subtle" onClick={() => setShowingKey(!showingKey)}>{showingKey ? "Hide" : "Show"}</Button></Text>
            {showingKey ?
                <Code>
                    {app.key}
                </Code>
                : null}
        </div>

        <Stack>
            <Title order={3}>App Payload</Title>
            <Form method="patch">
                <JsonInput
                    minRows={4}
                    placeholder="Optional Payload for every license"
                    formatOnBlur autosize
                    mb={10}

                    value={payload}
                    onChange={setPayload}

                    name="payload"
                />
                <Group spacing="sm">
                    <Button type="submit" disabled={!payloadChanged} onClick={() => {
                        showNotification({
                            title: "Saved",
                            message: "Payload has been saved",
                            icon: <Check />,
                            color: "green"
                        })
                    }}>Save</Button>
                    <Button type="reset" variant="outline" disabled={!payloadChanged}
                        onClick={() => setPayload(app.payload)}>
                        Reset
                    </Button>
                </Group>
            </Form>
        </Stack>
    </Stack >
}

export const action: ActionFunction = async ({ request, params }) => {
    const account = await getAccount(request);
    await hasPermission(params.appId!, account.id, true);

    if (request.method === "PATCH") {
        const formData = await request.formData();

        const payload = formData.has("payload") ? formData.get("payload") as string : undefined;

        await db.app.update({
            where: { id: params.appId! },
            data: {
                payload
            }
        });

        return {};
    }
};

export const loader: LoaderFunction = async ({ params, request }) => {
    const account = await getAccount(request);
    await hasPermission(params.appId!, account.id, true);

    const app = await db.app.findFirst({
        where: {
            id: params.appId!
        }
    });

    return {
        app
    } as LoaderData
};