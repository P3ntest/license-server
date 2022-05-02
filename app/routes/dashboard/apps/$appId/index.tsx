import { Button, Code, Divider, Text, Title } from "@mantine/core";
import { App } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getAccount } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { hasPermission } from "~/services/permission.server";

interface LoaderData {
    app: App
}

export default function AppIndex() {
    const { app } = useLoaderData<LoaderData>();

    const [showingKey, setShowingKey] = useState<boolean>(false);

    return <>
        <Title order={3}>Tokens</Title>
        <Text weight={600}>Key: <Button variant="subtle" onClick={() => setShowingKey(!showingKey)}>{showingKey ? "Hide" : "Show"}</Button></Text>
        {showingKey ?
            <Code>
                {app.key}
            </Code>
            : null}
    </>
}

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