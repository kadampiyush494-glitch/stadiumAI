import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initNotifications, NOTIFICATION_TYPES } from './fcmService';

// Mock Firebase Messaging
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn(() => Promise.resolve('mock-fcm-token')),
  onMessage: vi.fn()
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(() => Promise.resolve()),
  arrayUnion: vi.fn(val => val)
}));

import { getToken, onMessage } from 'firebase/messaging';
import { updateDoc } from 'firebase/firestore';

describe('fcmService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('Notification', {
      requestPermission: vi.fn(() => Promise.resolve('granted'))
    });
  });

  it('requests permission and registers token to Firestore', async () => {
    await initNotifications('user-123');

    expect(window.Notification.requestPermission).toHaveBeenCalled();
    expect(getToken).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });

  it('does not register if permission is denied', async () => {
    vi.stubGlobal('Notification', {
      requestPermission: vi.fn(() => Promise.resolve('denied'))
    });
    
    await initNotifications('user-123');
    
    expect(getToken).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('logs error when getToken fails', async () => {
    getToken.mockRejectedValueOnce(new Error('FCM Error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await initNotifications('user-123');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('defines mandatory notification types', () => {
    expect(NOTIFICATION_TYPES.EMERGENCY).toBe('EMERGENCY');
    expect(NOTIFICATION_TYPES.CONGESTION_ALERT).toBe('CONGESTION_ALERT');
  });

  it('subscribes to venue topic via backend', async () => {
    const mockFetch = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal('fetch', mockFetch);
    
    // Import the functions we need
    const { subscribeToVenue } = await import('./fcmService');
    await subscribeToVenue('venue-1');

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/notifications/subscribe'), expect.objectContaining({
      method: 'POST'
    }));
  });

  it('sends notification and triggers vibration for emergency', async () => {
    const mockFetch = vi.fn(() => Promise.resolve({ ok: true }));
    const mockVibrate = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('navigator', { vibrate: mockVibrate });

    const { sendNotification } = await import('./fcmService');
    await sendNotification({ type: 'EMERGENCY', message: 'Run!' });

    expect(mockVibrate).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalled();
  });

  it('registers foreground message listener', async () => {
    const { onForegroundMessage } = await import('./fcmService');
    const cb = vi.fn();
    
    onForegroundMessage(cb);
    expect(onMessage).toHaveBeenCalled();
  });

  it('logs error when fetch fails in sendNotification', async () => {
    const mockFetch = vi.fn(() => Promise.reject(new Error('Network Error')));
    vi.stubGlobal('fetch', mockFetch);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { sendNotification } = await import('./fcmService');
    await sendNotification({ type: 'GENERAL' });

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('Notification Routing (click intent logic)', () => {
  // Logic from Service Worker click handler
  const getUrlForType = (type) => {
    if (type === 'CONGESTION_ALERT') return '/dashboard?tab=map';
    if (type === 'QUEUE_UPDATE') return '/dashboard?tab=queues';
    return '/dashboard';
  };

  it('routes correctly based on notification type', () => {
    expect(getUrlForType('CONGESTION_ALERT')).toContain('tab=map');
    expect(getUrlForType('QUEUE_UPDATE')).toContain('tab=queues');
    expect(getUrlForType('GENERAL')).toBe('/dashboard');
  });
});
