import { Button, Card, Divider, Group, Input, InputWrapper, Modal, SimpleGrid, Space, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { App } from "@prisma/client";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Plus, Search } from "tabler-icons-react";
import { getAccount } from "~/services/auth.server";
import { db } from "~/services/db.server";

interface LoaderData {
    apps: App[]
}

export default function Apps() {
    const { apps } = useLoaderData<LoaderData>();

    const [opened, setOpened] = useState(false);
    const [filter, setFilter] = useState("");

    return <>
        <Group position="apart">
            <Title>Apps</Title>
            <Button leftIcon={<Plus />} onClick={() => setOpened(true)}>Create New</Button>
        </Group>
        <Divider my={20} />

        <Input value={filter} onChange={(e: any) => setFilter(e.target.value)} icon={<Search />} width={200} />

        <SimpleGrid
            cols={4}
            spacing="lg"
            breakpoints={[
                { maxWidth: 980, cols: 3, spacing: 'md' },
                { maxWidth: 755, cols: 2, spacing: 'sm' },
                { maxWidth: 600, cols: 1, spacing: 'sm' },
            ]}
        >
            {apps.map(app => {
                return <Card withBorder>
                    <Text weight={700}>{app.name}</Text>
                </Card>;
            })}
        </SimpleGrid>

        {apps.length == 0 ? <Text>You don't have any apps yet!</Text> : null}


        <Modal
            opened={opened}
            centered
            onClose={() => setOpened(false)}
            title="Create new app"
        >
            <Form method="post">
                <InputWrapper label="App Name" required description="Enter the name of your app">
                    <Input name="name" />
                    <Space h={20} />
                    <Button type="submit" onClick={() => {
                        setOpened(false);
                        showNotification({
                            title: "App created",
                            message: "Your app has been created successfully",
                        });
                    }}>Create</Button>
                </InputWrapper>
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

    await db.app.create({
        data: {
            name,
            creatorId: account.id
        }
    });

    return {};
};