import { App } from '@prisma/client';
import { db } from './db.server';

export async function hasPermission(
    appId: string,
    accountId: string,
    error?: boolean
): Promise<boolean> {
    const app = await db.app.findFirst({
        where: {
            id: appId,
            creatorId: accountId,
        },
    });

    if (!app) {
        if (error) {
            throw new Error("You don't have permission to access this app");
        }
        return false;
    }

    return true;
}
