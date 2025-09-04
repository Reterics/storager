import { useEffect, useState } from 'react';

// Minimal type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallButtonProps {
  className?: string;
  label?: string;
  onInstalled?: () => void;
}

export default function PWAInstallButton({
  className,
  label = 'Install App',
  onInstalled,
}: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      if (typeof onInstalled === 'function') onInstalled();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [onInstalled]);

  if (installed || !deferredPrompt) return null;

  const handleInstall = async () => {
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      // After choice, hide the button regardless of outcome
      setDeferredPrompt(null);
    } catch {
      // ignore
    }
  };

  return (
    <button type="button" onClick={handleInstall} className={className}>
      {label}
    </button>
  );
}
