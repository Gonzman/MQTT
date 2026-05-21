<template>
    <form>
        <UInput class="modal-field w-full p-4" placeholder="Name" v-model="name" />

        <div class="modal-actions pr-4">
            <UButton color="success" @click="createCategory" onkeypress="enter" class="pt-4">Create Category</UButton>
        </div>
    </form>
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
