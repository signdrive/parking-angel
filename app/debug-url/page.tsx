'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [urlInfo, setUrlInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrlInfo({
        origin: window.location.origin,
        host: window.location.host,
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol,
        href: window.location.href,
        envSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        envAppUrl: process.env.NEXT_PUBLIC_APP_URL,
      });
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>URL Debug Info</h1>
      <pre>{JSON.stringify(urlInfo, null, 2)}</pre>
    </div>
  );
}
