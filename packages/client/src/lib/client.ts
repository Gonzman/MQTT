import type { paths } from "@/types/schema";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import createClient, { type Middleware } from "openapi-fetch";

const url = "api.mqtt.tobi.tintuc.de";

const client = createClient<paths>({ baseUrl: "https://" + url });

interface APIError {
    code: string;
    details?: string;
    message: string;
}

const toast = useToast();

const middleware: Middleware = {
    async onResponse({ response }) {
        if (!response.ok) {
            const body: APIError = await response.clone().json();

            toast.add({
                title: body.message,
                description: body.details,
                color: "error",
                icon: "i-lucide-ban"
            });

            throw new Error(body.code);
        }

        return undefined;
    },
    async onError({ error }) {
        toast.add({
            title: "Error",
            description: String(error),
            color: "error",
            icon: "i-lucide-ban"
        });
    }
};

client.use(middleware);

export default client;
export { url };
