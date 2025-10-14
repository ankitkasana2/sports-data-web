import React, { createContext, useContext } from "react"
import { homeFilterbarStore } from "./HomeFilterbarStore"
import { liveMatchStore } from "./LiveMatchStore"
import { matchesStore } from "./MatchesStore"
import { teamsStore } from "./TeamsStore"
import { refereesStore } from "./RefereesStore"
import { playersStore } from "./PlayersStore"
import { venuesStore } from "./VenuesStore"
import { competitionsStore } from "./CompetitionStore"
import { analyticsStore } from "./AnalyticsStore"


const stores = {
  homeFilterbarStore,
  liveMatchStore,
  matchesStore,
  teamsStore,
  playersStore,
  refereesStore,
  venuesStore,
  competitionsStore,
  analyticsStore
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