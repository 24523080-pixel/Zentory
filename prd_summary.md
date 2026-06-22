# PRD Summary — Zentory v1.0

> Sumber: `7-24523080-UTS-PRD.pdf` (v0.3, 29 Mei 2026)
> File ini adalah acuan utama pengerjaan fitur Zentory.

---

## 1. Tujuan Proyek

**Zentory** adalah sistem manajemen inventori berbasis web yang dirancang untuk toko ritel/SMB skala kecil-menengah di Indonesia. Proyek ini menjawab masalah utama: lebih dari 65% toko SMB Indonesia masih mengelola stok secara manual, menyebabkan stockout barang laris, penumpukan dead stock, dan data inventori yang tidak akurat.

**Tiga business objective inti:**

| # | Objective | Target (3 bulan) |
|---|-----------|-----------------|
| 1 | Kurangi insiden stockout produk fast-moving | Penurunan kasus habis stok |
| 2 | Visibilitas stok real-time di semua produk | Akses data stok instan tanpa input manual |
| 3 | Kurangi kesalahan pencatatan inventaris harian | Akurasi sistem vs fisik ≥ 95% |

**Success metrics terukur:**
- Akurasi stok sistem vs fisik: dari 70% → ≥ 95%
- Frekuensi stockout: dari 8–12 kasus/bulan → ≤ 5 kasus/bulan
- Waktu update inventaris per transaksi: dari 5–7 menit → ≤ 1–2 menit

---

## 2. Arsitektur yang Diinginkan

PRD tidak menyebut stack teknologi secara eksplisit, namun mendefinisikan constraint arsitektur berikut:

### Constraint Teknis
- **Web-based** — diakses via browser modern (Chrome/Edge/Firefox), bukan aplikasi desktop
- **Responsive** — wajib berjalan di layar minimal 360px (smartphone/tablet) dan standar laptop/PC
- **Real-time** — perubahan stok harus langsung terrefleksi setelah transaksi POS atau penerimaan barang selesai
- **Offline-resilient** — saat koneksi terputus, sistem menyimpan data transaksi secara lokal (cache) dan sinkronisasi otomatis saat online kembali
- **Role-based Access Control (RBAC)** — 4 peran dengan hak akses berbeda: Admin Staff, Kasir, Manager, Supplier

### Entitas Data Utama

| Entity | Key Attributes | Relasi |
|--------|---------------|--------|
| `Product` | product_id (PK), SKU (Unique), Name, Category, Unit_Price, Reorder_Point | → Stock_Adjustment (1:M), → PO_Item (1:M) |
| `Purchase Order (PO)` | po_id (PK), supplier_id (FK), Total_Amount, Status (Draft/Approved/Received) | → PO_Item (1:M), → Manager (M:1) |
| `Stock_Adjustment` | adjustment_id (PK), product_id (FK), Variance_Qty, Reason, manager_id (FK) | → Product (M:1), → Manager (M:1) |

### Non-Functional Requirements
- **NFR-001 Performance** — Dashboard stok load < 2 detik untuk 95% request (diverifikasi k6 load test, simulasi 500 concurrent users)
- **NFR-002 Security** — Penyesuaian stok > 10% nilai inventaris wajib 2FA dari Manager
- **NFR-003 Availability** — Uptime 99.5%/bulan; maintenance window: 22:00–04:00 WIB

---

## 3. Fitur Utama (Scope MVP)

### IN Scope (Must Build)

| Fitur | Deskripsi | MoSCoW |
|-------|-----------|--------|
| **Pemantauan Stok Otomatis** | Monitor level stok real-time, deteksi reorder point otomatis | M |
| **Manajemen Pengadaan (PO)** | Generate draf PO otomatis saat stok < reorder point, approval Manager, validasi barang masuk via barcode scan | M |
| **Integrasi POS** | Pengurangan stok otomatis real-time setelah transaksi pembayaran selesai | M |
| **Analisis & Klasifikasi Stok** | Dashboard laporan Fast-Moving / Slow-Moving / Dead Stock | S |
| **Kontrol & Penyesuaian Stok (Cycle Counting)** | Stock opname berkala, freeze area saat penghitungan, persetujuan adjustment oleh Manager | M |

### OUT of Scope (v1 — Jangan dibangun)
- Multi-gudang / multi-lokasi
- Integrasi akuntansi eksternal (SAP, Xero)
- Sistem loyalitas pelanggan (poin, kupon)
- Manajemen penggajian / HR
- Prediksi AI / machine learning berbasis faktor eksternal

---

## 4. Functional Requirements per Aktor

### Admin Staff
| FR ID | Fungsi | Priority |
|-------|--------|----------|
| FR-01 | System generate draf PO otomatis saat stok mencapai Reorder Point | High (M) |
| FR-03 | Validasi barang masuk dengan scan barcode | High (M) |
| FR-07 | Catat selisih stok (variance) fisik vs sistem setelah stock opname | Medium (M) |
| FR-11 | Riwayat penerimaan barang beserta detail PO terkait | Medium (S) |
| FR-12 | Notifikasi ke Admin saat Manager approve draf PO | High (M) |
| FR-06 | Freeze data stok saat cycle counting dimulai | Medium (S) |

### Kasir
| FR ID | Fungsi | Priority |
|-------|--------|----------|
| FR-05 | Kurangi stok otomatis setelah transaksi POS selesai | High (M) |
| FR-08 | Tampilkan warning "Stok Tidak Tersedia" jika stok habis | High (M) |
| FR-02 | Catat retur penjualan, pindahkan barang ke stok karantina | Medium (S) |
| FR-13 | Update status stok otomatis setelah retur divalidasi Manager | High (M) |

### Manager/Owner
| FR ID | Fungsi | Priority |
|-------|--------|----------|
| FR-14 | Approve/reject draf PO dari dashboard | High (M) |
| FR-09 | Otorisasi penyesuaian stok (Stock Adjustment) | High (M) |
| FR-10 | Dashboard visualisasi tren stok dan penjualan | High (M) |
| FR-04 | Klasifikasi produk: Fast / Slow / Dead Stock | Medium (S) |

---

## 5. Ekspektasi Integrasi Frontend ↔ Backend

### Alur Integrasi Kritis

**1. POS → Stok (FR-05, FR-08)**
- Frontend (Kasir): scan barcode → request ke backend untuk cek ketersediaan stok
- Backend: validasi stok tersedia → selesaikan transaksi → kurangi stok di DB secara atomik
- Frontend: terima konfirmasi → tampilkan struk; jika stok habis → tampilkan warning dan blokir transaksi
- Trigger tambahan: jika stok turun ke reorder point → backend otomatis buat draf PO

**2. Procurement / PO (FR-01, FR-03, FR-12, FR-14)**
- Backend: monitor stok berkala → buat draf PO otomatis → kirim notifikasi ke Manager
- Frontend (Manager): review & approve/reject draf PO di dashboard
- Backend: kirim PO ke Supplier secara digital setelah approved → notifikasi ke Admin Staff (FR-12)
- Frontend (Admin): scan barcode barang masuk → backend validasi vs nomor PO → update stok ke "Available"

**3. Cycle Counting / Stock Adjustment (FR-06, FR-07, FR-09)**
- Frontend (Admin): pilih lokasi rak → request freeze ke backend
- Backend: freeze area stok (blokir transaksi kasir untuk barang di area tersebut)
- Frontend (Admin): input hitungan fisik → backend hitung variance
- Frontend (Manager): review laporan variance → approve/reject adjustment
- Backend: update stok jika approved + catat riwayat di audit log → unfreeze area

**4. Sales Return (FR-02, FR-13)**
- Frontend (Kasir): cari nomor transaksi → pilih item retur → input alasan
- Backend: pindahkan status item ke "Stok Karantina" (bukan stok aktif)
- Frontend (Admin): inspeksi fisik → kirim approval ke Manager
- Frontend (Manager): putuskan kembalikan ke stok aktif atau hapus dari sistem
- Backend: update stok sesuai keputusan Manager (FR-13)

**5. DSS Dashboard (FR-04, FR-10)**
- Backend: hitung klasifikasi Fast/Slow/Dead Stock berdasarkan historis penjualan
- Frontend (Manager): dashboard visualisasi tren stok + rekomendasi tindakan
- Catatan: produk < 1 bulan tidak dilabeli Dead Stock (tampilkan "Insufficient Data for Analysis")

### Design Constraints untuk Frontend
- **DC-01**: Semua alur fungsional berjalan penuh di layar ≥ 360px
- **DC-02**: Elemen interaktif modul POS min 44×44px (touch target)
- **DC-03**: Setiap scan barcode (FR-03, FR-05) harus punya fallback input manual SKU

### Keamanan yang Harus Diterapkan
- RBAC ketat: endpoint disesuaikan dengan role (Kasir tidak bisa akses approval PO, dst.)
- Stock adjustment > 10% nilai inventaris → wajib 2FA dari Manager (NFR-002)
- Penyesuaian stok hanya bisa dilakukan dengan otorisasi Manager

---

## 6. Workflow Utama (Ringkasan)

| Workflow | Aktor | FR Terkait |
|----------|-------|-----------|
| Pengadaan Barang (Procurement) | Admin Gudang + Manager | FR-01, FR-03, FR-11, FR-12, FR-14 |
| Transaksi Penjualan & Pengurangan Stok (POS) | Kasir | FR-05, FR-08 |
| Pengendalian & Penyesuaian Stok (Cycle Counting) | Admin Gudang + Manager | FR-06, FR-07, FR-09 |
| Retur Penjualan | Kasir + Manager | FR-02, FR-13 |
| Pengambilan Keputusan Strategis (DSS) | Manager/Owner | FR-04, FR-10, FR-14 |

---

## 7. Milestone Proyek

| Milestone | Week | Kriteria |
|-----------|------|----------|
| PRD Final Approval | 2 | PRD disetujui Vision Team & Stakeholder |
| Backend API Complete | 8 | Semua endpoint FR-01 s/d FR-14 lulus unit test |
| UAT Begins | 12 | Sistem stabil di staging, diuji ≥ 3 staf retail |
| Go-Live | 14 | Infrastruktur produksi siap + backup otomatis aktif |

---

## 8. Definition of Done (DoD)

1. Seluruh FR berlabel **Must Have (M)** lulus pengujian otomatis
2. NFR-01 tervalidasi di staging dengan simulasi 500 concurrent users
3. Tidak ada bug Critical/High yang masih terbuka
4. Panduan penggunaan dalam Bahasa Indonesia tersedia untuk Kasir dan Admin Gudang
