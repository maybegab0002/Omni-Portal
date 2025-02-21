import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, User2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '../lib/utils'

interface TeamMember {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'away'
  avatar?: string
}

interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: Date
  attachments?: string[]
}

export default function TeamChat() {
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: '1',
      content: 'Hey team, any updates on the new property listings?',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: '2',
      senderId: '2',
      content: 'Yes, I just uploaded the new photos for the Living Water properties.',
      timestamp: new Date(Date.now() - 1800000), // 30 mins ago
    },
  ])

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      role: 'Sales Agent',
      status: 'online',
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Property Manager',
      status: 'offline',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'Sales Agent',
      status: 'online',
    },
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: '1', // Current user ID (hardcoded for now)
        content: message,
        timestamp: new Date(),
      }
      setChatMessages([...chatMessages, newMessage])
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Chat</h2>
          <p className="text-muted-foreground">Stay connected with your team</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat Area */}
        <div className="col-span-9 bg-white rounded-xl shadow-sm p-4 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatMessages.map((msg) => {
              const sender = teamMembers.find(member => member.id === msg.senderId)
              const isCurrentUser = msg.senderId === '1' // Hardcoded current user ID

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-start space-x-3",
                    isCurrentUser && "flex-row-reverse space-x-reverse"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {sender?.avatar ? (
                      <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className={cn(
                    "max-w-[70%]",
                    isCurrentUser ? "items-end" : "items-start"
                  )}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{sender?.name}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={cn(
                      "rounded-lg p-3",
                      isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    )}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Message Input */}
          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Team Members Sidebar */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                whileHover={{ x: 5 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User2 className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  member.status === 'online' && "bg-green-500",
                  member.status === 'offline' && "bg-gray-300",
                  member.status === 'away' && "bg-yellow-500"
                )} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
