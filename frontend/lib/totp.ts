import { createHmac, randomBytes } from 'crypto'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function generateSecret(): string {
  const bytes = randomBytes(20)
  return Array.from(bytes, (b) => ALPHABET[b % 32]).join('')
}

function base32Decode(str: string): Buffer {
  const s = str.replace(/=+$/, '').toUpperCase()
  let bits = 0, value = 0
  const out: number[] = []
  for (const ch of s) {
    const idx = ALPHABET.indexOf(ch)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bits -= 8
      out.push((value >>> bits) & 0xff)
    }
  }
  return Buffer.from(out)
}

function getCode(secret: string, step: number): string {
  const key = base32Decode(secret)
  const buf = Buffer.alloc(8)
  buf.writeUInt32BE(0, 0)
  buf.writeUInt32BE(step >>> 0, 4)
  const hmac = createHmac('sha1', key).update(buf).digest()
  const pos  = hmac[hmac.length - 1] & 0xf
  const code =
    ((hmac[pos]     & 0x7f) << 24 |
     (hmac[pos + 1] & 0xff) << 16 |
     (hmac[pos + 2] & 0xff) << 8  |
     (hmac[pos + 3] & 0xff)) % 1_000_000
  return String(code).padStart(6, '0')
}

export function verifyTOTP(token: string, secret: string): boolean {
  const step = Math.floor(Date.now() / 30_000)
  return [-1, 0, 1].some((w) => getCode(secret, step + w) === token)
}

export function keyuri(email: string, issuer: string, secret: string): string {
  return (
    `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}` +
    `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
  )
}
