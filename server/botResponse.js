const fs = require("fs");
const { NlpManager } = require("node-nlp");

const load_data = fs.readFileSync("./model.nlp", "utf-8");
const manager = new NlpManager();
manager.import(load_data);

const getBotResponse = async (user_message, is_btn_reply = false) => {
  const bot_response = await manager.process(user_message);
  const main_response = {
    message: bot_response?.answer,
    score: bot_response?.score,
    intent: bot_response?.intent,
    language: bot_response?.language,
    utterance: bot_response?.utterance,
  };
  if (is_btn_reply) {
    const all_answer = bot_response?.answers
    main_response["btn_message"] = all_answer[Math.floor(Math.random() * all_answer.length)]
  }
  return main_response;
};

module.exports = {
  getBotResponse,
};
