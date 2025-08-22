import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import data from "@/data";


export default function MatchDetails() {
  const router = useRouter();
  const { matchId } = router.query;

  const [match, setMatch] = useState(null);

  // Fetch match by ID (dummy fetch for now)
  // useEffect(() => {
  //   if (matchId) {
  //     fetch(`/api/matches/${matchId}`)
  //       .then((res) => res.json())
  //       .then((data) => setMatch(data))
  //       .catch((err) => console.error("Error fetching match:", err));
  //   }
  // }, [matchId]);

  useEffect(() => {
    setMatch(data.matchData[0])
  }, [router.query])


  if (!match) {
    return <p className="text-center mt-10">Loading match details...</p>;
  }

  return (
    <div className="bg-gray-100 p-6 flex justify-center flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <h1 className="text-3xl font-extrabold text-gray-900">Match[#{match.id}]</h1>
      </div>
      <div className="p-6 w-[90vw] bg-white mx-auto flex flex-col justify-center items-center rounded-xl">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">
          {match.competition} – {match.round}
        </h1>
        <p className="text-gray-600">
          {match.gameCode} | Season {match.season}
        </p>
        <p className="text-gray-600">
          {match.date} @ {match.time} – {match.venue} ({match.venue_type})
        </p>
        <p className="text-gray-600">Referee: {match.referee}</p>
        <p className="text-gray-600">Weather: {match.weather}</p>
        <p className="text-gray-600">
          Half Length: {match.half_length} mins | Extra Time:{" "}
          {match.extraTimePossible ? "Yes" : "No"}
        </p>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Team A */}
          <div>
            <h2 className="text-xl font-semibold">{match.teamA.name}</h2>
            <ul className="mt-2 space-y-1">
              {match.teamA.lineup.starters.map((player, idx) => (
                <li key={idx} className="text-sm">
                  #{player.jerseyNumber} – {player.name} ({player.position})
                </li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">Bench</h3>
            <ul className="mt-2 space-y-1">
              {match.teamA.lineup.bench.map((player, idx) => (
                <li key={idx} className="text-sm">
                  #{player.jerseyNumber} – {player.name} ({player.position})
                </li>
              ))}
            </ul>
          </div>

          {/* Team B */}
          <div>
            <h2 className="text-xl font-semibold">{match.teamB.name}</h2>
            <ul className="mt-2 space-y-1">
              {match.teamB.lineup.starters.map((player, idx) => (
                <li key={idx} className="text-sm">
                  #{player.jerseyNumber} – {player.name} ({player.position})
                </li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">Bench</h3>
            <ul className="mt-2 space-y-1">
              {match.teamB.lineup.bench.map((player, idx) => (
                <li key={idx} className="text-sm">
                  #{player.jerseyNumber} – {player.name} ({player.position})
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Events Placeholder */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Match Events</h2>
          <p className="text-gray-500">
            (Coming soon: Possession logging, shots, fouls, turnovers, puckouts)
          </p>
        </div>
      </div>

    </div>
  );
}