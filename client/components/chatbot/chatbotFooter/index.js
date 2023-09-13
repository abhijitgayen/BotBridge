import {BiSolidSend} from 'react-icons/bi'
import styles from '../styles.module.css'
import Link from 'next/link'

const ChatBotFooter = ({ setMessage = () => {}, message= '', getBotResponse = () => {}}) => {

    return (
        <div className={styles.chatbot_footer}>
            <div className={styles.chatbot_footer_div}>
            <div className={styles.input_div}>
                <input 
                type="text" 
                placeholder='Type your message ....' 
                className={styles.chatbot_input} 
                onChange={(e)=>setMessage(e.target.value)} 
                onKeyDown={(e) => {
                    if (e.key === 'Enter'){
                        getBotResponse(message)
                    }
                }}
                value={message}
                />
            </div>
            <div onClick={() => getBotResponse(message)}>
                <BiSolidSend className={styles.send_icon} />
            </div>
            
            </div>
            <div className={styles.footer_developer}>
                Developed by <Link className={styles.developer} href='https://abhijitgayen.vercel.app/'>Abhijit Gayen</Link>
            </div>
        </div>
    )
}

export default ChatBotFooter