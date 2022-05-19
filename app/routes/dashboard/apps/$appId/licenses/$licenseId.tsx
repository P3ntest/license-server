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
  Textarea,
  Container,
  TextInput,
} from "@mantine/core";
import { App, License, LicenseAccess } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useInputState } from "@mantine/hooks";
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
      <PropEditor license={license} />
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

const PropEditor = ({ license }: { license: License }) => {
  const [payload, setPayload] = useInputState(license.payload);
  const [label, setLabel] = useInputState(license.label);

  const [ipInput, setIpInput] = useInputState(license.ips.join("\n"));
  const [blackListInput, setBlackListInput] = useInputState(
    license.ipBlacklist.join("\n")
  );

  const ips = ipInput.split("\n").filter((ip) => ip !== "");
  const ipBlacklist = blackListInput.split("\n").filter((ip) => ip !== "");

  const changed =
    payload != license.payload ||
    JSON.stringify(ips) != JSON.stringify(license.ips) ||
    JSON.stringify(ipBlacklist) != JSON.stringify(license.ipBlacklist) ||
    label != license.label;

  return (
    <Form method="patch">
      <Container>
        <Stack>
          <TextInput
            value={label}
            onChange={setLabel}
            label="License Label"
            placeholder="My license"
          />
          <Textarea
            label="Payload"
            value={payload}
            onChange={setPayload}
            placeholder="Payload"
            autosize
          />
          <Textarea
            defaultValue={license.ips.join("\n")}
            label="IP Whitelist"
            placeholder="One IP per line"
            value={ipInput}
            onChange={setIpInput}
            autosize
          />
          <Textarea
            defaultValue={license.ipBlacklist.join("\n")}
            label="IP Blacklist"
            placeholder="One IP per line"
            value={blackListInput}
            onChange={setBlackListInput}
            autosize
          />
          <Button type="submit" disabled={!changed}>
            Save
          </Button>
        </Stack>
      </Container>
    </Form>
  );
};

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
