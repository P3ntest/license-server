import { LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export default function Index() {
  return <div></div>;
}

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return redirect("/dashboard");
};
