export interface IMessage {
  id: number;
  text: string;
  user: string;
  event: "message" | "connection";
}
