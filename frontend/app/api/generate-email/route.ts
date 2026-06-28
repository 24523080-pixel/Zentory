import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const { po } = await req.json()

    const itemsList = po.items
      .map((item: { productName: string; sku: string; qty: number; hargaSatuan: number }) =>
        `- ${item.productName} (SKU: ${item.sku}): ${item.qty} pcs × Rp${item.hargaSatuan.toLocaleString('id-ID')} = Rp${(item.qty * item.hargaSatuan).toLocaleString('id-ID')}`
      )
      .join('\n')

    const total: number = po.items.reduce(
      (s: number, i: { qty: number; hargaSatuan: number }) => s + i.qty * i.hargaSatuan,
      0
    )

    const prompt = `Kamu adalah asisten bisnis profesional. Tulis email pengadaan barang dalam Bahasa Indonesia yang formal dan sopan kepada supplier berdasarkan data Purchase Order berikut:

No. PO   : ${po.noPO}
Supplier : ${po.supplier}
Tanggal  : ${po.tanggal}

Daftar Barang:
${itemsList}

Total Nilai PO: Rp${total.toLocaleString('id-ID')}

Kembalikan HANYA JSON dengan struktur berikut:
{
  "subject": "subject email yang singkat dan profesional",
  "body": "isi email lengkap dalam teks biasa"
}

Ketentuan penulisan:
- Subject: contoh format "Pengajuan Purchase Order ${po.noPO} — Zentory"
- Body: salam pembuka, paragraf permohonan singkat, daftar barang dalam format teks (bukan HTML/markdown), total nilai, instruksi konfirmasi, penutup sopan
- Pengirim: "Tim Pengadaan Zentory"
- Body maksimal 220 kata
- Gunakan Bahasa Indonesia formal`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0,
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json(result)
  } catch (err) {
    console.error('[generate-email]', err)
    return NextResponse.json({ error: 'Gagal generate email' }, { status: 500 })
  }
}
