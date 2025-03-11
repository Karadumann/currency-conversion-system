export class NotificationService {
  private static instance: NotificationService;
  private audio: HTMLAudioElement;

  private constructor() {
    this.audio = new Audio('/notification.mp3');
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options
      });
      this.playSound();
    }
  }

  private playSound(): void {
    this.audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
}

export const notificationService = NotificationService.getInstance(); 