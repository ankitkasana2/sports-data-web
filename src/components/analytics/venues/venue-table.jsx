"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const VenueAnalyticsTable = ({ data }) => {
  return (
    <ScrollArea className="w-full">
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border px-3 py-2">Venue</th>
            <th className="border px-3 py-2">Matches</th>
            <th className="border px-3 py-2">Venue Scoring Index</th>
            <th className="border px-3 py-2">Points / 100</th>
            <th className="border px-3 py-2">Goals / 100</th>
            <th className="border px-3 py-2">Free Conversion %</th>
            <th className="border px-3 py-2">2-pt Attempt Rate %</th>
            <th className="border px-3 py-2">Pace</th>
            <th className="border px-3 py-2">Ball-in-Play %</th>
            <th className="border px-3 py-2">Close-Game %</th>
            <th className="border px-3 py-2">Ref–Venue Interactions</th>
            <th className="border px-3 py-2">Night / Day</th>
            <th className="border px-3 py-2">Early / Late Season</th>
          </tr>
        </thead>
        <tbody>
          {data.map((venue, idx) => (
            <tr
              key={idx}
              className={venue.matches < 3 ? "bg-gray-100 text-gray-400" : "hover:bg-gray-50"}
            >
              <td className="border px-3 py-2">{venue.name}</td>
              <td className="border px-3 py-2 text-center">{venue.matches}</td>
              <td className="border px-3 py-2 text-center">{venue.scoringIndex}</td>
              <td className="border px-3 py-2 text-center">{venue.pointsPer100}</td>
              <td className="border px-3 py-2 text-center">{venue.goalsPer100}</td>
              <td className="border px-3 py-2 text-center">{venue.freeConversionPct}%</td>
              <td className="border px-3 py-2 text-center">{venue.twoPtAttemptRatePct}%</td>
              <td className="border px-3 py-2 text-center">{venue.pace}</td>
              <td className="border px-3 py-2 text-center">{venue.ballInPlayPct}%</td>
              <td className="border px-3 py-2 text-center">{venue.closeGamePct}%</td>
              <td className="border px-3 py-2 text-center">{venue.refInteractions}</td>
              <td className="border px-3 py-2 text-center">{venue.nightDay}</td>
              <td className="border px-3 py-2 text-center">{venue.earlyLateSeason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
};

export default VenueAnalyticsTable;
