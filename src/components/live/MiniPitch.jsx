// import React, { useEffect } from "react"
// import { cn } from "@/lib/utils"

// // export function MiniPitch({ code, mode, value, onChange, className}) {
// export function MiniPitch({ code, mode, value, onChange, className, isFullScreen = false }) {

//   const ref = React.useRef(null)

//   useEffect(() => {
//     console.log("val", value)
//   }, [value])


//   const handleClick = (e) => {
//     if (mode !== "select" || !ref.current || !onChange) return
//     const rect = ref.current.getBoundingClientRect()
//     let x = ((e.clientX - rect.left) / rect.width) * 100
//     let y = ((e.clientY - rect.top) / rect.height) * 100

//     onChange({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
//   }

//   return (
//     <div
//       ref={ref}
//       className={cn(
//         "relative w-full overflow-hidden rounded-md border bg-emerald-50",
//         className,
//       )}
//       style={{ aspectRatio: "5 / 3", width: "100%" }}

//       onClick={handleClick}
//       aria-readonly={mode === "view" ? true : undefined}
//     >
//       {/* Field base */}
//       <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-emerald-50" />
//       {/* Lines */}
//       <svg
//         className="absolute inset-0 h-full w-full"
//         viewBox="0 0 100 60"
//         preserveAspectRatio="none"
//         aria-hidden="true"
//       >
//         {/* Outer boundary */}
//         <rect x="1" y="1" width="98" height="58" fill="none" stroke="#065f46" strokeWidth="0.5" />
//         {/* Center line */}
//         <line x1="50" y1="1" x2="50" y2="59" stroke="#065f46" strokeWidth="0.4" strokeDasharray="2 2" />
//         {/* L/C/R light lanes */}
//         <line x1="33.3" y1="1" x2="33.3" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
//         <line x1="66.6" y1="1" x2="66.6" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
//         {/* lines for both ends  */}
//         <line x1="13" y1="1" x2="13" y2="59 " stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
//         <line x1="20" y1="1" x2="20" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
//         <line x1="87" y1="1" x2="87" y2="59 " stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
//         <line x1="80" y1="1" x2="80" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
//         {/* lines  */}
//         <rect x="1" y="22" width="12" height="15" fill="none" stroke="#10b981" strokeWidth="0.2" opacity="0.4"
//         />
//         <rect x="87" y="22" width="12" height="15" fill="none" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />

//         {/* Code-specific arcs */}

//         {/* 20m and 40m arcs approximated */}
//         {/* <circle cx="10" cy="30" r="8" fill="none" stroke="#10b981" strokeWidth="0.3" opacity="0.6" /> */}
//         <path
//           d="M 20 22 A 10 9 0 0 1 20 38"
//           fill="none"
//           stroke="#065f46"
//           strokeWidth="0.3"
//           opacity="0.6"
//         />
//         <path
//           d="M 20 15 A 8 10 0 0 1 20 45"
//           fill="none"
//           stroke="#065f46"
//           strokeWidth="0.3"
//           opacity="0.6"
//         />

//         <path
//           d="M 80 22 A 7 8 0 1 0 80 38"
//           fill="none"
//           stroke="#065f46"
//           strokeWidth="0.3"
//           opacity="0.6"
//         />
//         <path
//           d="M 80 15 A 8 10 0 1 0 80 45"
//           fill="none"
//           stroke="#065f46"
//           strokeWidth="0.3"
//           opacity="0.6"
//         />
//       </svg>

//       {/* Selection crosshair */}
//       {/* {(Array.isArray(value) ? value : value ? [value] : []).map((v, index) => (
//         v!=null &&<div
//           key={index} // use index if coordinates are not unique
//           className="absolute pointer-events-none"
//           style={{
//             left: `${v.x}%`,
//             top: `${v.y}%`,
//             transform: "translate(-50%, -50%)",
//           }}
//         >
//           <div className="h-4 w-4 rounded-full border-2 border-emerald-600 bg-white" />
//         </div>
//       ))} */}

//       {(Array.isArray(value) ? value : value ? [value] : []).map((v, index) => (
//         v != null && (
//           <div
//             key={index}
//             className="absolute"
//             style={{
//               left: `${v.x}%`,
//               top: `${v.y}%`,
//               transform: "translate(-50%, -50%)",
//               cursor: "pointer",
//             }}
//           >
//             {/* Small visible circle */}
//             <div
//               className="rounded-full border border-emerald-700 bg-white"
//               style={{
//                 width: isFullScreen ? "11px" : "5px",
//                 height: isFullScreen ? "11px" : "5px",
//                 boxShadow: "0 0 2px rgba(0,0,0,0.3)",
//               }}
//             />

//             {/* Larger invisible tap area (easy selection) */}
//             <div
//               className="absolute"
//               style={{
//                 width: "12px",
//                 height: "12px",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 backgroundColor: "transparent",
//               }}
//               onClick={() => onChange && onChange(v)}
//             />
//           </div>
//         )
//       ))}

//       {/* Disabled overlay for view mode */}
//       {mode === "view" && <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />}
//     </div>
//   )
// }


import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function MiniPitch({ code, mode, value, onChange, className, isFullScreen = false }) {
  const ref = React.useRef(null)

  // --- state for zoom, pan, and fine-aim ---
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [fineAim, setFineAim] = useState(false)

  // reset zoom/pan when entering fullscreen
  useEffect(() => {
    if (isFullScreen) {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
  }, [isFullScreen])

  useEffect(() => {
    console.log("val", value)
  }, [value])

  // ✅ Fixed: handles both zoom + pan correctly
  const handleClick = (e) => {
    if (mode !== "select" || !ref.current || !onChange || isPanning) return

    const rect = ref.current.getBoundingClientRect()

    // click position within the container
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Pitch center (needed for proper zoom correction)
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Reverse pan + zoom transformations
    const adjustedX = (clickX - centerX - offset.x) / zoom + centerX
    const adjustedY = (clickY - centerY - offset.y) / zoom + centerY

    // Convert back to percentage coordinates
    const x = (adjustedX / rect.width) * 100
    const y = (adjustedY / rect.height) * 100

    // Clamp to bounds
    const clampedX = Math.min(100, Math.max(0, x))
    const clampedY = Math.min(100, Math.max(0, y))

    onChange({
      x: Math.round(clampedX * 10) / 10,
      y: Math.round(clampedY * 10) / 10,
    })
  }

  // handle zoom
  const handleWheel = (e) => {
    e.preventDefault()
    setZoom((z) => Math.min(Math.max(z + e.deltaY * -0.001, 1), 3)) // 1x–3x
  }

  // start panning
  const handleMouseDown = (e) => {
    setIsPanning(true)
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  // panning move
  const handleMouseMove = (e) => {
    if (isPanning) {
      setOffset((prev) => ({
        x: prev.x + (e.clientX - startPos.x),
        y: prev.y + (e.clientY - startPos.y),
      }))
      setStartPos({ x: e.clientX, y: e.clientY })
    }

    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setCursor({ x, y })
    }
  }

  const handleMouseUp = () => setIsPanning(false)
  const handleFineAim = () => setFineAim((prev) => !prev)

  // scale marker based on zoom level
  const markerSize = Math.max(10 / zoom, 5)

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-md border border-emerald-600 bg-emerald-50 touch-none select-none transition-all",
        isFullScreen
          ? "w-full h-full max-h-[85vh] max-w-[90vw]"
          : "w-full max-w-[520px] h-[280px] mx-auto",
        className
      )}
      onClick={handleClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleFineAim}
    >
      {/* zoom + pan wrapper */}
      <div
        className="absolute inset-0 transition-transform duration-75"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          cursor: isPanning ? "grabbing" : "grab",
        }}
      >
        {/* pitch background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-emerald-100 shadow-inner rounded-md" />

        {/* pitch lines */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 60"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* outer boundary */}
          <rect x="1" y="1" width="98" height="58" fill="none" stroke="#065f46" strokeWidth="0.5" />
          {/* center line */}
          <line x1="50" y1="1" x2="50" y2="59" stroke="#065f46" strokeWidth="0.4" strokeDasharray="2 2" />
          {/* L/C/R lanes */}
          <line x1="33.3" y1="1" x2="33.3" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          <line x1="66.6" y1="1" x2="66.6" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          {/* goal lines */}
          <line x1="13" y1="1" x2="13" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          <line x1="20" y1="1" x2="20" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          <line x1="80" y1="1" x2="80" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          <line x1="87" y1="1" x2="87" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          {/* boxes */}
          <rect x="1" y="22" width="12" height="15" fill="none" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          <rect x="87" y="22" width="12" height="15" fill="none" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
          {/* arcs */}
          <path d="M 20 22 A 10 9 0 0 1 20 38" fill="none" stroke="#065f46" strokeWidth="0.3" opacity="0.6" />
          <path d="M 20 15 A 8 10 0 0 1 20 45" fill="none" stroke="#065f46" strokeWidth="0.3" opacity="0.6" />
          <path d="M 80 22 A 7 8 0 1 0 80 38" fill="none" stroke="#065f46" strokeWidth="0.3" opacity="0.6" />
          <path d="M 80 15 A 8 10 0 1 0 80 45" fill="none" stroke="#065f46" strokeWidth="0.3" opacity="0.6" />
        </svg>

        {/* markers */}
        {(Array.isArray(value) ? value : value ? [value] : []).map(
          (v, index) =>
            v != null && (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${v.x}%`,
                  top: `${v.y}%`,
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                }}
              >
                <div
                  className="rounded-full border border-emerald-700 bg-white"
                  style={{
                    width: `${markerSize}px`,
                    height: `${markerSize}px`,
                    boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            )
        )}
      </div>

      {/* fine-aim crosshair */}
      {fineAim && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute bg-gray-500 opacity-50"
            style={{ left: `${cursor.x}%`, top: 0, width: "1px", height: "100%" }}
          />
          <div
            className="absolute bg-gray-500 opacity-50"
            style={{ top: `${cursor.y}%`, left: 0, width: "100%", height: "1px" }}
          />
          <div className="absolute bottom-2 right-2 bg-white/90 p-1 rounded text-xs text-gray-700">
            X: {cursor.x.toFixed(1)} | Y: {cursor.y.toFixed(1)}
          </div>
        </div>
      )}

      {/* readonly mode */}
      {mode === "view" && <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />}
    </div>
  )
}

