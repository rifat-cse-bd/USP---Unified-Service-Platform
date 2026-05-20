import { motion } from 'framer-motion';
import { Target, HeartHandshake, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">About WorkSure</h1>
        <p className="text-lg text-muted-foreground">
          WorkSure is a production-style blueprint for a service marketplace: verified supply, structured bookings, transparent payments, and admin
          oversight — built for modern SaaS expectations.
        </p>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Target, title: 'Mission', body: 'Make hiring trustworthy workers as simple as ordering cloud infrastructure.' },
          { icon: HeartHandshake, title: 'Trust', body: 'Role-based access, document verification, and reviews keep quality high.' },
          { icon: Cpu, title: 'Tech', body: 'React + Express + MySQL + Socket.io with clear separation of concerns.' },
        ].map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Card className="h-full">
              <CardHeader>
                <item.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.body}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
