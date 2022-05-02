import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
} from '@mantine/core';
import { getSession } from "~/services/session.server";
import { showNotification } from "@mantine/notifications";

export default function Login() {
    const { error } = useLoaderData();

    return <Container size={420} my={40}>
        <Title
            align="center"
            sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
        >
            Login
        </Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Form method="post">
                <TextInput name="username" label="Username" placeholder="Username" required error={error.includes("USER") ? "User not found" : undefined} />
                <PasswordInput name="password" label="Password" placeholder="Your password" required mt="md" />
                <Button fullWidth mt="xl" type="submit">
                    Sign in
                </Button>
            </Form>
        </Paper>
    </Container>
}

export const action: ActionFunction = async ({ request }) => {
    return await authenticator.authenticate("user-pass", request, {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
    });
};

export let loader: LoaderFunction = async ({ request }) => {
    await authenticator.isAuthenticated(request, {
        successRedirect: "/dashboard",
    });

    let session = await getSession(request.headers.get("cookie"));
    let error = session.get(authenticator.sessionErrorKey);
    console.log(error)
    return json({ error: error?.message ?? "" });
};