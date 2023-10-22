import { createContext, useState, useEffect, useCallback } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({children, user}) => {

    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null)
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([])

    console.log("notifications", notifications);


    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if(socket === null) return;
        socket.emit("addNewUser", user?._id)
        socket.on("getOnlineUsres", (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off("getOnlineUsres");
        }
    }, [socket])

    useEffect(() => {
        if(socket === null) return;
        
        const recipientId = currentChat?.members?.find((id) => id !== user._id);

        socket.emit("sendMessage", {...newMessage, recipientId})

    }, [newMessage])

    useEffect(() => {
        if (socket === null) return;
    
        socket.on("getMessage", (res) => {
            if (currentChat?._id !== res.chatId) return;
    
            setMessages((prev) => [...prev, res]);
        });

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some(id => id === res.senderId);

            if(isChatOpen){
                setNotifications(prev => [{...res, isRead: true}, ...prev])
            } else {
                setNotifications(prev => [res, ...prev])
            }
        })
    
        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        };
    }, [socket, currentChat]);
    



    useEffect(() => {
        const getUsers = async() => {
            const response = await getRequest(`${baseUrl}/users`);

            if(response.error){
                return console.log("Error fetching users", response)
            }

            const pChats = response.filter((u) => {
                let isChatCreated = false;

                if(user?._id === u._id) return false;

                if(userChats){
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                    })
                }

                return !isChatCreated;
            })
            setPotentialChats(pChats);
            setAllUsers(response);
        };

        getUsers();
    }, [userChats]);

    useEffect(() => {
        const getUserChats = async() => {
            if(user?._id){

                setIsUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatsLoading(false);

                if(response.error){
                    return setUserChatsError(response);
                }

                setUserChats(response);
            }
        };

        getUserChats();
    },[user, notifications]);

    useEffect(() => {
        const getMessages = async() => {
                setIsMessagesLoading(true);
                setMessagesError(null);

                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

                setIsMessagesLoading(false);

                if(response.error){
                    return setMessagesError(response);
                }

                setMessages(response);
        };

        getMessages();
        console.log("context - currentChat", currentChat)
    },[currentChat]);

    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if(!textMessage) return console.log("You must type something...");

        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify({
            chatId: currentChatId,
            senderId: sender._id,
            text: textMessage
        }));

        if(response.error){
            return setSendTextMessageError(response);
        }

        setNewMessage(response);
        setMessages((prev) => [...prev, response]);
        setTextMessage("");

    }, []);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (fId, sId) => {
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({
            firstId: fId,
            secondId: sId
        }));
    
        if (response.error) {
            console.log("Error creating chat", response); // Corrected error message
            return;
        }
    
        setUserChats((prev) => [...prev, response]);
    }, []);
    
    const markAllNotificationsAsRead = useCallback(() => {
        const mNotifications = notifications.map(n => {
            return {...n, isRead: true}
        });

        setNotifications(mNotifications);
    }, [])

    const markNotificationsAsRead = useCallback((
        n, userChats, user, notifications) => {


        const desiredChat = userChats.find(chat => {
            const chatMembers = [user._id, n.senderId];
            const isDesiredChat = chat?.members.every((member) => {
                return chatMembers.includes(member);
            });

            return isDesiredChat;
        });

        const mNotifications = notifications.map(el => {
            if(n.senderId === el.senderId){
                return {...n, isRead: true};
            }else{
                return el;
            }
        })

        updateCurrentChat(desiredChat);
        setNotifications(mNotifications);

    }, [])

    const markThisUserNotificationAsRead = useCallback((thisUserNotifications, notification) => {
        const mNotifications = notification.map(el => {
            let notification;

            thisUserNotifications.forEach(n => {
                if(n.senderId === el.senderId){
                    notification = {...n, isRead: true};
                }else{
                    notification = el;
                }
            })

            return notification;
        })

        setNotifications(mNotifications);

    }, [])

    return <ChatContext.Provider value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        isMessagesLoading,
        messagesError,
        currentChat,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationsAsRead,
        markThisUserNotificationAsRead,

    }}
    >
        {children}
        </ChatContext.Provider>
}