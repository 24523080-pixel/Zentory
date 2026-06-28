'use client'

import { useState, useEffect } from 'react'
import { Mail, Sparkles, X, Copy, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import type { PurchaseOrder } from '../../_data'

interface EmailDraft {
  subject: string
  body: string
}

export function EmailModal({ po }: { po: PurchaseOrder }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [draft, setDraft]     = useState<EmailDraft | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [copied, setCopied]   = useState<'subject' | 'body' | 'all' | null>(null)

  async function generate() {
    setOpen(true)
    setLoading(true)
    setDraft(null)
    setError(null)
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ po }),
      })
      if (!res.ok) throw new Error('response error')
      const data: EmailDraft = await res.json()
      setDraft(data)
    } catch {
      setError('Gagal menghubungi AI. Periksa koneksi dan API key, lalu coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function copyText(text: string, type: 'subject' | 'body' | 'all') {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={generate}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/8 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15 print:hidden"
      >
        <Sparkles className="size-4" />
        Generate Email AI
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="flex w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="size-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email ke Supplier</p>
                  <p className="text-xs text-muted-foreground">{po.supplier} · {po.noPO}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[65vh] overflow-y-auto p-5 space-y-4">

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <div className="size-14 rounded-full border-4 border-primary/20" />
                    <Loader2 className="absolute inset-0 m-auto size-7 animate-spin text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">AI sedang menyusun email...</p>
                    <p className="text-xs text-muted-foreground mt-1">Membaca data PO dan menulis draft</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Gagal generate email</p>
                    <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
                    <button
                      type="button"
                      onClick={generate}
                      className="mt-2 text-xs font-medium text-destructive underline underline-offset-2 hover:no-underline"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              )}

              {/* Result */}
              {draft && (
                <>
                  {/* AI badge */}
                  <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3.5 py-2.5">
                    <Sparkles className="size-3.5 text-primary shrink-0" />
                    <p className="text-xs text-primary">
                      Email berhasil digenerate oleh AI · Pastikan review sebelum mengirim ke supplier
                    </p>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</span>
                      <button
                        type="button"
                        onClick={() => copyText(draft.subject, 'subject')}
                        className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {copied === 'subject'
                          ? <><Check className="size-3 text-chart-3" /> Tersalin</>
                          : <><Copy className="size-3" /> Salin</>
                        }
                      </button>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium">
                      {draft.subject}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Isi Email</span>
                      <button
                        type="button"
                        onClick={() => copyText(draft.body, 'body')}
                        className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {copied === 'body'
                          ? <><Check className="size-3 text-chart-3" /> Tersalin</>
                          : <><Copy className="size-3" /> Salin</>
                        }
                      </button>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {draft.body}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {draft && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
                <p className="text-xs text-muted-foreground">Digenerate dari data PO · {new Date().toLocaleDateString('id-ID')}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyText(`Subject: ${draft.subject}\n\n${draft.body}`, 'all')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    {copied === 'all'
                      ? <><Check className="size-3 text-chart-3" /> Tersalin!</>
                      : <><Copy className="size-3" /> Salin Semua</>
                    }
                  </button>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <ExternalLink className="size-3" />
                    Buka di Gmail
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
