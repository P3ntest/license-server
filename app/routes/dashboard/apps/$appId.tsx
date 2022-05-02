import { ActionIcon, Button, Divider, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { App } from "@prisma/client";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Check, Cross, Edit } from "tabler-icons-react";
import { DashboardHeader } from "~/compontents/dashboard/header";
import { getAccount } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { hasPermission } from "~/services/permission.server";

interface LoaderData {
    app: App
}

export default function App() {
    const { app } = useLoaderData<LoaderData>();

    const [opened, setOpened] = useState(false);

    const [deleteValue, setDeleteValue] = useState("");

    const close = () => {
        setOpened(false);
        setDeleteValue("");
    }

    return <>
        <DashboardHeader divider={false} crumbs={[["Apps", "/apps"], app.name]} title={<Group>{app.name} <EditNameButton currentName={app.name} /></Group>} rightSection={
            <Group>
                <Button color="red" onClick={() => setOpened(true)}>Delete</Button>
            </Group>} />

        <Group>
            <Link to={`/dashboard/apps/${app.id}`}><Button variant="light">General</Button></Link>
            <Link to={`/dashboard/apps/${app.id}/licenses`}><Button variant="light">View Licenses</Button></Link>
        </Group>
        <Divider my={20} />

        <Outlet />

        <Modal
            opened={opened}
            onClose={close}
            title="Are you sure?"
        >
            <Form method="delete">
                <TextInput data-autofocus label={`Please type "${app.name}" to continue`} value={deleteValue} onChange={(e: any) => setDeleteValue(e.target.value)} />
                <Group mt={10}>
                    <Button color="gray" onClick={close}>Cancel</Button>
                    <Button color="red" type="submit" disabled={app.name !== deleteValue} onClick={() => {
                        showNotification({
                            title: "Deleted",
                            message: "App has been deleted.",
                            color: "red",
                            icon: <Check />
                        })
                    }}>Delete</Button>
                </Group>
            </Form>
        </Modal>
    </>
}

const EditNameButton = ({ currentName }: { currentName: string }) => {
    const [open, setOpen] = useState<boolean>(false);

    const [newName, setNewName] = useState<string>(currentName);

    const close = () => {
        setOpen(false);
        setNewName(currentName);
    }

    return <>
        <ActionIcon onClick={() => setOpen(true)}><Edit /></ActionIcon>

        <Modal
            opened={open}
            onClose={close}
            title="Rename App"
        >
            <Form method="patch">
                <Stack>
                    <TextInput data-autofocus label="New name" name="name" required value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <Button type="submit" disabled={newName === currentName} onClick={() => {
                        showNotification({
                            title: "Renamed",
                            message: "App has been renamed to \"" + newName + "\"",
                            icon: <Check />,
                            color: "green"
                        });

                        setOpen(false);
                    }}>Rename</Button>
                </Stack>
            </Form>
        </Modal>
    </>;

}

export const loader: LoaderFunction = async ({ request, params }) => {
    const account = await getAccount(request);

    const app = await db.app.findFirst({
        where: {
            creatorId: account.id,
            id: params.appId
        }
    });

    if (!app) {
        return redirect("/dashboard/apps")
    }

    return {
        app
    } as LoaderData;
};

export const action: ActionFunction = async ({ request, params }) => {
    const account = await getAccount(request);

    await hasPermission(params.appId!, account.id, true);

    if (request.method === "DELETE") {
        await db.app.delete({
            where: {
                id: params.appId
            }
        });

        return redirect("/dashboard/apps");
    }

    if (request.method === "PATCH") {
        const formData = await request.formData();

        const name = formData.has("name") ? formData.get("name") as string : undefined;

        await db.app.update({
            where: {
                id: params.appId
            },
            data: {
                name
            }
        });

        return {};
    }
};