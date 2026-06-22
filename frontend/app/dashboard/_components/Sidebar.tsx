'use client'

import { usePathname } from 'next/navigation'
import {
  Boxes, TrendingUp, BarChart2, ShoppingCart, ClipboardCheck,
  Package, PackageCheck, ClipboardList,
  ShoppingBag, RotateCcw,
  Bell, Settings,
} from 'lucide-react'
import { LogoutButton } from './LogoutButton'

type Role = 'manager' | 'admin' | 'kasir'

const NAV_CONFIG: Record<Role, { icon: React.ElementType; label: string; href: string }[]> = {
  manager: [
    { icon: TrendingUp,     label: 'Dashboard',      href: '/dashboard'                  },
    { icon: BarChart2,      label: 'Analitik',        href: '/dashboard/analitik'         },
    { icon: ShoppingCart,   label: 'Purchase Order',  href: '/dashboard/purchase-order'   },
    { icon: ClipboardCheck, label: 'Stock Opname',    href: '/dashboard/stock-opname'     },
    { icon: RotateCcw,      label: 'Sales Return',    href: '/dashboard/sales-return'     },
    { icon: Bell,           label: 'Notifikasi',      href: '/dashboard/notifikasi'       },
    { icon: Settings,       label: 'Pengaturan',      href: '/dashboard/pengaturan'       },
  ],
  admin: [
    { icon: Package,        label: 'Inventaris',        href: '/dashboard/inventaris'         },
    { icon: ShoppingCart,   label: 'Purchase Order',    href: '/dashboard/purchase-order'     },
    { icon: PackageCheck,   label: 'Penerimaan Barang', href: '/dashboard/penerimaan-barang'  },
    { icon: ClipboardList,  label: 'Stock Opname',      href: '/dashboard/stock-opname'       },
    { icon: RotateCcw,      label: 'Sales Return',      href: '/dashboard/sales-return'       },
    { icon: Bell,           label: 'Notifikasi',        href: '/dashboard/notifikasi'         },
  ],
  kasir: [
    { icon: ShoppingBag,    label: 'POS / Transaksi',  href: '/dashboard/pos'               },
    { icon: RotateCcw,      label: 'Sales Return',     href: '/dashboard/sales-return'      },
    { icon: Bell,           label: 'Notifikasi',       href: '/dashboard/notifikasi'        },
  ],
}

const ROLE_LABEL: Record<Role, string> = {
  manager: 'Manager',
  admin:   'Admin Staff',
  kasir:   'Kasir',
}

const ROLE_BADGE: Record<Role, string> = {
  manager: 'bg-primary/10 text-primary',
  admin:   'bg-chart-3/15 text-chart-3',
  kasir:   'bg-chart-4/15 text-chart-4',
}

interface SidebarProps {
  role:     string
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname  = usePathname()
  const safeRole  = role in NAV_CONFIG ? (role as Role) : 'admin'
  const links     = NAV_CONFIG[safeRole]
  const initials  = userName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside className="hidden w-60 flex-col border-r border-border bg-gradient-to-b from-primary/[0.04] via-card to-card lg:flex print:hidden">

      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="size-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">Zentory</span>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-1">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ROLE_BADGE[safeRole]}`}>
          {ROLE_LABEL[safeRole]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ icon: Icon, label, href }) => {
          const active =
            href === '/dashboard'
              ? pathname === href
              : pathname.startsWith(href)
          return (
            <a
              key={href}
              href={href}
              className={
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
                (active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground')
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </a>
          )
        })}
      </nav>

      {/* User chip */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </span>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[safeRole]}</p>
          </div>
          <LogoutButton />
        </div>
      </div>

    </aside>
  )
}
