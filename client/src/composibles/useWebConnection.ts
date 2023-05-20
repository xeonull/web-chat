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

  function connect() {
    if (!socket || socket.readyState === socket.CLOSED) {
      socket = new WebSocket(Api.WS_SERVER);
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
    }
  }

  const subscribe = async (cbAfterGetMessage: Function) => {
    connect();
    socket.onmessage = async (event) => {
      const message: IMessage = JSON.parse(event.data);
      messageList.value = [...messageList.value, message];
      await cbAfterGetMessage();
    };
  };

  const send = async () => {
    if (messageText.value === "") return;
    if (!socket || socket.readyState !== socket.OPEN) return;
    const message: IMessage = {
      event: "message",
      id: Date.now(),
      user: userName.value,
      text: messageText.value,
    };
    socket?.send(JSON.stringify(message));
    messageText.value = "";
  };

  return {
    send,
    subscribe,
  };
}

function useHttp() {
  const connect = async () => {
    await Api.newMessage({
      event: "connection",
      id: Date.now(),
      text: "",
      user: userName.value,
    });
    isConnected.value = true;
  };

  const send = async () => {
    if (messageText.value === "" || !isConnected.value) return;
    await Api.newMessage({
      event: "message",
      id: Date.now(),
      text: messageText.value,
      user: userName.value,
    });
    messageText.value = "";
  };

  const subscribe_LongPolling = async (cbAfterGetMessage: Function) => {
    const subscribe = async (cbAfterGetMessage: Function) => {
      try {
        const message: IMessage = await Api.getMessage();

        messageList.value = [...messageList.value, message];
        await cbAfterGetMessage();

        subscribe(cbAfterGetMessage);
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.code === "ERR_NETWORK") {
            // Если сервер не доступен, то ждем 30 сек до следующего запроса
            setTimeout(() => {
              subscribe(cbAfterGetMessage);
            }, 30 * 1000);
          } else {
            // Если таймаут ответа сервера, то ждем 1 сек до следующего запроса
            console.log("Subcsribe TimeOut:", e);
            setTimeout(() => {
              subscribe(cbAfterGetMessage);
            }, 1000);
          }
        } else throw e;
      }
    };
    subscribe(cbAfterGetMessage);
    connect();
  };

  const subscribe_EventSourcing = async (cbAfterGetMessage: Function) => {
    const eventSource = new EventSource(Api.URL_EVENT_SOURCE);
    eventSource.onmessage = async (event) => {
      const message: IMessage = JSON.parse(event.data);
      messageList.value = [...messageList.value, message];
      await cbAfterGetMessage();
    };
    connect();
  };

  return {
    send,
    subscribe_LongPolling,
    subscribe_EventSourcing,
  };
}

export function useWebConnection(connectionType: ConnectionType) {
  let send: () => Promise<any>;
  let subscribe: (cbAfterGetMessage: Function) => Promise<any>;

  switch (connectionType) {
    case "WebSocket":
      ({ send, subscribe } = useWs());
      break;

    case "LongPolling":
      ({ send, subscribe_LongPolling: subscribe } = useHttp());
      break;

    default:
      ({ send, subscribe_EventSourcing: subscribe } = useHttp());
      break;
  }

  return {
    subscribe,
    send,
    userName,
    messageText,
    messageList,
    isConnected,
  };
}
