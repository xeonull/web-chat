import { ref, Ref } from "vue";
import { IMessage } from "@/types/message";
import { ConnectionType } from "@/types/connection";
import Api from "@/api/server";
import { AxiosError } from "axios";

const userName: Ref<string> = ref("");
const messageText: Ref<string> = ref("");
const messageList: Ref<IMessage[]> = ref([]);
const isConnected: Ref<boolean> = ref(false);

function useWs() {
  let socket: WebSocket;

  function init() {
    console.log("socket:", socket);
    if (!socket || socket.readyState === socket.CLOSED) socket = new WebSocket(Api.WS_SERVER);
  }

  const connect = () => {
    try {
      init();
      socket.onopen = () => {
        const message: IMessage = {
          event: "connection",
          id: Date.now(),
          user: userName.value,
          text: "",
        };
        socket.send(JSON.stringify(message));
        isConnected.value = true;
        console.log("WebSocket connection opened");
      };

      socket.onclose = () => {
        isConnected.value = false;
        console.log("WebSocket connection closed");
      };
    } catch (error) {
      throw new Error("WS Server Connection Error");
    }
  };

  const subscribe = async (cbAfterGetMessage: Function) => {
    init();
    socket.onmessage = async (event) => {
      const message: IMessage = JSON.parse(event.data);
      if (message.text.length) messageList.value = [...messageList.value, message];
      await cbAfterGetMessage();
    };
  };

  const send = async () => {
    init();
    const message: IMessage = {
      event: "message",
      id: Date.now(),
      user: userName.value,
      text: messageText.value,
    };
    socket?.send(JSON.stringify(message));
  };

  return {
    connect,
    send,
    subscribe,
  };
}

function useHttp() {
  const connect = async () => {
    try {
      const data = await Api.checkConnection();
      if (data?.status === 200) isConnected.value = true;
    } catch (error) {
      throw new Error("Server Connection Error");
    }
  };

  const send = async () => {
    await Api.newMessage({
      id: Date.now(),
      text: messageText.value,
      user: userName.value,
    });
  };

  const subscribe_LongPolling = async (cbAfterGetMessage: Function) => {
    try {
      const message: IMessage = await Api.getMessage();

      messageList.value = [...messageList.value, message];
      await cbAfterGetMessage();

      subscribe_LongPolling(cbAfterGetMessage);
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.code === "ERR_NETWORK") {
          // Если сервер не доступен, то ждем 30 сек до следующего запроса
          setTimeout(() => {
            subscribe_LongPolling(cbAfterGetMessage);
          }, 30 * 1000);
        } else {
          // Если таймаут ответа сервера, то ждем 1 сек до следующего запроса
          console.log("Subcsribe TimeOut:", e);
          setTimeout(() => {
            subscribe_LongPolling(cbAfterGetMessage);
          }, 1000);
        }
      } else throw e;
    }
  };

  const subscribe_EventSourcing = async (cbAfterGetMessage: Function) => {
    try {
      const eventSource = new EventSource(Api.URL_EVENT_SOURCE);
      eventSource.onmessage = async (event) => {
        const message: IMessage = JSON.parse(event.data);
        messageList.value = [...messageList.value, message];
        await cbAfterGetMessage();
      };
    } catch (e) {
      console.log("evsourc_err:", e);
      throw e;
    }
  };

  return {
    connect,
    send,
    subscribe_LongPolling,
    subscribe_EventSourcing,
  };
}

export function useWebConnection(connectionType: ConnectionType) {
  let connect, send, subscribe;

  switch (connectionType) {
    case "WebSocket":
      ({ connect, send, subscribe } = useWs());
      break;

    case "LongPolling":
      ({ connect, send, subscribe_LongPolling: subscribe } = useHttp());
      break;

    default:
      ({ connect, send, subscribe_EventSourcing: subscribe } = useHttp());
      break;
  }

  return {
    connect,
    subscribe,
    send,
    userName,
    messageText,
    messageList,
    isConnected,
  };
}
