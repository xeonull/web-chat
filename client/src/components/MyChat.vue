<template>
  <div class="chat">
    <div class="chat_header">
      <div class="chat_header_label">name:</div>
      <input
        type="text"
        v-focus:mount
        :disabled="isConnected"
        class="chat_header_username input"
        v-model="userName"
        placeholder="Enter your name"
        @keyup.enter="initChat"
      />
      <button type="button" :disabled="isConnected" class="btn btn_default" @click="initChat">connect</button>
    </div>

    <div class="chat_history">
      <div v-for="(m, i) in messageList" :key="m.id" class="chat_history_item">
        <div v-if="m.event === 'connection'" class="chat_history_item_connection">{{ m.user }} joined the chat</div>
        <div v-if="m.event === 'message'" class="chat_history_item_message" :style="{ 'align-self': userName === m.user ? 'self-end' : 'self-start' }">
          <div
            v-if="userName !== m.user && (i === 0 || messageList[i - 1].user !== m.user || messageList[i - 1].event === 'connection')"
            class="chat_history_item_message_author"
          >
            {{ m.user }}
          </div>
          <div class="chat_history_item_message_text">{{ m.text }}</div>
        </div>
      </div>
      <div ref="chat_history_bottom"></div>
    </div>

    <div class="chat_tools">
      <input
        type="text"
        v-focus:update
        ref="input_text"
        :disabled="!isConnected"
        class="input"
        v-model="messageText"
        placeholder="Enter message text"
        @keyup.enter="send"
      />
      <button type="button" :disabled="!isConnected" class="btn btn_circle" @click="send">
        <font-awesome-icon icon="fa-solid fa-paper-plane" class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DirectiveBinding, nextTick, ref, Ref } from "vue";
import { useWebConnection } from "@/composibles/useWebConnection";
import { ConnectionType } from "@/types/connection";

const props = defineProps<{ connectionType: ConnectionType }>();

const chat_history_bottom: Ref<HTMLElement | undefined> = ref();

const { subscribe, send, isConnected, messageList, messageText, userName } = useWebConnection(props.connectionType);

const initChat = async () => {
  try {
    subscribe(async () => {
      await nextTick();
      chat_history_bottom.value?.scrollIntoView({ behavior: "smooth" });
    });
  } catch (error) {
    console.error(error);
  }
};

const vFocus = {
  mounted: (el: HTMLElement, binding: DirectiveBinding) => {
    if (binding.arg === "mount") el.focus();
  },
  updated: (el: HTMLElement, binding: DirectiveBinding) => {
    if (binding.arg === "update") el.focus();
  },
};
</script>

<style lang="scss" scoped>
.input {
  margin: 10px;
  padding: 4px 12px;
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
    background-color: rgb(164, 89, 214);
  }
}
.icon {
  margin: 0;
}
.chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 470px;
  background-color: none;
  margin: auto;
  &_header {
    display: flex;
    align-items: center;
    flex-grow: 0;
    height: 50px;
    background: linear-gradient(to right, rgba(164, 89, 214, 0.4), rgb(164, 89, 214));
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
    padding: 8px 0 2px 0;
    &_item {
      display: flex;
      flex-direction: column;
      &_connection {
        font-size: 0.9rem;
        color: rgb(172, 172, 172);
      }
      &_message {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        width: 60%;
        // border: 1px outset pink;
        &_author {
          margin: 0;
          padding: 0 0 0 24px;
          font-size: 0.7rem;
          height: 18px;
          text-align: left;
          &::after {
            content: ":";
          }
          // border: 1px outset orange;
        }
        &_text {
          margin: 2px 10px 8px 10px;
          padding: 10px;
          text-align: left;
          background: linear-gradient(to left, rgba(164, 89, 214, 0.5), rgba(164, 89, 214, 0.8));
          border-radius: 25px;
          align-self: auto;
          word-break: normal;
          word-wrap: normal;
          overflow-wrap: break-word;
        }
      }
    }
  }
  &_tools {
    flex-grow: 0;
    height: 50px;
    // background-color: rgba(164, 89, 214, 0.63);
    background: linear-gradient(to right, rgb(164, 89, 214), rgba(164, 89, 214, 0.4));
    border-radius: 0 0 25px 25px;
    vertical-align: bottom;
  }
}
</style>
