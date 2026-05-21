<template>
    <form>
        <UInput class="modal-field w-full" placeholder="Name" v-model="name" /><br />
        <div class="pt-4">
            <USelectMenu
                v-model="selected"
                v-model:search-term="search"
                :items="topics"
                label-key="mqttTopic"
                search-input
                create-item
                @create="handleCreate"
                placeholder="Select or create MQTT topic"
                class="modal-field w-full"
            >
                <template #item="{ item }">
                    <div class="topic-option">
                        <span class="topic-option__label">{{ item.mqttTopic }}</span>

                        <UButton
                            class="topic-option__delete"
                            variant="ghost"
                            color="neutral"
                            size="xs"
                            icon="lucide:trash-2"
                            aria-label="Delete topic"
                            @mousedown.stop.prevent
                            @click.stop="deleteTopic(item)"
                        />
                    </div>
                </template>
            </USelectMenu>
        </div>
        <div class="modal-actions">
            <UButton color="success" @click="createNode" type="submit">Create Node</UButton>
        </div>
    </form>
</template>
<script setup lang="ts">
import client from "@/lib/client";
import type { components } from "@/types/schema";
import { onMounted, ref } from "vue";

const props = defineProps<{ category: string }>();

const model = defineModel<components["schemas"]["NodeDto"][]>({ required: true });

const emit = defineEmits(["close"]);

const name = ref("");

const topics = ref<components["schemas"]["TopicDto"][]>([]);

const selected = ref<components["schemas"]["TopicDto"] | undefined>(undefined);

const search = ref("");

// Handle create
function handleCreate(value: string) {
    const normalizedValue = value.trim();
    if (!normalizedValue) return;

    const existingTopic = topics.value.find((topic) => topic.mqttTopic.toLowerCase() === normalizedValue.toLowerCase());
    if (existingTopic) {
        selected.value = existingTopic;
        return;
    }

    const newTopic: components["schemas"]["TopicDto"] = {
        id: "CHANGEUUID",
        mqttTopic: normalizedValue,
        name: null
    };

    topics.value.push(newTopic);
    selected.value = newTopic;
}

async function deleteTopic(topic: components["schemas"]["TopicDto"]) {
    if (topic.id === "CHANGEUUID") {
        topics.value = topics.value.filter((candidate) => candidate.id !== topic.id);

        if (selected.value?.id === topic.id) {
            selected.value = undefined;
        }

        return;
    }

    const request = await client.DELETE("/topics/{topicId}", {
        params: { path: { topicId: topic.id } }
    });

    if (!request.response.ok) {
        return;
    }

    topics.value = topics.value.filter((candidate) => candidate.id !== topic.id);

    if (selected.value?.id === topic.id) {
        selected.value = undefined;
    }
}

async function createNode() {
    if (!selected.value) {
        return;
    }

    let topic = selected.value;

    if (selected.value.id == "CHANGEUUID") {
        const requestTopic = await client.POST("/topics", {
            body: { mqttTopic: selected.value.mqttTopic }
        });

        if (!requestTopic.data) {
            return;
        }

        topic = requestTopic.data;
    }

    const request = await client.POST("/categories/{categoryId}/nodes", {
        params: { path: { categoryId: props.category } },
        body: {
            name: name.value,
            topicId: topic.id
        }
    });

    if (request.data) {
        model.value.push(request.data);
        emit("close");
    }
}

onMounted(async () => {
    const response = await client.GET("/topics");

    if (!response.data) {
        return;
    }
    topics.value = response.data.topics;
});
</script>

<style scoped>
.topic-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
}

.topic-option__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.topic-option__delete {
    flex: none;
}
</style>
