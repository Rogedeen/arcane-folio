import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ReferenceData, ReferenceContextValue } from '../types/reference';

const ReferenceContext = createContext<ReferenceContextValue | null>(null);

const DEFAULT_REFERENCE_CONTEXT: ReferenceContextValue = {
  isOpen: false,
  activeItem: null,
  openReference: () => {},
  closeReference: () => {},
};

export function ReferenceProvider({ children }: { children: ReactNode }) {
  const [activeItem, setActiveItem] = useState<ReferenceData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openReference = useCallback((item: ReferenceData) => {
    setActiveItem(item);
    setIsOpen(true);
  }, []);

  const closeReference = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ReferenceContext.Provider
      value={{
        isOpen,
        activeItem,
        openReference,
        closeReference,
      }}
    >
      {children}
    </ReferenceContext.Provider>
  );
}

export function useReference(): ReferenceContextValue {
  const ctx = useContext(ReferenceContext);
  return ctx ?? DEFAULT_REFERENCE_CONTEXT;
}
