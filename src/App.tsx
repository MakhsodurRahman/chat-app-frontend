import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WebSocketProvider, useWebSocket } from './WebSocketContext';
import {
  MessageCircle, Search, MoreVertical, Paperclip, Send,
  Smile, Mic, CheckCheck, LogOut, Shield, User,
  Bell, ArrowLeft, AlertTriangle, Loader2
} from 'lucide-react';


const formatTime = (timestamp: any) => {
  if (!timestamp) return '';
  
  // Handle Spring's default LocalDateTime array format [year, month, day, hour, minute, ...]
  if (Array.isArray(timestamp)) {
    const hour = timestamp[3] || 0;
    const minute = timestamp[4] || 0;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const { connect, connecting, error } = useWebSocket();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && username) {
      connect({ email, username, isActive: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="max-w-md w-full glass p-10 rounded-[2rem] shadow-2xl space-y-8">
        <div className="text-center">
          <div className="bg-white/10 p-5 rounded-full w-fit mx-auto relative group">
             <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <MessageCircle className="h-14 w-14 text-green-400 relative" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            Mak Messenger
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Secure Real-time Messaging Hub
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleJoin}>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
              <input
                type="text"
                required
                disabled={connecting}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-white/30 disabled:opacity-50"
                placeholder="Your Display Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Bell className="absolute left-4 top-3.5 h-5 w-5 text-white/40" />
              <input
                type="email"
                required
                disabled={connecting}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-white/30 disabled:opacity-50"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <span className="text-xs text-red-300 leading-tight">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={connecting}
            className="w-full py-4 text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-600 font-bold rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : 'Start Chatting'}
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { 
    connected, sendMessage, messages, allUsers, currentUser, 
    disconnect, selectedUserEmail, setSelectedUserEmail 
  } = useWebSocket();
  const [search, setSearch] = useState('');
  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeUser = useMemo(() => 
    allUsers.find(u => u.email === selectedUserEmail), 
    [allUsers, selectedUserEmail]
  );

  const filteredUsers = useMemo(() => 
    allUsers.filter(u => 
      u.email !== currentUser?.email && 
      (u.username.toLowerCase().includes(search.toLowerCase()) || 
       u.email.toLowerCase().includes(search.toLowerCase()))
    ), 
    [allUsers, currentUser, search]
  );

  const currentChat = useMemo(() => 
    selectedUserEmail ? messages[selectedUserEmail] || [] : [], 
    [messages, selectedUserEmail]
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserEmail && content.trim() && currentUser) {
      sendMessage({
        senderEmail: currentUser.email,
        senderName: currentUser.username,
        receiverEmail: selectedUserEmail,
        content: content,
        timestamp: new Date().toISOString()
      });
      setContent('');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat]);

  if (!connected) return <Login />;

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] overflow-hidden sm:p-5 lg:p-8 xl:px-20 xl:py-10">
      <div className="flex h-full w-full bg-white shadow-2xl rounded-none sm:rounded-2xl overflow-hidden border border-gray-200">
        
        {/* SIDEBAR */}
        <div className={`flex flex-col h-full border-r border-gray-200 bg-white transition-all duration-300 ${selectedUserEmail ? 'hidden md:flex md:w-1/3 lg:w-[35%]' : 'w-full md:w-1/3 lg:w-[35%]'}`}>
          {/* Sidebar Header - UPDATED TO SHOW LOGIN USER INFO */}
          <div className="bg-[#f0f2f5] p-4 flex justify-between items-center h-20 shrink-0 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white">
                  {currentUser?.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-gray-800 text-sm truncate leading-tight">{currentUser?.username}</h2>
                <p className="text-[10px] text-gray-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              <button onClick={disconnect} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all title='Logout'">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 bg-white shrink-0">
            <div className="relative bg-[#f0f2f5] rounded-xl flex items-center px-4 py-2 group focus-within:bg-white focus-within:ring-1 focus-within:ring-green-400">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search or start new chat" 
                className="w-full bg-transparent border-none outline-none pl-3 text-sm text-gray-700"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-grow overflow-y-auto scrollbar-hide">
             {filteredUsers.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <User className="h-12 w-12 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No users found</p>
                </div>
             ) : (
                filteredUsers.map(user => (
                    <div
                        key={user.email}
                        onClick={() => setSelectedUserEmail(user.email)}
                        className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-[#f5f6f6] transition-all relative active:scale-[0.98] ${selectedUserEmail === user.email ? 'bg-[#ebebeb] border-l-4 border-green-500' : ''}`}
                    >
                        <div className="relative shrink-0">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            {user.isActive && <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>}
                        </div>
                        <div className="ml-4 flex-grow overflow-hidden">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className="font-semibold text-gray-800 text-base truncate">{user.username}</h3>
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {user.isActive ? 'online' : 'away'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate w-full">{user.email}</p>
                        </div>
                    </div>
                ))
             )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={`flex flex-col h-full bg-[#f0f2f5] overflow-hidden ${!selectedUserEmail ? 'hidden md:flex md:flex-grow' : 'flex flex-grow'}`}>
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-[#f0f2f5] py-2 px-4 shadow-sm border-b border-gray-200 flex items-center justify-between h-16 shrink-0 z-10">
                <div className="flex items-center">
                  <button onClick={() => setSelectedUserEmail(null)} className="md:hidden mr-3 p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {activeUser.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="font-bold text-gray-800 text-base leading-tight">{activeUser.username}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${activeUser.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-gray-500 font-medium">{activeUser.isActive ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-2.5 text-gray-500 hover:bg-gray-200 rounded-full transition-all">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Content */}
              <div 
                ref={scrollRef}
                className="flex-grow p-4 md:p-8 space-y-4 overflow-y-auto whatsapp-bg scroll-smooth scrollbar-hide"
              >
                <div className="flex justify-center mb-6">
                    <span className="bg-[#d1d7db]/60 text-[#54656f] text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm">
                        Messages are end-to-end encrypted
                    </span>
                </div>

                <div>
                  {currentChat.map((msg, idx) => {
                    const isSent = msg.senderEmail === currentUser?.email;
                    return (
                        <div
                            key={msg.timestamp + idx}
                            className={`flex w-full mb-1 ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] p-2 rounded-xl shadow-sm relative group ${isSent ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                {!isSent && <p className="text-[10px] font-bold text-green-600 mb-1">{msg.senderName}</p>}
                                <p className="text-[14.5px] text-gray-800 break-words pr-12">{msg.content}</p>
                                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                    {isSent && <CheckCheck className="h-3 w-3 text-blue-400" />}
                                </div>
                            </div>
                        </div>
                    );
                  })}
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-200 z-10">
                <div className="flex items-center gap-1">
                    <button className="p-2.5 text-gray-500 hover:bg-gray-200 rounded-full transition-all">
                        <Smile className="h-6 w-6" />
                    </button>
                    <button className="p-2.5 text-gray-500 hover:bg-gray-200 rounded-full transition-all">
                        <Paperclip className="h-6 w-6" />
                    </button>
                </div>
                <form className="flex-grow flex items-center gap-2" onSubmit={handleSend}>
                  <input 
                    type="text" 
                    placeholder="Type a message" 
                    className="flex-grow bg-white border-none outline-none py-3 px-5 rounded-xl text-sm text-gray-800 shadow-sm focus:ring-1 focus:ring-gray-300 transition-all"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={!content.trim()}
                    className={`h-11 w-11 flex items-center justify-center rounded-full transition-all shadow-md group ${content.trim() ? 'bg-green-500 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {content.trim() ? <Send className="h-5 w-5 text-white ml-0.5" /> : <Mic className="h-5 w-5 text-white" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden md:flex h-full w-full flex-col items-center justify-center bg-gray-50 border-white/40 glass text-center p-10">
                <div className="relative group mb-10">
                   <div className="absolute -inset-4 bg-green-400/20 rounded-full blur-3xl scale-125"></div>
                   <div className="animate-bounce">
                     <MessageCircle className="h-28 w-28 text-gray-200 relative" />
                   </div>
                </div>
                <h1 className="text-3xl font-light text-gray-600 mb-3 tracking-tight">WhatsApp Web Pro</h1>
                <p className="max-w-md text-gray-400 text-sm leading-relaxed mb-8">
                    Send and receive messages without keeping your phone online.<br/>
                    Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                </p>
                <div className="flex items-center gap-2 text-gray-300 text-xs font-medium border-t border-gray-200 pt-8 w-64 justify-center">
                    <Shield className="h-4 w-4" /> End-to-end encrypted
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Main: React.FC = () => {
    return <WebSocketProvider><App /></WebSocketProvider>;
};

export default Main;
