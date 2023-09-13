import styles from '../styles.module.css'
import {GiCrossMark} from 'react-icons/gi'
import {SiChatbot} from 'react-icons/si'

const Chatbotheader =({handleActiveBot}) =>{
    return (
        <div className={styles.chatbot_header}>
            <div className={styles.header_div}>
                <SiChatbot className={styles.headr_bot_icon} onClick={handleActiveBot}/> 
                ChatBot
            </div>
            <div>
                <GiCrossMark className={styles.close_icon} onClick={handleActiveBot}/>
            </div>
        </div>
    )
}

export default Chatbotheader