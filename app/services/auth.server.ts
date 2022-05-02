import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/services/session.server";
import { db } from "./db.server";
import bcrypt from "bcrypt";
import { Account } from "@prisma/client";

export interface UserSession {
    userId: string
}

export let authenticator = new Authenticator<UserSession>(sessionStorage);

authenticator.use(
    new FormStrategy(async ({ form }) => {
        let username = form.get("username") as string | null;
        let password = form.get("password") as string | null;

        if (!username || !password) {
            throw new AuthorizationError("Please provide a username and password");
        }

        const account = await db.account.findFirst({
            where: {
                username: username
            }
        });

        if (!account) {
            throw new AuthorizationError("User not found");
        }

        const allowed = await bcrypt.compare(password, account.password);

        if (!allowed) {
            throw new AuthorizationError("Invalid password");
        }

        return {
            userId: account.id
        }
    }),
    "user-pass"
);

export async function getAccount(request: Request): Promise<Account> {
    const userSession = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login"
    });

    const user = await db.account.findFirst({
        where: {
            id: userSession.userId
        }
    });

    if (!user) {
        throw new AuthorizationError("User not found");
    }

    return user;
}