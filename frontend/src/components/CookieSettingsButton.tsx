'use client';

import { Cookie } from 'lucide-react';
import { openCookieSettings } from '@/lib/consent';
import { Button } from './ui';

export function CookieSettingsButton() {
  return (
    <Button variant="secondary" onClick={openCookieSettings}>
      <Cookie className="h-4 w-4" /> Alterar preferências de cookies
    </Button>
  );
}
