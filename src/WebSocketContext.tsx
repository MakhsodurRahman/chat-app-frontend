import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { Message, WsUser } from './types';

interface WebSocketContextType {
  stompClient: Stomp.Client | null;
  connected: boolean;
  connecting: boolean;
  connect: (user: WsUser) => void;
  disconnect: () => void;
  sendMessage: (msg: Message) => void;
  messages: Record<string, Message[]>; // Key: target/sender email
  allUsers: WsUser[];
  currentUser: WsUser | null;
  selectedUserEmail: string | null;
  setSelectedUserEmail: (email: string | null) => void;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [allUsers, setAllUsers] = useState<WsUser[]>([]);
  const [currentUser, setCurrentUser] = useState<WsUser | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disconnect = useCallback(() => {
    if (stompClient) {
      stompClient.disconnect(() => {
        setConnected(false);
        setConnecting(false);
        setStompClient(null);
      });
    }
  }, [stompClient]);

  const addMessage = useCallback((email: string, msg: Message) => {
    setMessages((prev) => ({
      ...prev,
      [email]: [...(prev[email] || []), msg]
    }));
  }, []);

  const connect = useCallback((user: WsUser) => {
    console.log('--- WebSocket Connection Attempt ---');
    console.log('User:', user);
    setError(null);
    setConnecting(true);

    try {
      // Point to the relative /ws path when deployed so Nginx proxies it, bypassing CORS!
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';
      const socket = new SockJS(`${backendUrl}/ws`);
      const StompObj = (Stomp as any).Stomp || Stomp;
      const client = StompObj.over(socket);
      
      client.debug = (msg: string) => {
        console.log('[STOMP Debug]', msg);
      };

      client.connect({}, () => {
        console.log('--- WebSocket Connected Successfully ---');
        setConnected(true);
        setConnecting(false);
        setStompClient(client);
        setCurrentUser(user);

        // Notify backend of user registration
        client.send('/app/user', {}, JSON.stringify(user));

        // Subscribe to private messages
        client.subscribe(`/topic/messages/${user.email}`, (res: any) => {
          const msg: Message = JSON.parse(res.body);
          addMessage(msg.senderEmail, msg);
        });

        // Subscribe to user list updates
        client.subscribe('/topic/users', (res: any) => {
          console.log('Received users list:', res.body);
          const users: WsUser[] = JSON.parse(res.body);
          setAllUsers(users);
        });

        // Join as viewer/admin to get users
        client.send('/app/admin/join', {}, {});
      }, (err: any) => {
        console.error('--- WebSocket Connection Failed (Callback) ---', err);
        setError(`Connection failed. Is the backend running? Failed to connect to ${backendUrl}`);
        setConnected(false);
        setConnecting(false);
      });
    } catch (err: any) {
      console.error('--- WebSocket Initialization Crash ---', err);
      setError('Failed to initialize WebSocket: ' + err.message);
      setConnecting(false);
    }
  }, [addMessage]);

  const sendMessage = useCallback((msg: Message) => {
    if (stompClient && connected) {
      stompClient.send('/app/message', {}, JSON.stringify(msg));
      addMessage(msg.receiverEmail, msg);
    }
  }, [stompClient, connected, addMessage]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return (
    <WebSocketContext.Provider value={{ 
      stompClient, 
      connected, 
      connecting,
      connect, 
      disconnect, 
      sendMessage, 
      messages, 
      allUsers,
      currentUser,
      selectedUserEmail,
      setSelectedUserEmail,
      error
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};
