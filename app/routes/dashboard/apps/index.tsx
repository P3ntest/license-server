import { ActionIcon, Button, Card, Divider, Group, Input, InputWrapper, Modal, SimpleGrid, Space, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { App } from "@prisma/client";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Box, Check, Plus, Search, X } from "tabler-icons-react";
import { DashboardHeader } from "~/compontents/dashboard/header";
import { getAccount } from "~/services/auth.server";
import { db } from "~/services/db.server";
import generateToken from "~/services/token.server";

interface LoaderData {
    apps: App[]
}

export default function Apps() {
    const { apps } = useLoaderData<LoaderData>();

    const [opened, setOpened] = useState(false);
    const [filter, setFilter] = useState("");

    return <>
        <DashboardHeader title="Apps" crumbs={["Apps"]} rightSection={<Button leftIcon={<Plus />} onClick={() => setOpened(true)}>Create New</Button>} />

        <Input value={filter} onChange={(e: any) => setFilter(e.target.value)} icon={<Search />} rightSection={<ActionIcon onClick={() => setFilter("")}><X /></ActionIcon>} />

        <Space h={20} />

        <SimpleGrid
            cols={4}
            spacing="lg"
            breakpoints={[
                { maxWidth: 980, cols: 3, spacing: 'md' },
                { maxWidth: 755, cols: 2, spacing: 'sm' },
                { maxWidth: 600, cols: 1, spacing: 'sm' },
            ]}
        >
            {apps.filter(app => app.name.toLowerCase().includes(filter.toLowerCase())).map(app => {
                return <Link to={app.id} key={app.id}>
                    <Card withBorder>
                        <Group>
                            <Box />
                            <Text weight={700}>{app.name}</Text>
                        </Group>
                        <Divider variant="dashed" my={10} />
                        <Text color="dimmed">Created at {new Date(app.createdAt).toDateString()}</Text>
                    </Card>
                </Link>
            })}
        </SimpleGrid>

        {apps.length == 0 ? <Text>You don't have any apps yet! </Text> : null}


        <Modal
            opened={opened}
            centered
            onClose={() => setOpened(false)}
            title="Create new app"
        >
            <Form method="post">
                <InputWrapper label="App Name" required description="Enter the name of your app">
                    <Input name="name" data-autofocus required />
                </InputWrapper>
                <Space h={20} />
                <Button type="submit" onClick={() => {
                    setOpened(false);
                    showNotification({
                        title: "App created",
                        message: "Your app has been created successfully",
                        icon: <Check />,
                        color: "green"
                    });
                }}>Create</Button>
            </Form>
        </Modal>
    </>


}

export const loader: LoaderFunction = async ({ request }) => {
    const account = await getAccount(request);

    const apps = await db.app.findMany({
        where: {
            creatorId: account.id
        }
    });

    return {
        apps
    } as LoaderData
};

export const action: ActionFunction = async ({ request }) => {
    const account = await getAccount(request);

    const formData = await request.formData();

    const name = formData.get("name") as string;

    const app = await db.app.create({
        data: {
            name,
            creatorId: account.id,
            key: generateToken()
        }
    });

    return redirect(`/dashboard/apps/${app.id}`);
};