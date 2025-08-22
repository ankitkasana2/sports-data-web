import React from 'react'
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import data from '@/data';
import { useRouter } from 'next/router';





const Matches = () => {


  const router = useRouter()



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Matches</h1>
        <Link
          href="/matches/new"
          className="px-5 py-2 rounded-lg bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 transition"
        >
          + New Match
        </Link>
      </div>

      {/* Matches List */}
      <div className='p-4 flex justify-center items-center w-full'>
        <Table className=' bg-white rounded-lg p-3'>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Id</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Score</TableHead>
              <TableHead >Venue</TableHead>
              <TableHead >Game Code</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.matchData.map((match) => (
              <TableRow key={match.id} className='hover:cursor-pointer' onClick={()=>{router.push(`/matches/${match.id}`)}}>
                <TableCell className="font-medium">{match.id}</TableCell>
                <TableCell>{match.TeamAName} <span className='font-extrabold'>Vs</span> {match.TeamBName}</TableCell>
                <TableCell>{match.score}</TableCell>
                <TableCell>{match.venue}</TableCell>
                <TableCell>{match.game_code}</TableCell>
                <TableCell className="text-right">{match.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Matches