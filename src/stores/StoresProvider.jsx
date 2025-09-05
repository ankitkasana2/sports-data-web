import React, { createContext, useContext } from "react"
import { homeFilterbarStore } from "./HomeFilterbarStore"
import { liveMatchStore } from "./LiveMatchStore"
import { matchesStore } from "./MatchesStore"


const stores = {
  homeFilterbarStore,
  liveMatchStore,
  matchesStore,
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