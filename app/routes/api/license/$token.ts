import { json, LoaderFunction } from "@remix-run/node";
import { locale } from "dayjs";
import { getClientIPAddress } from "remix-utils";
import { db } from "~/services/db.server";

async function badAccess(licenseId: string, ip: string, error: string) {
  await db.licenseAccess.create({
    data: {
      allowed: false,
      licenseId,
      ip,
    },
  });
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const ip = getClientIPAddress(request);

  if (ip === null) {
    return json({
      allowed: false,
      error: "INVALID_IP_ADDRESS",
      message: "Invalid IP address",
    });
  }

  const license = await db.license.findFirst({
    where: {
      key: params.token!,
    },
    include: {
      app: true,
    },
  });

  if (license === null) {
    return json({
      allowed: false,
      error: "INVALID_LICENSE_KEY",
      message: "License not found",
    });
  }

  if (license.validUntil && license.validUntil.getTime() < Date.now()) {
    badAccess(license.id, ip, "LICENSE_EXPIRED");
    return json({
      allowed: false,
      error: "LICENSE_EXPIRED",
      message: "License expired",
    });
  }

  if (license.ipLimited && !license.ips.includes(ip)) {
    badAccess(license.id, ip, "LICENSE_IP_LIMITED");
    return json({
      allowed: false,
      error: "LICENSE_IP_LIMITED",
      message: "Your IP is not whitlisted",
    });
  }

  if (license.ipBlacklist.includes(ip)) {
    badAccess(license.id, ip, "LICENSE_IP_BLACKLISTED");
    return json({
      allowed: false,
      error: "LICENSE_IP_BLACKLISTED",
      message: "Your IP is blacklisted",
    });
  }

  await db.licenseAccess.create({
    data: {
      allowed: true,
      licenseId: license.id,
      ip,
    },
  });

  return json({
    allowed: true,
    license: {
      payload: license.payload,
      validUntil: license.validUntil,
    },
    app: {
      name: license.app.name,
      payload: license.app.payload,
    },
  });
};
