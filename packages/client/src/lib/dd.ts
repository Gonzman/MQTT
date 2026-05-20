import { shallowRef, type Ref } from "vue";

import type { components } from "@/types/schema";
import client from "./client";

type CategoryDto = components["schemas"]["CategoryDto"];
type NodeDto = components["schemas"]["NodeDto"];

export type DragState = { kind: "category"; categoryId: string } | { kind: "node"; nodeId: string; categoryId: string };

const dragState = shallowRef<DragState | null>(null);
const nodeCollections = new Map<string, Ref<NodeDto[]>>();

function createDragPreview(kind: "category" | "node", title: string, subtitle?: string) {
    const canvas = document.createElement("canvas");
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const width = 320;
    const height = subtitle ? 88 : 72;
    const radius = 16;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
        return canvas;
    }

    const background = isDark ? "#0f172a" : "#f8fafc";
    const borderColor = isDark ? "rgba(148, 163, 184, 0.28)" : "rgba(15, 23, 42, 0.12)";
    const textColor = isDark ? "#e2e8f0" : "#0f172a";
    const mutedColor = isDark ? "#94a3b8" : "#475569";
    const badgeFill = kind === "category" ? "rgba(37, 99, 235, 0.18)" : "rgba(16, 185, 129, 0.18)";
    const badgeText = kind === "category" ? "#60a5fa" : "#34d399";

    context.clearRect(0, 0, width, height);
    context.fillStyle = background;
    context.strokeStyle = borderColor;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(radius, 0);
    context.lineTo(width - radius, 0);
    context.quadraticCurveTo(width, 0, width, radius);
    context.lineTo(width, height - radius);
    context.quadraticCurveTo(width, height, width - radius, height);
    context.lineTo(radius, height);
    context.quadraticCurveTo(0, height, 0, height - radius);
    context.lineTo(0, radius);
    context.quadraticCurveTo(0, 0, radius, 0);
    context.closePath();
    context.fill();
    context.stroke();

    context.font =
        '700 10px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const badgeLabel = kind === "category" ? "CATEGORY" : "NODE";
    const badgeWidth = context.measureText(badgeLabel).width + 16;
    context.fillStyle = badgeFill;
    context.beginPath();
    context.roundRect(14, 12, badgeWidth, 22, 999);
    context.fill();

    context.fillStyle = badgeText;
    context.fillText(badgeLabel, 22, 27);

    context.fillStyle = textColor;
    context.font =
        '700 15px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    context.fillText(title, 14, 52);

    if (subtitle) {
        context.fillStyle = mutedColor;
        context.font =
            '600 12px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        context.fillText(subtitle, 14, 72);
    }

    return canvas;
}

function calculateDropBefore(event: DragEvent) {
    const element = event.currentTarget;

    if (!(element instanceof HTMLElement)) {
        return null;
    }

    const { top, height } = element.getBoundingClientRect();
    return event.clientY < top + height / 2;
}

function setDragImage(event: DragEvent, kind: "category" | "node", title: string, subtitle?: string) {
    const element = event.currentTarget;

    if (!(element instanceof HTMLElement) || !event.dataTransfer) {
        return;
    }

    const preview = createDragPreview(kind, title, subtitle);
    const rect = element.getBoundingClientRect();
    event.dataTransfer.setDragImage(
        preview,
        Math.max(12, event.clientX - rect.left),
        Math.max(12, event.clientY - rect.top)
    );
}

function reorderWithinArray<T extends { id: string }>(items: T[], itemId: string, targetId: string, before: boolean) {
    const fromIndex = items.findIndex((item) => item.id === itemId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (fromIndex === -1 || targetIndex === -1 || fromIndex === targetIndex) {
        return false;
    }

    const item = items.splice(fromIndex, 1)[0];

    if (!item) {
        return false;
    }

    let insertIndex = before ? targetIndex : targetIndex + 1;

    if (fromIndex < insertIndex) {
        insertIndex -= 1;
    }

    items.splice(insertIndex, 0, item);
    return true;
}

export function getDragState() {
    return dragState.value;
}

export function isDraggingCategory(categoryId: string) {
    return dragState.value?.kind === "category" && dragState.value.categoryId === categoryId;
}

export function isDraggingNode(nodeId: string) {
    return dragState.value?.kind === "node" && dragState.value.nodeId === nodeId;
}

function syncDraggedNodeCategory(nodeId: string, categoryId: string) {
    if (dragState.value?.kind === "node" && dragState.value.nodeId === nodeId) {
        dragState.value = { kind: "node", nodeId, categoryId };
    }
}

export function clearDragState() {
    dragState.value = null;
}

export function getDropBefore(event: DragEvent) {
    return calculateDropBefore(event);
}

export function registerNodeCollection(categoryId: string, nodes: Ref<NodeDto[]>) {
    nodeCollections.set(categoryId, nodes);
}

export function unregisterNodeCollection(categoryId: string, nodes: Ref<NodeDto[]>) {
    if (nodeCollections.get(categoryId) === nodes) {
        nodeCollections.delete(categoryId);
    }
}

export function startCategoryDrag(event: DragEvent, categoryId: string, title: string) {
    if (!event.dataTransfer) {
        return;
    }

    dragState.value = { kind: "category", categoryId };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", categoryId);
    setDragImage(event, "category", title);
}

export function startNodeDrag(event: DragEvent, nodeId: string, categoryId: string, title: string, subtitle?: string) {
    if (!event.dataTransfer) {
        return;
    }

    dragState.value = { kind: "node", nodeId, categoryId };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", nodeId);
    setDragImage(event, "node", title, subtitle);
}

export function moveCategory(
    categoryList: CategoryDto[],
    categoryId: string,
    targetCategoryId: string,
    before: boolean
) {
    return reorderWithinArray(categoryList, categoryId, targetCategoryId, before);
}

export function moveNodeToCategory(options: {
    nodeId: string;
    sourceCategoryId: string;
    targetCategoryId: string;
    targetNodeId?: string;
    before?: boolean;
}) {
    const sourceNodes = nodeCollections.get(options.sourceCategoryId);
    const targetNodes = nodeCollections.get(options.targetCategoryId);

    if (!sourceNodes || !targetNodes) {
        return false;
    }

    const before = options.before ?? true;

    if (sourceNodes === targetNodes) {
        if (!options.targetNodeId) {
            return false;
        }

        const moved = reorderWithinArray(sourceNodes.value, options.nodeId, options.targetNodeId, before);

        if (moved) {
            syncDraggedNodeCategory(options.nodeId, options.targetCategoryId);
        }

        return moved;
    }

    const sourceIndex = sourceNodes.value.findIndex((node) => node.id === options.nodeId);

    if (sourceIndex === -1) {
        return false;
    }

    const node = sourceNodes.value.splice(sourceIndex, 1)[0];

    if (!node) {
        return false;
    }
    client.PUT("/categories/{categoryId}/nodes/{nodeId}", {params:{path:{categoryId: node.categoryId, nodeId: node.id}}, body:{categoryId: options.targetCategoryId}})

    node.categoryId = options.targetCategoryId;

    let insertIndex = targetNodes.value.length;

    if (options.targetNodeId) {
        const targetIndex = targetNodes.value.findIndex((candidate) => candidate.id === options.targetNodeId);

        if (targetIndex !== -1) {
            insertIndex = before ? targetIndex : targetIndex + 1;
        }
    }

    targetNodes.value.splice(insertIndex, 0, node);

    //TODO: PUT Node in neue Categorie für Server Sync


    syncDraggedNodeCategory(options.nodeId, options.targetCategoryId);

    return true;
}
