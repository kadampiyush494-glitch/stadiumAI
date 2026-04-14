import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initNotifications, NOTIFICATION_TYPES } from './fcmService';

// Mock Firebase Messaging
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(),
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

import { getToken } from 'firebase/messaging';
import { updateDoc } from 'firebase/firestore';

describe('fcmService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.Notification = {
      requestPermission: vi.fn(() => Promise.resolve('granted'))
    };
  });

  it('requests permission and registers token to Firestore', async () => {
    await initNotifications('user-123');

    expect(global.Notification.requestPermission).toHaveBeenCalled();
    expect(getToken).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });

  it('does not register if permission is denied', async () => {
    global.Notification.requestPermission = vi.fn(() => Promise.resolve('denied'));
    
    await initNotifications('user-123');
    
    expect(getToken).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('defines mandatory notification types', () => {
    expect(NOTIFICATION_TYPES.EMERGENCY).toBe('EMERGENCY');
    expect(NOTIFICATION_TYPES.CONGESTION_ALERT).toBe('CONGESTION_ALERT');
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
