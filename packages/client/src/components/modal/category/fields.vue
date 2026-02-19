<template>
    <UInput placeholder="Name" v-model="name" />

    <UButton @click="createCategory">Create Node</UButton>
</template>
<script setup lang="ts">
import client from '@/lib/client';
import type { components } from '@/types/schema';
import { ref } from 'vue';

const model = defineModel<components["schemas"]["CategoryDto"][]>({ required: true })

const emit = defineEmits(["close"])

const name = ref("");


async function createCategory() {


    const request = await client.POST("/categories", {
        body: {
            name: name.value
        }
    })

    if (request.data) {
        model.value.push(request.data)
        emit("close")
    }
}

</script>