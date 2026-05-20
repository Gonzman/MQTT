<template>
    <UModal v-model:open="open" title="New Node" description="Create a node for this category.">
        <UTooltip text="Rename Category">
            <UButton aria-label="Rename category" color="warning" icon="lucide:wrench"/>
        </UTooltip>

        <template #content>
            <div class="modal-panel">
                <div class="modal-header">
                    <p class="modal-kicker">Category</p>
                    <p class="modal-title">Rename the Category</p>
                    <p class="modal-description"></p>
                </div>

            <UInput v-model="name"></UInput>
            <UButton @click="update">Rename</UButton>

            </div>
        </template>
    </UModal>
</template>
<script setup lang="ts">
import type { components } from "@/types/schema";
import { onMounted, ref } from "vue";
import client from "@/lib/client";

const props = defineProps< { category: components["schemas"]["CategoryDto"] } >();
const model = defineModel< components["schemas"]["CategoryDto"][] >({required: true});
const open = ref(false);

const name = ref("");

onMounted(() => {
  name.value = props.category.name
})

function update() {
  client.PATCH("/categories/{categoryId}", { params: { path: { categoryId: props.category.id } }, body: { name: name.value } }).then(() => {
    let update = model.value.find((x) => x.id == props.category.id)
    if (!update) {
      return;
    }
    update.name = name.value
    close();
  })

}

function close() {
    open.value = false;
}
</script>
