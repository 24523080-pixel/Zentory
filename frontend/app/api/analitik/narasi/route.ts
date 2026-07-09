import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'manager') return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

  const { fast, slow, dead, insufficient, totalSku, nilaiDeadStock, topFast, deadItems } = await req.json()

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const topFastStr = topFast.length
    ? topFast.map((p: { name: string; sold: number }) => `${p.name} (${p.sold} unit/30hr)`).join(', ')
    : 'tidak ada'
  const deadStr = deadItems.length
    ? deadItems.map((p: { name: string; nilai: number }) => `${p.name} (Rp${p.nilai.toLocaleString('id-ID')})`).join(', ')
    : 'tidak ada'

  const prompt = `Kamu adalah analis bisnis ritel yang berpengalaman.

Tulis ringkasan insight portofolio inventori dalam 3-4 kalimat yang padat dan langsung dapat ditindaklanjuti oleh manager toko. Gunakan Bahasa Indonesia yang formal namun mudah dipahami. Sertakan kondisi terkini, risiko utama, dan prioritas tindakan.

Data portofolio (${totalSku} SKU total):
- Fast Moving: ${fast} SKU — produk unggulan: ${topFastStr}
- Slow Moving: ${slow} SKU
- Dead Stock: ${dead} SKU — ${deadStr}
- Belum cukup data: ${insufficient} SKU
- Total modal beku (dead stock): Rp${nilaiDeadStock.toLocaleString('id-ID')}

Kembalikan HANYA JSON: { "narasi": "teks insight di sini" }`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 300,
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json({ narasi: result.narasi ?? '' })
  } catch (err) {
    console.error('[narasi-ai]', err)
    return NextResponse.json({ message: 'Gagal menghubungi AI' }, { status: 500 })
  }
}
