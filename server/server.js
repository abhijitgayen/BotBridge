require("dotenv").config();
const express = require('express');
const cors = require('cors')
const body_parser = require('body-parser')

const { getBotResponse } = require('./chatbot/botResponse');
const  WhatsappCloud = require('./whatsapp');

// whatsapp initial setup 
const whatsapp = new WhatsappCloud(
    {
        accessToken: process.env.ACCESS_TOKEN,
        graphAPIVersion: process.env.GRAPH_API_VERSION,
        senderPhoneNumberId: process.env.SENDER_PHONE_NUMBER_ID,
        WABA_ID: process.env.WABA_ID
    }
)

const app = express();
app.use(cors()).use(express.json());
app.use(body_parser.json());




app.get('/', (req, res) => {
    res.send({
        'message': 'Server is running',
    })
})

// REST api integation 
app.post('/chatbot', (req, res) => {
    console.log(req.body)
    if (req.body.message) {
        getBotResponse(req.body.message).then((response) => {
            res.send(response)
        })
    }
    else {
        res.send({ 'message': 'not a currect api call' })
    }
})

app.post('/btn_chatbot', (req, res) => {
    console.log(req.body)
    if (req.body.message) {
        getBotResponse(req.body.message, true).then((response) => {
            res.send(response)
        })
    }
    else {
        res.send({ 'message': 'not a currect api call' })
    }
})

// time to integate whatsapp
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const challange = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];

    console.log("mode:", mode, "ch:", challange, "token:", token);
    if (mode && token) {
        if (mode === "subscribe" && token === process.env.AUTH_TOKEN) {
            res.status(200).send(challange);
        } else {
            res.status(403);
        }
    }
});

app.post("/webhook", (req, res) => {
    const body_param = req.body;
    if (body_param?.object) {
        const body_param = req.body;

        if (body_param?.object) {
            if (body_param?.entry && body_param?.entry[0]?.changes && body_param?.entry[0]?.changes[0]?.value?.messages) {
                const message_body = body_param.entry[0].changes[0].value.messages[0]
                const from = message_body.from;
                const reply_type = message_body.type;
                
                if (reply_type === 'text') {
                    const user_message = message_body.text.body;
                    sendWhatsappBotMessage(from,user_message)
                }
                if (reply_type === 'interactive'){
                    const user_message = message_body.interactive?.button_reply?.title;
                    const context_message_id = message_body?.context?.id;
                    sendWhatsappBotMessage(from,user_message, context_message_id)
                    console.log(user_message)
                }
            }
            res.sendStatus(200);
        }
        else {
            res.sendStatus(404);
        }
    }
});

const sendWhatsappBotMessage = (from,user_message, message_id = null) => {
    getBotResponse(user_message, true).then((response) => {
        btns = response?.btn_message?.opts
        if (btns && btns.length > 0){
            const whatsapp_btns = btns.map((btn, index) => { return {"title": btn , "id": index+1} })

            whatsapp.sendSimpleButtons({
                message: response.message,
                recipientPhone: from,
                listOfButtons: whatsapp_btns,
                message_id: message_id
            });
        }
        else{
            whatsapp.sendText({
                message: response.message,
                recipientPhone: '917044136740',
                message_id: message_id,
            });
        }
    });
}

app.listen(3000, () => {
    console.log('listening on port')
})