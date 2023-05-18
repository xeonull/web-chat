<template>
  <div class="chat">
    <div class="chat_header">
      <div class="chat_header_label">name:</div>
      <input type="text" :disabled="isConnected" class="chat_header_username input" v-model="userName" placeholder="Enter your name" />
      <button type="button" :disabled="isConnected" class="btn btn_default" @click="initChat">connect</button>
    </div>

    <div class="chat_history">
      <div v-for="m in messageList" :key="m.id" class="chat_history_message" :style="{ 'align-self': userName === m.user ? 'self-end' : 'self-start' }">
        {{ m.text }}
      </div>
      <div ref="chat_history_bottom"></div>
    </div>

    <div class="chat_tools">
      <input type="text" :disabled="!isConnected" class="input" v-model="messageText" placeholder="Enter message text" />
      <button type="button" :disabled="!isConnected" class="btn btn_circle" @click="send">
        <font-awesome-icon icon="fa-solid fa-paper-plane" class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, Ref } from "vue";
import { useWebConnection } from "@/composibles/useWebConnection";
import { ConnectionType } from "@/types/connection";

const props = defineProps<{ connectionType: ConnectionType }>();

const chat_history_bottom: Ref<HTMLElement | undefined> = ref();

const { connect, subscribe, send, isConnected, messageList, messageText, userName } = useWebConnection(props.connectionType);

const initChat = async () => {
  try {
    await connect();
    subscribe(async () => {
      await nextTick();
      chat_history_bottom.value?.scrollIntoView({ behavior: "smooth" });
    });
  } catch (error) {
    console.error(error);
  }
};
</script>

<style lang="scss" scoped>
.input {
  margin: 10px;
  padding: 4px;
  height: 20px;
  width: 340px;
  border: 0;
  border-radius: 12px;
  background-color: rgb(119, 119, 119);
  background: rgb(49, 49, 49);
}
.input:focus {
  outline: none !important;
}
.btn {
  height: 40px;
  &_default {
    width: 120px;
  }
  &_circle {
    width: 40px;
    border-radius: 50%;
  }
  &:active:not([disabled]) {
    background-color: #ff8800de;
  }
}
.icon {
  margin: 0;
}
.chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 450px;
  background-color: none;
  margin: auto;
  &_header {
    display: flex;
    align-items: center;
    flex-grow: 0;
    height: 50px;
    background-color: rgba(164, 89, 214, 0.63);
    border-radius: 25px 25px 0 0;
    &_label {
      margin: 0 0 0 30px;
    }
    &_username {
      width: 200px;
    }
  }
  &_history {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background-color: rgb(49, 49, 49);
    overflow: scroll;
    overflow-x: hidden;
    &_message {
      margin: 10px;
      padding: 10px;
      text-align: left;
      background-color: rgba(164, 89, 214, 0.63);
      border-radius: 25px;
      width: 60%;
      align-self: auto;
    }
  }
  &_tools {
    flex-grow: 0;
    height: 50px;
    background-color: rgba(164, 89, 214, 0.63);
    border-radius: 0 0 25px 25px;
    vertical-align: bottom;
  }
}
</style>
