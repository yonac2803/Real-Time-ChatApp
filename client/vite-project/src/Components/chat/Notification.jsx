import { useContext, useState } from 'react';
import notification from '../../assets/notification.svg';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { unReadNotificationsFunc } from '../../utils/unReadNotifications';
import moment from 'moment';

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const {
    notifications,
    userChats,
    allUsers,
    markAllNotificationsAsRead,
    markNotificationsAsRead,
  } = useContext(ChatContext);

  const unReadNotifications = unReadNotificationsFunc(notifications);
  const modifiedNotifications = notifications.map((n) => {
    const sender = allUsers.find((user) => user._id === n.senderId);

    return {
      ...n,
      senderName: sender?.name,
    };
  });

  const formatMessageTimestamp = (timestamp) => {
    const messageDate = moment(timestamp);
    const today = moment();

    if (messageDate.isSame(today, 'day')) {
      return messageDate.format('HH:mm');
    } else {
      return messageDate.format('DD/MM/YYYY HH:mm');
    }
  };

  return (
    <>
      <div className="notifications">
        <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
          <img src={notification} />
          {unReadNotifications?.length === 0 ? null : (
            <span className="notification-count">
              <span>{unReadNotifications?.length}</span>
            </span>
          )}
        </div>
        {isOpen ? (
          <div className="notifications-box">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <div
                className="mark-as-read"
                onClick={() => markAllNotificationsAsRead(notification)}
              >
                Mark all as read
              </div>
            </div>
            {modifiedNotifications?.length === 0 ? <span>No notifications</span> : null}
            {modifiedNotifications &&
              modifiedNotifications.map((n, index) => {
                if (n && n.createdAt) {
                  return (
                    <div
                      key={index}
                      className={n.isRead ? 'notification' : 'notification not-read'}
                      onClick={() => {
                        markNotificationsAsRead(n, userChats, user, notifications);
                        setIsOpen(false);
                      }}
                    >
                      <span>{`${n.senderName} sent you a new message`}</span>
                      <span className="notification-time">
                        At {formatMessageTimestamp(n.createdAt)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Notification;
