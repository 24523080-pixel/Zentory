import type { LucideIcon } from 'lucide-react'

type Variant = 'blue' | 'green' | 'orange' | 'red' | 'muted'

const V: Record<Variant, { from: string; text: string; blob: string; border: string }> = {
  blue:   { from: 'from-primary/[0.12]',      text: 'text-primary',          blob: 'bg-primary/20',      border: 'border-primary/15'      },
  green:  { from: 'from-chart-3/[0.12]',      text: 'text-chart-3',          blob: 'bg-chart-3/20',      border: 'border-chart-3/15'      },
  orange: { from: 'from-chart-4/[0.12]',      text: 'text-chart-4',          blob: 'bg-chart-4/20',      border: 'border-chart-4/15'      },
  red:    { from: 'from-destructive/[0.12]',  text: 'text-destructive',      blob: 'bg-destructive/20',  border: 'border-destructive/15'  },
  muted:  { from: 'from-muted/60',            text: 'text-muted-foreground', blob: 'bg-muted',           border: 'border-border'          },
}

interface Props {
  icon:        LucideIcon
  label:       string
  title:       string
  description: string
  variant?:    Variant
  children?:   React.ReactNode
}

export function PageBanner({ icon: Icon, label, title, description, variant = 'blue', children }: Props) {
  const v = V[variant]
  return (
    <div className={`relative overflow-hidden rounded-xl border ${v.border} bg-gradient-to-br ${v.from} to-card px-6 py-5 shadow-xs`}>
      {/* large faded background icon */}
      <Icon
        aria-hidden="true"
        className={`pointer-events-none absolute -right-3 -top-3 size-28 ${v.text} opacity-[0.07] select-none`}
      />
      {/* soft glow blob */}
      <div aria-hidden="true" className={`pointer-events-none absolute right-10 top-3 size-24 rounded-full ${v.blob} opacity-40 blur-2xl`} />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className={`mb-1 text-[11px] font-semibold uppercase tracking-widest ${v.text} opacity-70`}>
            {label}
          </p>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {children && (
          <div className="shrink-0">{children}</div>
        )}
      </div>
    </div>
  )
}
