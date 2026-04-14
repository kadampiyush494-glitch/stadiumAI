import { create } from 'zustand';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role - 'fan' | 'admin'
 */

/**
 * @typedef {Object} OmniStore
 * @property {User|null} user
 * @property {string|null} token
 * @property {boolean} isLoading
 * @property {function(User, string): void} login
 * @property {function(): void} logout
 * @property {boolean} accessibilityHighContrast
 * @property {function(): void} toggleHighContrast
 */

export const useStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  
  // Auth Actions
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
  
  // Accessibility Actions
  accessibilityHighContrast: false,
  toggleHighContrast: () => set((state) => ({ accessibilityHighContrast: !state.accessibilityHighContrast })),
}));
