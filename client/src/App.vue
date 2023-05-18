<template>
  <h2>connection_type</h2>
  <MyToggle :activeLink="selectedType" :links="toggleTypes" :disabled="!!selectedType" @update:selectedLink="(value) => (selectedType = value)" />
  <div v-if="selectedType">
    <h2>my_chat</h2>
    <MyChat :connectionType="selectedType" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { ConnectionType } from "@/types/connection";
import MyChat from "./components/MyChat.vue";
import MyToggle from "./components/MyToggle.vue";

const connectionTypes = new Map();
connectionTypes.set("LongPolling", "Long Polling");
connectionTypes.set("EventSourcing", "Event Sourcing");
connectionTypes.set("WebSocket", "Web Socket");
const toggleTypes: ConnectionType[] = [...connectionTypes.keys()];
const selectedType: Ref<ConnectionType | undefined> = ref();
</script>

<style scoped></style>
