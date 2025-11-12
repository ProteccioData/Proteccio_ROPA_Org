import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * Perfectly centered + calibrated Risk Speedometer Gauge (0–25 scale)
 * Needle aligns exactly to arc start/end points
 */
export default function RiskGauge({ value = 12, size = 240 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const needleValue = useMotionValue(0);

  // Animate needle and display value
  useEffect(() => {
    const controls = animate(needleValue, value, {
      type: "spring",
      stiffness: 90,
      damping: 20,
      duration: 1,
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return controls.stop;
  }, [value]);

  // Calibrated rotation: 0 → -100°, 25 → +100°
  const rotation = useTransform(needleValue, [0, 25], [-90, 90]);

  // Dynamic risk color zones
  const getColor = (v) => {
    if (v <= 5) return "#10B981"; // Low
    if (v <= 10) return "#FACC15"; // Medium
    if (v <= 15) return "#FB923C"; // High
    if (v <= 20) return "#F97316"; // Very High
    return "#EF4444"; // Critical
  };
  const color = getColor(displayValue);

  // Arc geometry
  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (displayValue / 25) * circumference;

  return (
    <div
      className="flex flex-col items-center justify-center select-none"
      style={{
        width: size,
        height: typeof size === "number" ? size * 0.65 : "auto",
      }}
    >
      <svg
        viewBox="0 0 240 140"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(120,120)">
          {/* clip path to keep needle inside gauge */}
          <defs>
            <clipPath id="gaugeClip">
              <path d="M-80 0 A80 80 0 0 1 80 0 L0 0 Z" />
            </clipPath>

            {/* shadow gradient */}
            <filter id="shadow" x="-200%" y="-200%" width="400%" height="400%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#00000040" />
            </filter>
          </defs>

          {/* background arc */}
          <path
            d="M-80 0 A80 80 0 0 1 80 0"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* active arc */}
          <motion.path
            d="M-80 0 A80 80 0 0 1 80 0"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${progress}, ${circumference}`}
            style={{
              transition: "stroke-dasharray 0.8s ease, stroke 0.8s ease",
              filter: "url(#shadow)",
            }}
          />

          {/* tick marks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = (i * 180) / 10 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = 70 * Math.cos(rad);
            const y1 = 70 * Math.sin(rad);
            const x2 = 76 * Math.cos(rad);
            const y2 = 76 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#D1D5DB"
                strokeWidth="2"
              />
            );
          })}

          {/* needle (calibrated pivot) */}
          <motion.g style={{ rotate: rotation }} clipPath="url(#gaugeClip)">
            <line
              x1="0"
              y1="0"
              x2="-60"
              y2="0"
              stroke="#111827"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ filter: "url(#shadow)" }}
            />
            <circle r="6" fill="#111827" />
          </motion.g>
        </g>
      </svg>

      {/* score label */}
      <div className="mt-3 flex flex-col items-center">
        <motion.span
          key={displayValue}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-extrabold text-gray-900 dark:text-white"
        >
          {displayValue}
          <span className="text-base font-medium text-gray-500 dark:text-gray-400">
            /25
          </span>
        </motion.span>
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Risk Score
        </span>
      </div>
    </div>
  );
}
