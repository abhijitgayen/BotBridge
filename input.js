const { getBotResponse } = require('./botResponse')

process.stdin.on('data', (data)=>{
    let enter_message = data.toString().trim()
    console.log('User Message: ',enter_message);

    //need to setup chatbot here 
    getBotResponse(enter_message).then((res)=>{
        console.log('Bot Response: ',res?.answer);
    })

    if (enter_message === 'exit'){
        process.exit()
    }
})

console.log('chatbot is Ready to Test =>')
