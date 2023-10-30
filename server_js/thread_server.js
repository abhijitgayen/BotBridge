const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");
const { Worker } = require("node:worker_threads");

const app = express();
app.use(cors()).use(express.json());
app.use(body_parser.json());

app.get("/", (req, res) => {
  res.send({
    message: "Server is running",
  });
});

app.post("/chatbot", (req, res) => {
  const user_message = req.body.message;

  if (user_message) {
    const worker_chatbot_post = new Worker(
      "./threads/generate_bot_message.js",
      {
        workerData: { user_message },
      }
    );
    worker_chatbot_post.on("message", (result) => {
      res.status(200).json(result);
    });
    worker_chatbot_post.on("error", (result) => {
      console.log(result, "worker_chatbot_post error");
    });
    worker_chatbot_post.on("exit", (code) => {
      if (code !== 0) console.log(`Worker stopped with exit code ${code}`);
    });
  } else {
    res.send({ message: "not a currect api call" });
  }
});

app.post("/btn_chatbot", (req, res) => {
  const user_message = req.body.message;

  if (user_message) {
    const worker_btn_chatbot_post = new Worker(
      "./threads/generate_btn_bot_message.js",
      {
        workerData: { user_message },
      }
    );
    worker_btn_chatbot_post.on("message", (result) => {
      res.status(200).json(result);
    });
    worker_btn_chatbot_post.on("error", (result) => {
      console.log(result, "worker_chatbot_post error");
    });
    worker_btn_chatbot_post.on("exit", (code) => {
      if (code !== 0) console.log(`Worker stopped with exit code ${code}`);
    });
  } else {
    res.send({ message: "not a currect api call" });
  }
});


app.listen(3000, () => {
  console.log("listening on port");
});
