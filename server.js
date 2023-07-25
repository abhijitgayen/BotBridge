const express = require('express');
const app = express();
app.use(express.json())
const {getBotResponse} = require('./botResponse');

app.get('/', (req, res) => {
    res.send({
        'message': 'sserver is running',
    })
})

app.get('/chatbot', (req, res) => {
    console.log(req.query) 
    if (req.query.message){
        getBotResponse(req.query.message).then((response)=>{
            res.send(response)
        })
    }
})

app.post('/chatbot', (req, res) => {
    console.log(req.body) 
    if (req.body.message){
        getBotResponse(req.body.message).then((response)=>{
            res.send(response)
        })
    }
    else{
        res.send({'message': 'not a currect api call'})
    }
})


app.listen(3000, ()=>{
    console.log('listening on port')
})