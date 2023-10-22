import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import avatar from "../../assets/avatar.svg"
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unReadNotificationsFunc } from "../../utils/unReadNotifications";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import moment from "moment";

const UserChat = ({chat, user}) => {
    const { recipientUser } = useFetchRecipientUser(chat, user);
    const { onlineUsers, notifications, markThisUserNotificationAsRead } = useContext(ChatContext);
    const {latestMessage} = useFetchLatestMessage(chat);

    const unReadNotifications = unReadNotificationsFunc(notifications);
    const thisUserNotifications = unReadNotifications?.filter(n => n.senderId === recipientUser._id);
    const isOnline = recipientUser && recipientUser._id
    ? onlineUsers?.some((user) => user?.userId === recipientUser._id)
    : false;

    const formatMessageTimestamp = (timestamp) => {
        const messageDate = moment(timestamp);
        const today = moment();
      
        if (messageDate.isSame(today, "day")) {
          return messageDate.format("HH:mm");
        } else {
          return messageDate.format("DD/MM/YYYY HH:mm");
        }
      };

      const truncateText = (text) => {
        let shortText = text.substring(0, 20);

        if(text.length > 20){
            shortText = shortText + "...";
        }

        return shortText;
      }
    return (
         <>
         <Stack direction="horizontal"
          gap={3} 
          className="user-card 
          align-items-center p-2 justify-content-between" 
          role="button"
          onClick={() => {
            if(thisUserNotifications?.length !== 0){
                markThisUserNotificationAsRead(
                    thisUserNotifications, notifications
                )
            }
         }}>
            <div className="d-flex">
                <div className="me-2">
                    <img src={avatar} height="35px" />
                </div>
                <div className="text-Content">
                    <div className="name">{recipientUser?.name}</div>
                    <div className="text">{
                        latestMessage?.text && (
                            <span>{truncateText(latestMessage?.text)}</span>
                        )
                    }</div>
                </div>
            </div>
                <div className="d-flex flex-column align-items-end">
                    <div className="date">
                        {latestMessage && latestMessage.createdAt
                            ? formatMessageTimestamp(latestMessage.createdAt)
                            : "No messages"
                        }
                    </div>
                <div className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ""}>
                    {thisUserNotifications?.length > 0 ? thisUserNotifications.length : ""}
                </div>
                <span className={ isOnline ? "user-online" : ""}></span>
            </div>
        </Stack>
        </>
         );
}
 
export default UserChat;