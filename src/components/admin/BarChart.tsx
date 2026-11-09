interface BarChartProps {
  title: string
  data: { label: string; value: number }[]
}

const palette = [
  'bg-solar-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-pink-500',
]

export function BarChart({ title, data }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-5 shadow-sm dark:border-ink-800 dark:bg-ink-900">
      <h3 className="mb-4 text-sm font-semibold text-ink-900 dark:text-white">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-ink-400">Sin datos</p>
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={d.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-ink-600 dark:text-ink-300">{d.label}</span>
                <span className="font-semibold text-ink-900 dark:text-white">{d.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                <div
                  className={`h-full rounded-full ${palette[i % palette.length]}`}
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
