'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/sidepanel';
  }, []);

  return (
    <div>
      Redirecting to side panel...
    </div>
  );
}