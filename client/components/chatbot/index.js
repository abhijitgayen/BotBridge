import { useState } from 'react'
import styles from './styles.module.css'
import {SiChatbot} from 'react-icons/si'
import Chatbotheader from './chatbotHeader'
import ChatBotFooter from './chatbotFooter'
import ChatBotBody from './chatbotBody'
import GetBotUserResponse from './hooks/getBotUserResponse'

const ChatBot = () =>{
    const [isBotActive, setIsBotActive] =  useState(false)
    const [message, setMessage] = useState('')
    const [conversations, setConversations] = useState([])

    const {saveUserMessage,saveBotMessage} = GetBotUserResponse({setConversations});

    const handleActiveBot = () =>{
        setIsBotActive((prev)=> !prev)
        if (conversations.length < 1){
            saveBotMessage('hello');
        }
    }

    const getBotResponse = (enter_message) =>{
        if(enter_message.trim().length > 0){
            saveUserMessage(enter_message);
            saveBotMessage(enter_message);
            setMessage('')
        }
    }

    return (
        <div className={styles.bot_div}>
            <div className={styles.chatbot_icon}>
                <SiChatbot className={styles.icon} onClick={handleActiveBot}/>
            </div>
            {isBotActive ? (
            <div className={styles.chatbot_body}>
                <Chatbotheader handleActiveBot={handleActiveBot}/>
                <ChatBotBody conversations ={conversations} message={message} getBotResponse={getBotResponse}/>
                <ChatBotFooter setMessage={setMessage} message={message} getBotResponse={getBotResponse} />
            </div>
            ): null}
        </div>
    )
}

export default ChatBot