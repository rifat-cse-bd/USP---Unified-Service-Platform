import * as React from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/context/SocketContext';

export function BookingChatPage() {
  const { id } = useParams();
  const socket = useSocket();
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState('');

  const load = () => api.get(`/chat/${id}`).then(({ data }) => setMessages(data.messages || []));

  React.useEffect(() => {
    load();
  }, [id]);

  React.useEffect(() => {
    if (!socket) return;
    socket.emit('join:booking', id);
    const handler = (msg) => setMessages((m) => [...m, msg]);
    socket.on('chat:message', handler);
    return () => {
      socket.emit('leave:booking', id);
      socket.off('chat:message', handler);
    };
  }, [socket, id]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/chat/${id}`, { content: text });
    setText('');
    load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Booking chat #{id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg bg-background/80 px-3 py-2 shadow-sm">
                <div className="text-xs font-semibold text-primary">{m.sender_name}</div>
                <div>{m.content}</div>
              </div>
            ))}
            {!messages.length && <p className="text-muted-foreground">No messages yet.</p>}
          </div>
          <form className="flex gap-2" onSubmit={send}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
