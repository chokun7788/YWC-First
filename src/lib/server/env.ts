import "server-only";
import { parseEnv } from "../schemas/env";
export function getServerEnv() { return parseEnv(process.env); }
