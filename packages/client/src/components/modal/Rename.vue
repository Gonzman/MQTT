<template>
    <UModal v-model:open="open" :title="title" :description="description">
        <UTooltip :text="tooltip">
            <UButton :aria-label="tooltip" variant="ghost" icon="lucide:wrench" @click.stop="open = true"
                @mousedown.stop />
        </UTooltip>

        <template #content>
            <div class="modal-panel">
                <div class="modal-header">
                    <p class="modal-kicker">{{ label }}</p>
                    <p class="modal-title">{{ title }}</p>
                    <p class="modal-description">{{ description }}</p>
                </div>

                <div class="rename-form">
                    <UInput class="rename-input" v-model="name" />
                    <div class="rename-spacer" aria-hidden="true"></div>
                    <div class="rename-actions">
                        <UButton @click="update">Rename</UButton>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
    import { ref, watch } from "vue";

    const props = defineProps<{
        label: string;
        title: string;
        description: string;
        tooltip: string;
        name: string;
        onUpdate: (name: string) => Promise<boolean> | boolean | void;
    }>();

    const open = ref(false);
    const name = ref(props.name);

    watch(open, (isOpen) => {
        if (isOpen) {
            name.value = props.name;
        }
    });

    async function update() {
        const result = await props.onUpdate(name.value);

        if (result === false) {
            return;
        }

        open.value = false;
    }
</script>

<style scoped>
    .rename-form {
        display: flex;
        align-items: center;
    }

    .rename-input {
        flex: 100%;
        min-width: 0;
    }

    .rename-spacer {
        min-width: 12px;
    }

    .rename-actions {
        display: flex;
        flex: 0 0 auto;
    }
</style>
