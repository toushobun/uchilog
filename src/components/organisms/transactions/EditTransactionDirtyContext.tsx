"use client";

import { createContext, useContext, type ReactNode } from "react";

const EditTransactionDirtyContext = createContext<(() => void) | null>(null);

export function EditTransactionDirtyProvider({
  children,
  onDirty,
}: {
  children: ReactNode;
  onDirty: () => void;
}) {
  return (
    <EditTransactionDirtyContext.Provider value={onDirty}>
      {children}
    </EditTransactionDirtyContext.Provider>
  );
}

export function useEditTransactionDirty() {
  return useContext(EditTransactionDirtyContext);
}
