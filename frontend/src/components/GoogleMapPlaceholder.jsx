import * as React from 'react';

export function GoogleMapPlaceholder({ title = 'Service area map', address = 'Dhaka, Bangladesh', className = '' }) {
  // Simple iframe embed that works without API key
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOMLD0k9XKTtf8&q=${encodedAddress}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="rounded-2xl border border-border/80 bg-muted/40 overflow-hidden">
        <iframe
          src={mapUrl}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Showing approximate location for {address}. For production, set <code className="rounded bg-muted px-1">VITE_GOOGLE_MAPS_KEY</code> for enhanced features.
      </p>
    </div>
  );
}
