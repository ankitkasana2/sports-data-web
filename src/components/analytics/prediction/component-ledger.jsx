"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ComponentLedger({ ledger }) {
  const { a, b } = ledger
  const names = Array.from(new Set([...a.map((x) => x.name), ...b.map((x) => x.name)]))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Component ledger (pp100, attempts × % × value)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead className="text-right">Team A</TableHead>
              <TableHead className="text-right">Team B</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {names.map((name) => {
              const rowA = a.find((x) => x.name === name)
              const rowB = b.find((x) => x.name === name)
              return (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell className="text-right">
                    {rowA
                      ? `${rowA.attempts.toFixed(1)} × ${(rowA.conv * 100).toFixed(1)}% × ${rowA.value.toFixed(2)} = ${rowA.pp100.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {rowB
                      ? `${rowB.attempts.toFixed(1)} × ${(rowB.conv * 100).toFixed(1)}% × ${rowB.value.toFixed(2)} = ${rowB.pp100.toFixed(2)}`
                      : "-"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
