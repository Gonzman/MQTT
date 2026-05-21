import { ref } from "vue";
import type { Ref } from "vue";
import client, { url } from "./client";
import type { components } from "@/types/schema";
import { th } from "@nuxt/ui/runtime/locale/index.js";

type ValueDto = components["schemas"]["ValueDto"];

interface ValueCreatedEvent {
    event: "VALUE_CREATED";
    data: components["schemas"]["ValueDto"];
}

interface ValueDeletedEvent {
    event: "VALUE_DELETED";
    data: {
        topicId: string;
        id: string;
    };
}

interface NodeMovedEvent {
    event: "NODE_MOVED";
    data: {
        categoryId: "00000000-0000-0000-0000-000000000000";
        id: "00000000-0000-0000-0000-000000000000";
        newCategoryId: "00000000-0000-0000-0000-000000000000";
    };
}

type wsData = ValueCreatedEvent | ValueDeletedEvent;

class DataManager {
    private static instance: DataManager;

    private data: Record<string, Ref<ValueDto[]>> = {};
    private pending: Record<string, Promise<Ref<ValueDto[]> | undefined>> = {};

    private ws: WebSocket;

    private _categories: Ref<components["schemas"]["CategoryDto"][]> = ref([]);
    private _nodes: Record<string, Ref<components["schemas"]["NodeDto"][]>> = {};
    private _status: Ref<string> = ref("Error");

    /**
     * Es wird die Verbindung zum WebSocket Server aufgebaut und die Events werden verarbeitet
     */
    private constructor() {
        this.ws = new WebSocket(`wss://${url}/ws`);

        this.ws.addEventListener("open", () => {
            console.log("CONNECTED");
        });

        this.ws.addEventListener("message", (e) => {
            if (typeof e.data !== "string") {
                return;
            }

            let payload: wsData;
            try {
                payload = JSON.parse(e.data) as wsData;
            } catch {
                return;
            }

            if (payload.event === "VALUE_CREATED") {
                this.handleValueCreated(payload);
            }

            if (payload.event === "VALUE_DELETED") {
                this.handleValueDeleted(payload);
            }
        });

        client.GET("/categories").then((data) => {
            if (!data.data) {
                this._status.value = "Bad";
                return;
            }
            this._categories.value = data.data.categories;

            for (const categorie of this._categories.value) {
                this._nodes[categorie.id] = ref([]);

                client
                    .GET("/categories/{categoryId}/nodes", { params: { path: { categoryId: categorie.id } } })
                    .then((nodeData) => {
                        if (!nodeData.data) return;
                        this._nodes[categorie.id]!.value = nodeData.data.nodes;
                    });
            }
        });
    }

    /**
     * Die neuen Daten vom Event werden genommen die dann im richtigen Array hinzugefügt werden.
     */
    private handleValueCreated(payload: ValueCreatedEvent) {
        const values = this.data[payload.data.topicId];

        if (!values) {
            return;
        }

        if (values.value.some((x) => x.id === payload.data.id)) {
            return;
        }

        values.value.push({
            id: payload.data.id,
            topicId: payload.data.topicId,
            value: payload.data.value,
            createdAt: payload.data.createdAt ?? new Date().toISOString()
        });
    }

    /**
     * Es wird das Daten vom richtigen Array gelöscht
     */
    private handleValueDeleted(payload: ValueDeletedEvent) {
        const values = this.data[payload.data.topicId];

        if (!values) {
            return;
        }

        values.value = values.value.filter((x) => x.id !== payload.data.id);
    }

    /**
     * Wenn die Daten schon gespeichert sind oder gerade in Bearbeitung sind werden die Daten zurückgegeben.
     * Wenn es in keinem von beiden ist, werden die Daten vom Server angefragt und zurückgegeben.
     */
    public async listenForData(id: string) {
        if (this.data[id]) {
            return this.data[id];
        }

        if (this.pending[id]) {
            return this.pending[id];
        }

        this.pending[id] = (async () => {
            const request = await client.GET("/topics/{topicId}/values", {
                params: { path: { topicId: id }, query: { limit: 1 } }
            });

            if (!request.data) {
                return undefined;
            }

            this.data[id] = ref(request.data.values);

            return this.data[id];
        })();

        try {
            return await this.pending[id];
        } finally {
            delete this.pending[id];
        }
    }

    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }
        return DataManager.instance;
    }

    get categories() {
        return this._categories;
    }

    public getNodes(categorieId: string) {
        if (!this._nodes[categorieId]) {
            this._nodes[categorieId] = ref<components["schemas"]["NodeDto"][]>([]);

            client
                .GET("/categories/{categoryId}/nodes", { params: { path: { categoryId: categorieId } } })
                .then((nodeData) => {
                    if (!nodeData.data) return;
                    this._nodes[categorieId]!.value = nodeData.data.nodes;
                });
        }

        return this._nodes[categorieId];
    }
}

export default DataManager.getInstance();
