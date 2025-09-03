import React, { createContext, useContext } from "react"
import { homeFilterbarStore } from "./HomeFilterbarStore"
import { liveMatchStore } from "./LiveMatchStore"


const stores = {
  homeFilterbarStore,
  liveMatchStore,
}

const StoresContext = createContext(stores)

export function StoresProvider({ children }) {
  return (
    <StoresContext.Provider value={stores}>
      {children}
    </StoresContext.Provider>
  )
}

export const useStores = () => useContext(StoresContext)