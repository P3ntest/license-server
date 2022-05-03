import { Title } from "@mantine/core";
import { LoaderFunction } from "@remix-run/node";

export default function LicenseOverview() {
    return <>
        <Title order={2}>Licenses</Title>
    </>
}

export const loader: LoaderFunction = async () => {


    return {}
};