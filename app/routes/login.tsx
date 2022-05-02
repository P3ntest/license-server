import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export default function Login() {
    return <Form method="post">
        <input type="text" name="username" />
        <input type="password" name="password" />
        <input type="submit" value="Login" />
    </Form>
}

export const action: ActionFunction = async ({ request }) => {
    return await authenticator.authenticate("user-pass", request, {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
    });
};

export let loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request, {
        successRedirect: "/dashboard",
    });
};