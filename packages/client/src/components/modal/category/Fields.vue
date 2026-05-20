<template>
    <UInput class="modal-field" placeholder="Name" v-model="name" />

    <div class="modal-actions">
        <UButton color="success" @click="createCategory">Create Category</UButton>
    </div>
</template>
<script setup lang="ts">
import client from "@/lib/client";
import type { components } from "@/types/schema";
import { ref } from "vue";

const model = defineModel<components["schemas"]["CategoryDto"][]>({ required: true });

const emit = defineEmits(["close"]);

const name = ref("");

async function createCategory() {
    const request = await client.POST("/categories", {
        body: {
            name: name.value
        }
    });

    if (request.data) {
        model.value.push(request.data);
        emit("close");
    }
}
</script>
