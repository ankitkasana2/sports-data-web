"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const RefereeAnalyticsTable = ({ data }) => {
  return (
    <ScrollArea className="w-full">
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border px-3 py-2">Referee</th>
            <th className="border px-3 py-2">Matches</th>
            <th className="border px-3 py-2">Frees / 100</th>
            <th className="border px-3 py-2">Cards / 100</th>
            <th className="border px-3 py-2">Points from Frees / 100</th>
            <th className="border px-3 py-2">50m Advances / 10 Opp Kick-outs</th>
            <th className="border px-3 py-2">Kick-out Non-crossing 40m %</th>
            <th className="border px-3 py-2">Pace (poss/60)</th>
            <th className="border px-3 py-2">Added Time / Half (s)</th>
            <th className="border px-3 py-2">Close-game %</th>
            <th className="border px-3 py-2">Over/Under Tendency</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ref, idx) => (
            <tr
              key={idx}
              className={ref.matches < 3 ? "bg-gray-100 text-gray-400" : "hover:bg-gray-50"}
            >
              <td className="border px-3 py-2">{ref.name}</td>
              <td className="border px-3 py-2 text-center">{ref.matches}</td>
              <td className="border px-3 py-2 text-center">{ref.freesPer100}</td>
              <td className="border px-3 py-2 text-center">{ref.cardsPer100}</td>
              <td className="border px-3 py-2 text-center">{ref.pointsFromFreesPer100}</td>
              <td className="border px-3 py-2 text-center">{ref.advances50mPer10OppKickouts}</td>
              <td className="border px-3 py-2 text-center">{ref.kickoutNonCrossing40mPct}%</td>
              <td className="border px-3 py-2 text-center">{ref.pace}</td>
              <td className="border px-3 py-2 text-center">{ref.addedTimePerHalf}</td>
              <td className="border px-3 py-2 text-center">{ref.closeGamePct}%</td>
              <td className="border px-3 py-2 text-center">{ref.overUnderTendency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
};

export default RefereeAnalyticsTable;
