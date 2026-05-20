const faqs = [
  { q: 'How does verification work?', a: 'Workers upload NID/passport documents. Admins review in the admin panel and approve with audit logs.' },
  { q: 'Are bKash/Nagad payments real?', a: 'No — this project ships mock gateways that always succeed unless you simulate failure for testing.' },
  { q: 'How do notifications work?', a: 'Socket.io pushes booking and payment events to user rooms. FCM token storage is included for future push.' },
  { q: 'Can I chat with my worker?', a: 'Yes — open a booking chat thread; messages broadcast over Socket.io booking rooms.' },
];

export function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="font-semibold">{f.q}</div>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
