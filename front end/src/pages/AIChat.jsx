import { useState, useRef, useEffect, useContext } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSideBar } from '@/components/DashboardComponents/DashboardSideBar';
import { UserContext } from '@/UserContext';
import { adminItems } from './dashboards/admin-dashboard/Admin';
import { orgItems } from './dashboards/org-dashboard/Organizer';
import { attItems } from './dashboards/att-dashboard/Attendee';

export default function AIChat() {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hello! I\'m E7gezly Assistant. I can help you find events, check ticket availability, discover performers, and answer questions about our platform. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Determine which sidebar items to show based on user type
  const getSidebarItems = () => {
    if (!user) return [];
    if (user.status === 'Admin') return adminItems;
    if (user.status === 'Organizer') return orgItems;
    if (user.status === 'Attendee') return attItems;
    return [];
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/ai/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMessages(prev => [...prev, { role: 'ai', text: data.message }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Sorry, I\'m having trouble connecting. Please check your internet connection and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <DashboardSideBar items={getSidebarItems()} />
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          {/* Header */}
          <div className="bg-card shadow-sm border-b border-border p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">E7gezly Assistant</h1>
                <p className="text-sm text-muted-foreground">Ask me anything about events!</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <Bot className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex-1 max-w-2xl ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-card-foreground shadow-sm border border-border'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-card border-t border-border p-4">
            <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about events, tickets, performers..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}