import axios from 'axios';

function GetBotUserResponse ({setConversations = () =>{}}){

    const saveUserMessage = (message) =>{
        console.log('message', message);
        const userMessage = [{
            "message": message,
            "time":"23:04",
            "type":"user"
        }]
        setConversations((prev)=>([...prev,...userMessage]))
    }

    const saveBotMessage = (message) =>{
        // we call our chatbot api here
        axios(
            {
                method: 'post',
                url: 'https://zerocodersbot.vercel.app/bot_response',
                headers: { 
                    'Content-Type': 'application/json'
                },
                data : JSON.stringify({"message": message})
            }
        )
        .then(function (response) {
            const botMessage = [{
                "message": response.data?.message,
                "time":"23:04",
                "type":"bot"
            }]
            setConversations((prev)=> ([...prev,...botMessage]))
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    return {
        saveUserMessage,
        saveBotMessage 
    }
    
}

export default GetBotUserResponse