import express from "express";
import cors from "cors";
import events from "events";

const PORT = 5000;

const emitter = new events.EventEmitter();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/connect", (req, res) => {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  emitter.on("NewMessage", (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  });
});

// app.get("/get-message", (req, res) => {
//   emitter.once("NewMessage", (message) => {
//     res.json(message);
//   });
// });

app.post("/new-message", (req, res) => {
  const message = req.body;
  emitter.emit("NewMessage", message);
  res.status(200).send();
});

app.get("/get-check", (req, res) => {
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
