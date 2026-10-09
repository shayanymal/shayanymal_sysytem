/**
 * Notification Service supporting Web Notifications, Service Worker notifications,
 * and Web Audio API synthesized chimes for instant reservation alerts.
 */

class NotificationService {
  private audioCtx: AudioContext | null = null;

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm;
      } catch (e) {
        console.error('Error requesting notification permission:', e);
      }
    }
    return 'default';
  }

  isPermissionGranted(): boolean {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  // Plays a crystal clear pleasant chime for new reservation
  playChime(type: 'success' | 'alert' | 'urgent' = 'success') {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'success') {
        // Double pleasant ascending bell chime
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880, now + 0.12); // A5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now + 0.12);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
      } else {
        // Warning chime
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(370, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn('AudioContext playback blocked or failed:', e);
    }
  }

  // Sends system-level desktop notification
  sendSystemNotification(title: string, options?: NotificationOptions) {
    this.playChime('success');

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            dir: 'rtl',
            lang: 'ckb',
            ...options,
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } catch (e) {
          console.error('Failed to trigger native Notification:', e);
        }
      }
    }
  }
}

export const notificationService = new NotificationService();
