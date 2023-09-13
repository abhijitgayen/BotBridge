import { useEffect, useRef, useState } from 'react'
import styles from '../styles.module.css'

const BotMessage = ({ conversation: { message, time }, getBotResponse =() => {} }) => {
    return (
        <div>
            <div className={styles.bot_message_div}>
                <div className={styles.bot_message}>
                    <div>
                        {message?.answer}
                    </div>
                    <div className={styles.time_stamp}>
                        {time}
                    </div>
                </div>
                <div></div>
            </div>
            <div className={styles.chatbot_btns}>
                {(message?.opts || []).map((val) => {
                    return (
                        <div className={styles.chatbot_btn_main}>
                            <div className={styles.chatbot_btn} onClick={() => {getBotResponse(val); console.log(val)}}>{val}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const UserMessage = ({ conversation: { message, time } }) => {
    return (
        <div className={styles.user_message_div}>
            <div></div>
            <div className={styles.user_message}>
                <div>
                    {message?.answer}
                </div>
                <div className={styles.time_stamp}>
                    {time}
                </div>
            </div>
        </div>

    )
}

const ChatBotBody = ({ conversations = [] , getBotResponse = () => {}}) => {

    const messageBodyRef = useRef(null)

    useEffect(() => {
        messageBodyRef?.current.scrollIntoView({ behavior: 'smooth' })
    }, [conversations])

    return (
        <div className={styles.chtabot_body_messages}>
            <div>
                {
                    conversations.map((conversation, index) => {
                        return (
                            <div key={index}>
                                {conversation.type === 'bot' ? <BotMessage conversation={conversation} getBotResponse={getBotResponse} /> : <UserMessage conversation={conversation} />}
                            </div>
                        )
                    })
                }
            </div>
            <div ref={messageBodyRef} />
        </div>
    )
}

export default ChatBotBody