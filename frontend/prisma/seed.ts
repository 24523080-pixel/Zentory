import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

config({ path: '.env.local' })
config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log('🌱 Seeding database...')

  // ── Users ──────────────────────────────────────────────────────
  const users = [
    { email: 'manager@zentory.id', name: 'Budi Santoso', role: 'manager' as const, password: 'manager123' },
    { email: 'admin@zentory.id',   name: 'Sinta Dewi',   role: 'admin'   as const, password: 'admin123'   },
    { email: 'kasir@zentory.id',   name: 'Eko Prasetyo', role: 'kasir'   as const, password: 'kasir123'   },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email:        u.email,
        name:         u.name,
        role:         u.role,
        passwordHash: await bcrypt.hash(u.password, 12),
      },
    })
  }
  console.log('✅ Users created')

  // ── Products ───────────────────────────────────────────────────
  const products = [
    { sku: 'KPI-001', name: 'Kopi Arabica',        kategori: 'Minuman', hargaBeli: 45000,  hargaJual: 65000,  stok: 80,  rop: 20, klasifikasi: 'Fast'  as const },
    { sku: 'THJ-002', name: 'Teh Hijau Organik',   kategori: 'Minuman', hargaBeli: 30000,  hargaJual: 45000,  stok: 120, rop: 40, klasifikasi: 'Fast'  as const },
    { sku: 'GLA-003', name: 'Gula Aren Premium',   kategori: 'Sembako', hargaBeli: 25000,  hargaJual: 35000,  stok: 45,  rop: 30, klasifikasi: 'Slow'  as const },
    { sku: 'BRS-004', name: 'Beras Organik 5kg',   kategori: 'Sembako', hargaBeli: 95000,  hargaJual: 125000, stok: 60,  rop: 20, klasifikasi: 'Fast'  as const },
    { sku: 'MNY-005', name: 'Minyak Kelapa Virgin', kategori: 'Sembako', hargaBeli: 55000,  hargaJual: 75000,  stok: 35,  rop: 15, klasifikasi: 'Slow'  as const },
    { sku: 'SNK-006', name: 'Keripik Singkong',    kategori: 'Snack',   hargaBeli: 15000,  hargaJual: 22000,  stok: 200, rop: 60, klasifikasi: 'Fast'  as const },
    { sku: 'CKL-007', name: 'Cokelat 70% Kakao',  kategori: 'Snack',   hargaBeli: 35000,  hargaJual: 50000,  stok: 75,  rop: 25, klasifikasi: 'Fast'  as const },
    { sku: 'JMU-008', name: 'Jamu Jahe Merah',     kategori: 'Herbal',  hargaBeli: 20000,  hargaJual: 30000,  stok: 90,  rop: 30, klasifikasi: 'Slow'  as const },
    { sku: 'KLT-009', name: 'Kulit Manis Ceylon',  kategori: 'Herbal',  hargaBeli: 40000,  hargaJual: 58000,  stok: 18,  rop: 20, klasifikasi: 'Dead'  as const },
    { sku: 'MDS-010', name: 'Madu Sumbawa 500ml',  kategori: 'Herbal',  hargaBeli: 80000,  hargaJual: 115000, stok: 40,  rop: 15, klasifikasi: 'Slow'  as const },
    { sku: 'SAB-011', name: 'Sabun Lidah Buaya',   kategori: 'Kecantikan', hargaBeli: 22000, hargaJual: 35000, stok: 55, rop: 25, klasifikasi: 'Slow' as const },
    { sku: 'VMN-012', name: 'Vitamin C 1000mg',    kategori: 'Kesehatan', hargaBeli: 50000, hargaJual: 75000,  stok: 30,  rop: 20, klasifikasi: 'Fast'  as const },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where:  { sku: p.sku },
      update: {},
      create: p,
    })
  }
  console.log('✅ Products created')

  console.log('🎉 Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
