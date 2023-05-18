import axios from "axios";
import { IMessage } from "@/types/message";

class WebApi {
  HTTP_SERVER = "http://localhost:5000";
  WS_SERVER = "ws://localhost:5000";
  URL_EVENT_SOURCE = `${this.HTTP_SERVER}/connect`;

  async checkConnection(): Promise<any> {
    return await axios.get(`${this.HTTP_SERVER}/get-check`);
  }

  async getMessage(): Promise<IMessage> {
    const { data } = await axios.get(`${this.HTTP_SERVER}/get-message`);
    return data;
  }

  async newMessage(message: IMessage): Promise<void> {
    await axios.post(
      `${this.HTTP_SERVER}/new-message`,
      {
        id: message.id,
        text: message.text,
        user: message.user,
      }
      // {
      //   headers: {
      //     "Cache-Control": "no-cache",
      //     Pragma: "no-cache",
      //     Expires: "0",
      //   },
      // }
    );
  }
}

export default new WebApi();
