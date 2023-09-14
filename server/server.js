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

// REST api integation
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

// time to integate whatsapp

// connect whatsapp
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  console.log("mode:", mode, "ch:", challange, "token:", token);
  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body_param = req.body;
  if (body_param?.object) {
    let body_param = req.body;

    if (body_param?.object) {
      if (
        body_param?.entry &&
        body_param?.entry[0]?.changes &&
        body_param?.entry[0]?.changes[0]?.value?.messages
      ) {
        let from = body_param.entry[0].changes[0].value.messages[0].from;
        let msg_id = body_param.entry[0].changes[0].value.messages[0].id;
        let reply_type = body_param.entry[0].changes[0].value.messages[0].type;

        if (reply_type === "text") {
          let user_message =
            body_param.entry[0].changes[0].value.messages[0].text.body;
          botResponse(user_message).then((response) => {
            var message_to_send = {
              message_type: "text",
              message_data: {
                body: response.message,
              },
            };
            console.log(user_message, "this is user message");
            sendMessage(phone_no_id, from, token, message_to_send);
          });
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.listen(3000, () => {
  console.log("listening on port");
});
