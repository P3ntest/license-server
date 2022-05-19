import { Authenticator, AuthorizationError } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from '~/services/session.server';
import { db } from './db.server';
import bcrypt from 'bcrypt';
import { Account } from '@prisma/client';

export interface UserSession {
    userId: string;
}

export let authenticator = new Authenticator<UserSession>(sessionStorage);

authenticator.use(
    new FormStrategy(async ({ form }) => {
        let username = form.get('username') as string | null;
        let password = form.get('password') as string | null;

        if (!username || !password) {
            throw new AuthorizationError('USER PASSWORD');
        }

        const account = await db.account.findFirst({
            where: {
                username: username,
            },
        });

        if (!account) {
            throw new AuthorizationError('USER');
        }

        const allowed = await bcrypt.compare(password, account.password);

        if (!allowed) {
            throw new AuthorizationError('PASSWORD');
        }

        return {
            userId: account.id,
        };
    }),
    'user-pass'
);

authenticator.use(
    new FormStrategy(async ({ form }) => {
        let username = form.get('username') as string | null;
        let password = form.get('password') as string | null;

        if (!username || !password) {
            throw new AuthorizationError('USER PASSWORD');
        }

        const existing = await db.account.findFirst({
            where: {
                username: username,
            },
        });

        if (existing) {
            throw new AuthorizationError('USER');
        }

        const account = await db.account.create({
            data: {
                username: username,
                password: await bcrypt.hash(password, 10),
            },
        });

        return {
            userId: account.id,
        };
    }),
    'register'
);

export async function getAccount(request: Request): Promise<Account> {
    const userSession = await authenticator.isAuthenticated(request, {
        failureRedirect: '/login',
    });

    const user = await db.account.findFirst({
        where: {
            id: userSession.userId,
        },
    });

    if (!user) {
        throw new AuthorizationError('User not found');
    }

    return user;
}
