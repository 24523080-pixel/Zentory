# ZENTORY — Roadmap Pengembangan

> Dokumen perencanaan bertahap dari kondisi sekarang hingga aplikasi selesai sepenuhnya.

---

## Stack Teknologi Target

| Layer | Teknologi | Peran |
|---|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 | UI & routing |
| Hosting | **Vercel** | Deploy otomatis setiap push ke GitHub via CI/CD |
| Repositori | **GitHub** | Version control & kolaborasi |
| Auth | **Supabase Auth** | Login/logout nyata, session berbasis JWT |
| Database | **Supabase PostgreSQL** | Penyimpanan data inventaris real-time |
| BaaS Client | `@supabase/supabase-js` | Query dari frontend langsung ke Supabase |

> Sampai Milestone 5, semua data masih mock (lokal). Migrasi ke Supabase terjadi di Milestone 6.

---

## Status Saat Ini

- [x] Landing page (hero, fitur, FAQ, CTA)
- [x] Halaman Login (split-screen, demo accounts, auth API mock)
- [x] Middleware proteksi rute (`/dashboard` → redirect ke `/login`)
- [x] Dashboard utama (StatCards, SalesChart, RecentActivity, StockTable)
- [x] Layout shared dengan Sidebar (`app/dashboard/layout.tsx`)
- [x] Halaman Inventaris (`/dashboard/inventaris`) — search, filter tab, tabel, pagination

---

## Milestone 1 — Struktur Folder & Refactoring ✅

**Selesai.** Dashboard dipecah menjadi komponen modular di `_components/`:
`Sidebar`, `StatCards`, `SalesChart`, `RecentActivity`, `StockTable`, `LogoutButton`.
Layout bersama dibuat di `app/dashboard/layout.tsx` agar Sidebar otomatis muncul di semua sub-halaman.

**Prompt Siap Pakai** *(jika perlu refactor ulang di masa depan)*:
```
Pecah `app/dashboard/page.tsx` jadi komponen terpisah di folder `_components/`.
Buat: Sidebar.tsx, StatCards.tsx, SalesChart.tsx, RecentActivity.tsx, StockTable.tsx.
Buat juga `app/dashboard/layout.tsx` yang wrap Sidebar + children.
Update `page.tsx` sehingga hanya berisi topbar + import komponen.
Gunakan mock data lokal langsung di setiap file komponen.
Tampilkan diff saja.
```

---

## Milestone 2 — Modul Inventaris & CRUD Barang ✅

**Selesai.** Halaman `/dashboard/inventaris` sudah punya:
- 4 summary cards (Total SKU, Total Stok, Perlu Reorder, Dead Stock)
- Tabel dengan search, filter tab (Semua/Fast/Slow/Dead/Kritis), pagination
- Tombol Tambah Produk, ikon Edit & Hapus per baris (belum fungsional)

**Prompt Siap Pakai** *(untuk menambah modal Tambah/Edit Produk)*:
```
Di `app/dashboard/inventaris/_components/InventarisTable.tsx`, tambahkan modal
popup untuk tambah & edit produk. State modal: `modalOpen` (boolean) dan
`editTarget` (Product | null). Form berisi field: Nama, SKU, Kategori, Stok, ROP.
Saat submit, update state array PRODUCTS lokal (useState, belum ke API).
Tombol "Tambah Produk" di page.tsx cukup trigger buka modal dengan editTarget null.
Tombol Edit di setiap baris trigger modal dengan data produk tersebut.
Gunakan div overlay + card — tanpa library dialog eksternal.
Tampilkan diff saja.
```

---

## Milestone 3 — Fitur Analisis Stok Pintar (Fast/Slow/Dead)

**Rencana:** Implementasi algoritma klasifikasi stok berdasarkan tren penjualan
mingguan. Logika: hitung rata-rata unit terjual per minggu per produk, lalu
klasifikasikan — Fast (≥ threshold tinggi), Slow (di antara), Dead (hampir nol
atau tidak terjual dalam N minggu). Hasil klasifikasi tampil sebagai badge di
tabel inventaris dan dijadikan dasar rekomendasi PO.

**File yang terlibat:**
- `inventaris/_data.ts` — tambahkan field `weeklyUnitsSold: number[]`
- `inventaris/_lib/classify.ts` — fungsi pure `classifyProduct(weeklyUnitsSold)`
- `InventarisTable.tsx` — ganti kolom Klasifikasi hardcoded dengan hasil kalkulasi

**Prompt Siap Pakai:**
```
Buat file `app/dashboard/inventaris/_lib/classify.ts` berisi fungsi:

  export function classifyStock(weeklyUnitsSold: number[]): 'Fast' | 'Slow' | 'Dead'

Logika: rata-rata penjualan ≥ 20/minggu → Fast, 5–19 → Slow, < 5 → Dead.
Tambahkan field `weeklyUnitsSold: number[]` ke type Product di `_data.ts`
dan isi mock datanya (7 angka per produk, bervariasi).
Di `InventarisTable.tsx`, hapus field `klasifikasi` hardcoded dari PRODUCTS
dan ganti dengan pemanggilan `classifyStock(row.weeklyUnitsSold)` saat render.
Tampilkan diff saja.
```

---

## Milestone 4 — Modul Purchase Order & Notifikasi

**Rencana:** Halaman `/dashboard/purchase-order` menampilkan daftar PO yang
sedang berjalan dan produk yang sudah menyentuh ROP (otomatis masuk draft PO).
Fitur: buat PO baru, ubah status (Draft → Dikirim → Diterima), cetak/preview PO.

**File yang akan dibuat:**
- `app/dashboard/purchase-order/_data.ts` — mock data PO + status
- `app/dashboard/purchase-order/page.tsx` — list PO + tombol Buat PO
- `app/dashboard/purchase-order/_components/POTable.tsx` — tabel PO interaktif
- `app/dashboard/purchase-order/_components/POFormModal.tsx` — form buat PO baru
- `app/dashboard/purchase-order/[id]/page.tsx` — detail & preview cetak PO

**Prompt Siap Pakai:**
```
Buat halaman `/dashboard/purchase-order` dengan struktur:
- `_data.ts`: type PurchaseOrder { id, noPO, supplier, tanggal, status, items[] }
  status: 'Draft' | 'Dikirim' | 'Diterima'. Isi 5 mock PO.
- `page.tsx`: topbar + 3 summary cards (Total PO, Menunggu, Diterima bulan ini)
  + import POTable.
- `_components/POTable.tsx` ('use client'): tabel PO dengan kolom No. PO,
  Supplier, Tanggal, Jumlah Item, Status badge, aksi (Lihat detail).
  Tambahkan filter tab status. Tampilkan diff saja.
```

```
Tambahkan halaman detail PO di `purchase-order/[id]/page.tsx`.
Tampilkan: header PO (No. PO, Supplier, Tanggal, Status), tabel item
(Produk, SKU, Qty Order, Harga Satuan, Subtotal), total nilai PO,
dan tombol "Cetak" yang trigger `window.print()`.
Gunakan `@media print` CSS untuk sembunyikan sidebar & topbar saat print.
Tampilkan diff saja.
```

---

## Milestone 5 — Integrasi State Management / Backend Simulation

**Rencana:** Hubungkan semua form dan tabel agar data bersifat dinamis via
Next.js API Routes (mock backend). Gunakan React Context atau Zustand untuk
global state inventaris agar perubahan di satu halaman langsung terlihat di
halaman lain tanpa reload.

**File yang akan dibuat/diubah:**
- `lib/store.ts` — Zustand store untuk `products[]` dan `purchaseOrders[]`
- `app/api/products/route.ts` — GET (list) + POST (tambah)
- `app/api/products/[id]/route.ts` — PATCH (edit) + DELETE
- `app/api/purchase-orders/route.ts` — GET + POST

**Prompt Siap Pakai:**
```
Install zustand: `npm install zustand`.
Buat `lib/store.ts` dengan useInventoryStore yang menyimpan:
  products: Product[]  (import dari inventaris/_data.ts sebagai initial state)
  addProduct, updateProduct, deleteProduct
Buat `lib/po-store.ts` dengan usePOStore:
  orders: PurchaseOrder[]
  addOrder, updateOrderStatus
Di `InventarisTable.tsx`, ganti PRODUCTS konstanta dengan
`const products = useInventoryStore(s => s.products)`.
Di modal tambah/edit, panggil addProduct / updateProduct dari store.
Tampilkan diff saja.
```

```
Buat Next.js API routes untuk inventaris:
- GET  /api/products        → return semua produk dari store (in-memory)
- POST /api/products        → tambah produk baru, return produk + id baru
- PATCH /api/products/[id]  → update produk, return produk terupdate
- DELETE /api/products/[id] → hapus produk, return { ok: true }
Gunakan modul-level `let products = [...MOCK_PRODUCTS]` sebagai in-memory DB.
Tampilkan diff saja.
```

---

## Milestone 6 — Deployment & Database Integration (GitHub + Vercel + Supabase)

**Rencana:** Migrasikan seluruh mock data ke Supabase PostgreSQL, ganti auth
cookie buatan sendiri dengan Supabase Auth, dan deploy ke Vercel dengan CI/CD
otomatis dari GitHub.

### 6a — Setup Repositori & Vercel

**Prompt Siap Pakai:**
```
Buat `.gitignore` di root project yang mengecualikan:
  .env.local, .env*.local, node_modules/, .next/, .vercel/
Pastikan tidak ada file .env yang ikut ke GitHub.
Tampilkan isi .gitignore yang perlu ditambahkan saja.
```

### 6b — Variabel Lingkungan Supabase

**Prompt Siap Pakai:**
```
Buat file `.env.local` di folder `frontend/` (JANGAN commit file ini).
Isi yang dibutuhkan:
  NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
Buat juga `lib/supabase.ts`:
  import { createClient } from '@supabase/supabase-js'
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
Pastikan kedua env var tersebut juga dimasukkan ke Vercel Dashboard →
Project Settings → Environment Variables (Production + Preview + Development).
Tampilkan diff file yang perlu dibuat/diubah saja.
```

### 6c — Migrasi Mock Data ke Supabase

**Prompt Siap Pakai:**
```
Buat skema tabel Supabase (SQL) untuk:
  products(id uuid, name text, sku text, kategori text,
           stok int, rop int, klasifikasi text, created_at timestamptz)
  purchase_orders(id uuid, no_po text, supplier text,
                  tanggal date, status text, created_at timestamptz)
  po_items(id uuid, order_id uuid references purchase_orders,
           product_id uuid references products, qty int, harga int)
Lalu ubah `app/api/products/route.ts`:
- Hapus in-memory array
- Ganti GET handler dengan `supabase.from('products').select('*')`
- Ganti POST handler dengan `supabase.from('products').insert(body).select().single()`
Tampilkan diff saja.
```

### 6d — Migrasi Auth ke Supabase Auth

**Prompt Siap Paiku:**
```
Install: `npm install @supabase/supabase-js @supabase/ssr`.
Ganti `/api/auth/login/route.ts`:
  - Hapus MOCK_USERS
  - Gunakan `supabase.auth.signInWithPassword({ email, password })`
  - Jika berhasil, set cookie session via `@supabase/ssr` createServerClient
Ganti `/api/auth/logout/route.ts`:
  - Gunakan `supabase.auth.signOut()`
Ganti `middleware.ts`:
  - Gunakan `createServerClient` dari `@supabase/ssr` untuk cek session
  - Hapus pengecekan cookie `zentory-token` manual
Tampilkan diff saja.
```

---

## Urutan Eksekusi yang Disarankan

```
M1 ✅ → M2 ✅ → M3 → M4 → M5 → M6
              ↑ di sini sekarang
```

| Milestone | Estimasi | Dependensi |
|---|---|---|
| M3 — Analisis Stok | 1 sesi | M2 ✅ |
| M4 — Purchase Order | 2 sesi | M3 |
| M5 — State Management | 1 sesi | M4 |
| M6 — Deployment + Supabase | 1 sesi | M5 + akun Supabase & Vercel |

---

*Dokumen ini diperbarui seiring progress pengerjaan.*
