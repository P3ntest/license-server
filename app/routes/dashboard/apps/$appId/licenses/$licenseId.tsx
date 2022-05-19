import {
  Center,
  Group,
  Stack,
  Title,
  Text,
  JsonInput,
  Button,
  Header,
  Table,
  Code,
} from "@mantine/core";
import { License, LicenseAccess } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  ArrowBack,
  ArrowLeft,
  ArrowLoopLeft,
  Clock,
  ShieldCheck,
} from "tabler-icons-react";
import { Badges } from "~/compontents/dashboard/license";
import { getAccount } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { hasPermission } from "~/services/permission.server";

interface LoaderData {
  license: License;
  accesses: LicenseAccess[];
  app: App;
}

export default function LicenseOverview() {
  const { license, accesses, app } = useLoaderData<LoaderData>();

  return (
    <Stack>
      <Link to={`/dashboard/apps/${app.id}/licenses`}>
        <Text color="blue">
          <Group>
            <ArrowLeft />
            Back to Overview
          </Group>
        </Text>
      </Link>
      <Group>
        <Title order={3}>{license.label}</Title>
        <Badges license={license} />
      </Group>
      <Form method="patch">
        <Stack>
          <JsonInput label="Payload" defaultValue={license.payload} />
          <Button type="submit" disabled>
            Save
          </Button>
        </Stack>
      </Form>
      <Title order={4}>Access Log</Title>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Time</th>
            <th>Access</th>
            <th>Client IP</th>
            <th>Additional Info</th>
          </tr>
        </thead>
        <tbody>
          {accesses.map((access) => (
            <tr key={access.id}>
              <td>
                <Text>{new Date(access.time).toLocaleString()}</Text>
              </td>
              <td>
                <Text>
                  {access.allowed ? (
                    <Text color="green">
                      <ShieldCheck />
                    </Text>
                  ) : (
                    <Text color="red">{access.error}</Text>
                  )}
                </Text>
              </td>
              <td>
                <Code>{access.ip}</Code>
              </td>
              <td>
                {access.additional ? (
                  <Code>{JSON.stringify(access.additional, null, 2)}</Code>
                ) : (
                  <Text>None</Text>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Stack>
  );
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const account = await getAccount(request);
  await hasPermission(params.appId!, account.id, true);

  const license = await db.license.findFirst({
    where: {
      id: params.licenseId,
    },
    include: {
      accesses: {
        orderBy: {
          time: "desc",
        },
      },
      app: true,
    },
  });

  return {
    license,
    accesses: license!.accesses,
    app: license!.app,
  } as LoaderData;
};
