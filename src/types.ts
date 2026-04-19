export interface WsUser {
  id?: string;
  username: string;
  email: string;
  isActive: boolean;
}

export interface Message {
  id?: string;
  senderEmail: string;
  senderName: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
}
