import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'manager') return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const { productId, name, sku, klasifikasi, stok, rop, hargaBeli, hargaJual } = await req.json()

  const window30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const agg = await prisma.transactionItem.aggregate({
    where: { productId, transaction: { tanggal: { gte: window30 } } },
    _sum: { qty: true },
  })
  const totalSold30 = agg._sum.qty ?? 0
  const avgDaily    = (totalSold30 / 30).toFixed(1)
  const nilaiStok   = stok * hargaBeli
  const marginPct   = hargaJual > 0 ? Math.round(((hargaJual - hargaBeli) / hargaJual) * 100) : 0

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = `Kamu adalah konsultan manajemen inventori toko ritel.

Berikan rekomendasi tindakan spesifik untuk produk berikut dalam 2-3 kalimat. Fokus pada tindakan konkret yang bisa dilakukan manager toko. Gunakan Bahasa Indonesia yang formal namun ringkas.

Data produk:
- Nama: ${name} (SKU: ${sku})
- Klasifikasi: ${klasifikasi}
- Stok saat ini: ${stok} unit
- Reorder Point (ROP): ${rop} unit
- Terjual 30 hari terakhir: ${totalSold30} unit (rata-rata ${avgDaily} unit/hari)
- Harga beli: Rp${hargaBeli.toLocaleString('id-ID')}
- Harga jual: Rp${hargaJual.toLocaleString('id-ID')} (margin ${marginPct}%)
- Nilai stok saat ini: Rp${nilaiStok.toLocaleString('id-ID')}

Kembalikan HANYA JSON: { "rekomendasi": "teks rekomendasi di sini" }`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 200,
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json({ rekomendasi: result.rekomendasi ?? '' })
  } catch (err) {
    console.error('[rekomendasi-ai]', err)
    return NextResponse.json({ message: 'Gagal menghubungi AI' }, { status: 500 })
  }
}
