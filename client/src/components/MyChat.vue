<template>
  <div class="chat">
    <div class="chat_header">
      <div class="chat_header_label">name:</div>
      <input type="text" :disabled="connected" class="chat_header_username input" v-model="userName" />
      <button type="button" :disabled="connected" class="btn btn_default" @click="initChat">connect</button>
    </div>

    <div class="chat_history">
      <div v-for="m in messageList" :key="m.id" class="chat_history_message" :style="{ 'align-self': userName === m.user ? 'self-end' : 'self-start' }">
        {{ m.text }}
      </div>
      <div ref="chat_history_bottom"></div>
    </div>

    <div class="chat_tools">
      <input type="text" :disabled="!connected" class="input" v-model="messageText" />
      <button type="button" :disabled="!connected" class="btn btn_circle" @click="sendMessage">
        <font-awesome-icon icon="fa-solid fa-paper-plane" class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { nextTick, ref, Ref } from "vue";
import { IMessage } from "@/types/message";

// defineProps<{ msg: string }>();

const userName: Ref<string> = ref("");
const messageText: Ref<string> = ref("");
const messageList: Ref<IMessage[]> = ref([]);
const connected: Ref<boolean> = ref(false);

const chat_history_bottom: Ref<HTMLElement | undefined> = ref();

const initChat = async () => {
  connected.value = true;
  subscribe();
};

const subscribe = async () => {
  try {
    const { data } = await axios.get("http://localhost:5000/get-message");

    messageList.value = [...messageList.value, data];
    await nextTick();
    chat_history_bottom.value?.scrollIntoView({ behavior: "smooth" });

    subscribe();
  } catch (error) {
    setTimeout(() => {
      subscribe();
    }, 500);
  }
};

const sendMessage = async () => {
  await axios.post(
    "http://localhost:5000/new-message",
    {
      id: Date.now(),
      text: messageText.value,
      user: userName.value,
    }
    // {
    //   headers: {
    //     "Cache-Control": "no-cache",
    //     Pragma: "no-cache",
    //     Expires: "0",
    //   },
    // }
  );
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
