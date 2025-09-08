import React, { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import data from "../../data"
import { useSearchParams } from "react-router-dom"
import { observer } from "mobx-react-lite"
import { useStores } from "../stores/StoresProvider"
import { toJS } from "mobx"


function HomeFilterbar() {

  const { homeFilterbarStore } = useStores()
  const { filters, years, competitions, grades, groups, matches } = homeFilterbarStore

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.size != 0) {
      if (searchParams.get("season")) {
        homeFilterbarStore.setFilter("season", searchParams.get("season"))
      }
    } else {
      homeFilterbarStore.setFilter("season", new Date().getFullYear())
    }

    if (localStorage.getItem('filters')) {
      let filtersValue = JSON.parse(localStorage.getItem("filters"))

      homeFilterbarStore.setFilter("season", filtersValue.season)
      homeFilterbarStore.setFilter("competition", filtersValue.competition)
      homeFilterbarStore.setFilter("code", filtersValue.code)
      homeFilterbarStore.setFilter("grade", filtersValue.grade)
      homeFilterbarStore.setFilter("group", filtersValue.group)

    }
    homeFilterbarStore.loadCompetitions()
    homeFilterbarStore.getMatches()

  }, [])





  useEffect(() => {
    searchParams.set("season", filters.season)
    searchParams.set("competition", filters.competition.short)
    searchParams.set("code", filters.code)
    searchParams.set("grade", filters.grade)
    searchParams.set("group", filters.group)
    setSearchParams(searchParams)


    homeFilterbarStore.getMatches()
    homeFilterbarStore.loadCompetitions()

  }, [filters.season, filters.competition, filters, filters.code, filters.grade, filters.group])





  return (
    <div className="sticky top-14 z-50 bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-4 items-center">

          {/* season */}
          <Select
            value={String(filters.season)}
            onValueChange={(val) => homeFilterbarStore.setFilter("season", val)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* competition */}
          <Select
            value={filters.competition.name}

            onValueChange={(val) => {
              if (val === "All") {
                // Reset filters when "All" is selected
                homeFilterbarStore.setFilter("competition", { name: "All", id: null, short: null })
                // homeFilterbarStore.setFilter("code", null)
              } else {
                // Find the competition object
                const comp = competitions.find(c => c.competition_name === val)
                if (comp) {
                  homeFilterbarStore.setFilter("competition", { name: comp.competition_name, id: comp.id, short: comp.competition_code })
                  homeFilterbarStore.setFilter("code", comp.game_code)
                }
              }
            }}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {competitions?.map(c => (
                <SelectItem key={c.competition_code} value={c.competition_name}>{c.competition_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* code */}
          <Select
            value={filters.code}
            onValueChange={(val) => homeFilterbarStore.setFilter("code", val)}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Select game code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hurling">Hurling</SelectItem>
              <SelectItem value="Football">Football</SelectItem>
            </SelectContent>
          </Select>

          {/* grade */}
          <Select
            value={filters.grade}
            onValueChange={(val) => homeFilterbarStore.setFilter("grade", val)}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Enter match grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* group */}
          <Select
            value={filters.group}
            onValueChange={(val) => homeFilterbarStore.setFilter("group", val)}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Enter match group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>

        </div>
      </div>
    </div>
  )
}


export default observer(HomeFilterbar)
