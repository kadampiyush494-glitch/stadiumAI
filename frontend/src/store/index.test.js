import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './index';

describe('Global Store', () => {
    beforeEach(() => {
        // Reset store state
        useStore.getState().logout();
        if (useStore.getState().accessibilityHighContrast) {
            useStore.getState().toggleHighContrast();
        }
    });

    it('sets user on login', () => {
        const user = { id: '1', name: 'Test User' };
        const token = 'fake-token';
        useStore.getState().login(user, token);
        
        expect(useStore.getState().user).toEqual(user);
        expect(useStore.getState().token).toBe(token);
    });

    it('clears user on logout', () => {
        useStore.getState().login({ id: '1' }, 'token');
        useStore.getState().logout();
        
        expect(useStore.getState().user).toBeNull();
        expect(useStore.getState().token).toBeNull();
    });

    it('toggles high contrast mode', () => {
        const initial = useStore.getState().accessibilityHighContrast;
        useStore.getState().toggleHighContrast();
        expect(useStore.getState().accessibilityHighContrast).toBe(!initial);
        
        useStore.getState().toggleHighContrast();
        expect(useStore.getState().accessibilityHighContrast).toBe(initial);
    });
});
