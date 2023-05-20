import express from "express";
import cors from "cors";
import events from "events";

const PORT = 5000;

const emitter = new events.EventEmitter();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/get-message", (req, res) => {
  emitter.once("NewMessage", (message) => {
    res.json(message);
  });
});

app.post("/new-message", (req, res) => {
  const message = req.body;
  if (message.event === "connection") console.log(`${message.user} conneted`);
  if (message.event === "message") console.log(`${message.user} says: '${message.text}'`);
  emitter.emit("NewMessage", message);
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
