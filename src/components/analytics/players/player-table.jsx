// PlayerAnalyticsTable.jsx
import React from "react";

const PlayerAnalyticsTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Player</th>
            <th className="border px-2 py-1">Team</th>
            <th className="border px-2 py-1">Matches</th>
            <th className="border px-2 py-1">Goals</th>
            <th className="border px-2 py-1">1-pt</th>
            <th className="border px-2 py-1">2-pt</th>
            <th className="border px-2 py-1">Total Points</th>
            <th className="border px-2 py-1">Attempts</th>
            <th className="border px-2 py-1">Scores</th>
            <th className="border px-2 py-1">Accuracy %</th>
            <th className="border px-2 py-1">Assists</th>
            <th className="border px-2 py-1">Secondary Assists</th>
            <th className="border px-2 py-1">Turnovers Won</th>
            <th className="border px-2 py-1">Turnovers Conceded</th>
            <th className="border px-2 py-1">Fouls Won</th>
            <th className="border px-2 py-1">Fouls Committed</th>
            <th className="border px-2 py-1">Minutes Played</th>
            <th className="border px-2 py-1">Avg/Match</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{player.player}</td>
              <td className="border px-2 py-1">{player.team}</td>
              <td className="border px-2 py-1">{player.matches}</td>
              <td className="border px-2 py-1">{player.scoring.goals}</td>
              <td className="border px-2 py-1">{player.scoring.onePt}</td>
              <td className="border px-2 py-1">{player.scoring.twoPt}</td>
              <td className="border px-2 py-1">{player.scoring.totalPoints}</td>
              <td className="border px-2 py-1">{player.shooting.attempts}</td>
              <td className="border px-2 py-1">{player.shooting.scores}</td>
              <td className="border px-2 py-1">{player.shooting.accuracy}%</td>
              <td className="border px-2 py-1">{player.creation.assists}</td>
              <td className="border px-2 py-1">{player.creation.secondaryAssists}</td>
              <td className="border px-2 py-1">{player.possession.turnoversWon}</td>
              <td className="border px-2 py-1">{player.possession.turnoversConceded}</td>
              <td className="border px-2 py-1">{player.possession.foulsWon}</td>
              <td className="border px-2 py-1">{player.possession.foulsCommitted}</td>
              <td className="border px-2 py-1">{player.minutesPlayed.total}</td>
              <td className="border px-2 py-1">{player.minutesPlayed.avgPerMatch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerAnalyticsTable;
