type Props = {
  percentage: number;
  size?: number;
};

export default function CircularGauge({ percentage, size = 80 }: Props) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;

  const color =
    percentage >= 70 ? "#4ade80" : percentage >= 40 ? "#facc15" : "#f97316";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute text-sm font-bold text-white"
        style={{ color }}
      >
        {Math.round(percentage)}%
      </span>
    </div>
  );
}
