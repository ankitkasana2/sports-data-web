import React from 'react'
import PossessionTracker from "@/components/PossessionTracker";
import EventForm from "@/components/EventForm";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import data from '@/data';

const entry = () => {

  const router = useRouter();

  const [match, setMatch] = useState(data.matchData[0]);
  const [events, setEvents] = useState([]);
  const [possessions, setPossessions] = useState([]);
  const [restarts, setRestarts] = useState([]);
  const matchId = data.matchData[0].id

  useEffect(() => {
    

    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "g":
            addPossession("Goal Scored");
            break;
          case "p":
            addPossession("Point Scored");
            break;
          case "w":
            addPossession("Wide");
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ events]);

  const addPossession = (endType) => {
    const newPossession = {
      id: Date.now(),
      matchId,
      endType,
      startClock: "10:15",
      endClock: "10:45",
      teamInPossessionId: match?.homeTeamId,
    };

    // ✅ Validation: if scored, require linked Shot Attempt
    if (["Goal Scored", "Point Scored"].includes(endType)) {
      const hasShot = events.some((e) => e.eventType === "Shot");
      if (!hasShot) {
        alert("A Shot Attempt must be recorded for this possession.");
        return;
      }
    }

    setPossessions((prev) => [...prev, newPossession]);
  };

  const addEvent = (event) => {
    setEvents((prev) => [...prev, event]);
  };

  const addRestart = (restart) => {
    setRestarts((prev) => [...prev, restart]);
  };



  return (
    <div>
      <div className="p-4 bg-gray-100 border-b">
        <h1 className="text-xl font-bold">
          Match Entry: {match?.TeamAID} vs {match?.TeamBID}
        </h1>
        <p className="text-sm text-gray-600">
          Date: {match?.Date} | Venue: {match?.VenueName}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Line-ups */}
        <div className="col-span-3 border rounded-lg p-2">
          <h2 className="font-semibold mb-2">{match?.TeamAID} Line-up</h2>
          <ul>
            {match?.homePlayers?.map((p) => (
              <li key={p.playerId} className="text-sm">
                #{p.jerseyNumber} {p.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3 border rounded-lg p-2">
          <h2 className="font-semibold mb-2">{match?.awayTeam} Line-up</h2>
          <ul>
            {match?.awayPlayers?.map((p) => (
              <li key={p.playerId} className="text-sm">
                #{p.jerseyNumber} {p.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Possession grid */}
        <div className="col-span-6 border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Possessions</h2>
          <div className="flex gap-2 mb-4">
            <button
              className="px-3 py-1 bg-green-500 text-white rounded"
              onClick={() => addPossession("Goal Scored")}
            >
              + Goal
            </button>
            <button
              className="px-3 py-1 bg-green-400 text-white rounded"
              onClick={() => addPossession("Point Scored")}
            >
              + Point
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={() => addPossession("Turnover Conceded")}
            >
              + Turnover
            </button>
            <button
              className="px-3 py-1 bg-amber-500 text-white rounded"
              onClick={() => addPossession("Free Won")}
            >
              + Free Won
            </button>
          </div>
          <PossessionTracker possessions={possessions} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Event Quick Forms */}
        <div className="col-span-8 border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Events</h2>
          <EventForm onSubmit={addEvent} />
          <ul className="mt-2">
            {events.map((e, i) => (
              <li key={i} className="text-sm">
                {e.eventType} ({e.outcome}) — Player {e.playerId}
              </li>
            ))}
          </ul>
        </div>

        {/* Restarts */}
        <div className="col-span-4 border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Restarts</h2>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() =>
              addRestart({
                id: Date.now(),
                type: "Kickout",
                result: "Retained",
              })
            }
          >
            + Add Restart
          </button>
          <ul className="mt-2">
            {restarts.map((r, i) => (
              <li key={i} className="text-sm">
                {r.type} → {r.result}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default entry