<template>
    <UInput placeholder="Name" v-model="name" />
    <USelectMenu v-model="selected" v-model:search-term="search" :items="topics" label-key="mqttTopic" search-input
        create-item @create="handleCreate" placeholder="Select or create MQTT topic" class="h-max" />
    <UButton color="success" @click="createNode">Create Node</UButton>
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
