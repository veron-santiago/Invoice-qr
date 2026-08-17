import { createContext, useContext, useState, useCallback } from 'react';

const NavigationBlockerContext = createContext();

export const NavigationBlockerProvider = ({ children }) => {
  const [blocker, setBlocker] = useState(null);

  const registerBlocker = useCallback((checkFn) => {
    setBlocker(checkFn);
  }, []);

  const unregisterBlocker = useCallback(() => {
    setBlocker(null);
  }, []);

  return (
    <NavigationBlockerContext.Provider value={{ blocker, registerBlocker, unregisterBlocker }}>
      {children}
    </NavigationBlockerContext.Provider>
  );
};

export const useNavigationBlocker = () => {
  return useContext(NavigationBlockerContext);
};
