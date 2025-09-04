import React from "react"
import { cn } from "@/lib/utils"

export function MiniPitch({ code, mode, value, onChange, className}) {
  const ref = React.useRef(null)

  const handleClick = (e) => {
    if (mode !== "select" || !ref.current || !onChange) return
    const rect = ref.current.getBoundingClientRect()
    let x = ((e.clientX - rect.left) / rect.width) * 100
    let y = ((e.clientY - rect.top) / rect.height) * 100

    onChange({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-md border bg-emerald-50", // Primary brand color accent via lines; neutrals otherwise
        className,
      )}
      style={{ aspectRatio: "5 / 3" }}
      onClick={handleClick}
      aria-readonly={mode === "view" ? true : undefined}
    >
      {/* Field base */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-emerald-50" />
      {/* Lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Outer boundary */}
        <rect x="1" y="1" width="98" height="58" fill="none" stroke="#065f46" strokeWidth="0.5" />
        {/* Center line */}
        <line x1="50" y1="1" x2="50" y2="59" stroke="#065f46" strokeWidth="0.4" strokeDasharray="2 2" />
        {/* L/C/R light lanes */}
        <line x1="33.3" y1="1" x2="33.3" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
        <line x1="66.6" y1="1" x2="66.6" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
        {/* lines for both ends  */}
        <line x1="13" y1="1" x2="13" y2="59 " stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
        <line x1="20" y1="1" x2="20" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
        <line x1="87" y1="1" x2="87" y2="59 " stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
        <line x1="80" y1="1" x2="80" y2="59" stroke="#10b981" strokeWidth="0.2" opacity="0.4" />
        {/* goal post  */}
        <rect x="1" y="22" width="12" height="15" fill="none" stroke="#065f46" strokeWidth="0.3" opacity="0.6"
        />
        <rect x="87" y="22" width="12" height="15" fill="none" stroke="#065f46" strokeWidth="0.3" opacity="0.6"
        />
        {/* Code-specific arcs */}

        {/* 20m and 40m arcs approximated */}
        {/* <circle cx="10" cy="30" r="8" fill="none" stroke="#10b981" strokeWidth="0.3" opacity="0.6" /> */}
        <path
          d="M 20 22 A 10 9 0 0 1 20 38"
          fill="none"
          stroke="#065f46"
          strokeWidth="0.3"
          opacity="0.6"
        />
        <path
          d="M 20 15 A 8 10 0 0 1 20 45"
          fill="none"
          stroke="#065f46"
          strokeWidth="0.3"
          opacity="0.6"
        />

        <path
          d="M 80 22 A 7 8 0 1 0 80 38"
          fill="none"
          stroke="#065f46"
          strokeWidth="0.3"
          opacity="0.6"
        />
        <path
          d="M 80 15 A 8 10 0 1 0 80 45"
          fill="none"
          stroke="#065f46"
          strokeWidth="0.3"
          opacity="0.6"
        />
      </svg>

      {/* Selection crosshair */}
      {(Array.isArray(value) ? value : value ? [value] : []).map((v, index) => (
        <div
          key={index} // use index if coordinates are not unique
          className="absolute pointer-events-none"
          style={{
            left: `${v.x}%`,
            top: `${v.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="h-4 w-4 rounded-full border-2 border-emerald-600 bg-white" />
        </div>
      ))}

      {/* Disabled overlay for view mode */}
      {mode === "view" && <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />}
    </div>
  )
}
