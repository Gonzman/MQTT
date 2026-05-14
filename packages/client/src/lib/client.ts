import type { paths } from "@/types/schema";
import createClient from "openapi-fetch";

const url = "api.mqtt.tobi.tintuc.de";

const client = createClient<paths>({ baseUrl: "https://" + url });

export default client;

export { url };
