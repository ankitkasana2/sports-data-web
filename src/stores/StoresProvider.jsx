import React, { createContext, useContext } from "react"
import { homeFilterbarStore } from "./HomeFilterbarStore"
import { liveMatchStore } from "./LiveMatchStore"
import { matchesStore } from "./MatchesStore"
import { teamsStore } from "./TeamsStore"


const stores = {
  homeFilterbarStore,
  liveMatchStore,
  matchesStore,
  teamsStore,
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