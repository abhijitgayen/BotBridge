
const {parentPort, workerData} = require("worker_threads");
const { getBotResponse } = require('../chatbot/botResponse');


const generate_bot_message = async (user_message) => {
    const bot_res =  await getBotResponse(user_message, true)
    parentPort.postMessage(bot_res)
    return
}

generate_bot_message(workerData?.user_message)