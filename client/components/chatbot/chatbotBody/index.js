import { useEffect, useRef, useState }  from 'react'
import styles from '../styles.module.css'

const BotMessage = ({conversation}) => {
    return (
        <div className={styles.bot_message_div}>
            <div className={styles.bot_message}>
                <div>
                    {conversation.message}
                </div> 
                <div className={styles.time_stamp}>
                    {conversation.time}
                </div>
            </div>
            <div></div>
        </div>
        
    )
}

const UserMessage = ({conversation}) => {
    return (
        <div className={styles.user_message_div}>
            <div></div>
            <div className={styles.user_message}>
                <div>
                    {conversation.message}
                </div> 
                <div className={styles.time_stamp}>
                    {conversation.time}
                </div>
            </div>
        </div>
       
    )
}

const ChatBotBody =({conversations = []}) =>{

    const messageBodyRef = useRef(null)

    useEffect(()=>{
        messageBodyRef?.current.scrollIntoView({behavior: 'smooth'})
    },[conversations])
    
    return(
        <div className={styles.chtabot_body_messages}>
            <div>
            {
                conversations.map((conversation, index)=>{
                    return(
                        <div key={index}>
                            {conversation.type === 'bot' ? <BotMessage conversation={conversation} /> : <UserMessage conversation={conversation}/>}
                        </div>
                    )
                })
            }
            </div>
            <div ref={messageBodyRef}/>
        </div>
    )
}

export default ChatBotBody