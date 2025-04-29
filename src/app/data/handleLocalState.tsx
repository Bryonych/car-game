/**
 * Gets, sets and removes state from local storage
 */
export const localStateStore = {
    getItem: () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem("car-game");
        }
      } catch (e) {
        console.warn('localStorage getItem failed', e);
      }
      return null;
    },
    setItem: (value: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem("car-game", value);
        }
      } catch (e) {
        console.warn('localStorage setItem failed', e);
      }
    },
    removeItem: () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem("car-game");
        }
      } catch (e) {
        console.warn('localStorage removeItem failed', e);
      }
    }
  };