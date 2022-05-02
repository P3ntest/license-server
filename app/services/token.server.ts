import crypto from "crypto";

export default function generateToken(): string {
    return crypto.randomBytes(24).toString("hex");
}