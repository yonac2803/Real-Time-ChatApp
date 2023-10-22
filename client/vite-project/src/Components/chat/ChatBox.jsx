import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from 'react-input-emoji';
import send from "../../assets/send.svg"

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, sendTextMessage } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipientUser(currentChat, user);
    const [ textMessage, setTextMessage ] = useState("");
    const scroll = useRef()

    console.log("textMessage", textMessage);

    useEffect(() => {
        scroll.current?.scrollIntoView({behavior: "smooth"});
    }, [messages])

    if (!recipientUser) {
        return (
            <p style={{ textAlign: "center", width: "100%" }}>
                No Chat selected yet...
            </p>
        );
    }
    if (isMessagesLoading) {
        return (
            <p style={{ textAlign: "center", width: "100%" }}>
                Loading...
            </p>
        );
    }

    const formatMessageTimestamp = (timestamp) => {
        const messageDate = moment(timestamp);
        const today = moment();
      
        if (messageDate.isSame(today, "day")) {
          // Display time in 24-hour format for messages sent today
          return messageDate.format("HH:mm");
        } else {
          // Display full date and time for messages sent on other days
          return messageDate.format("DD/MM/YYYY HH:mm");
        }
      };

    return (
        <Stack gap={4} className="chat-box">
            <div className="chat-header">
                <strong>{recipientUser?.name}</strong>
            </div>
            <Stack gap={3} className="messages">
                {messages && messages.map((message, index) => (
                    <Stack key={index} className={`${message?.senderId === user?._id ? "message self align-self-end flex-grow-0" : 
                    "message align-self-start flex-grow-0"}`}
                    ref={scroll}
                    >
                        <span>{message.text}</span>
                        <span className="message-footer">
                            {formatMessageTimestamp(message.createdAt)}
                        </span> 
                   </Stack>
                ))}
            </Stack>
            <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
                    <InputEmoji value={textMessage} onChange={setTextMessage} fontFamily="Montserrat" borderColor="rgba(72,112,223,0.2)"/>
                    <button className="send-btn" onClick={() => sendTextMessage(textMessage, user, currentChat, setTextMessage)}>
                        <img src={send} />
                    </button>

            </Stack>
        </Stack>
    );
    
}
 
export default ChatBox;