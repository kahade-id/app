/**
 * @deprecated Client-side PIN hashing has been removed for security reasons.
 * PINs should be sent over HTTPS and hashed server-side using proper KDF (bcrypt/Argon2).
 * 
 * Security considerations:
 * - Client-side hashing provides no security benefit as the hash becomes the "password"
 * - Without salt, hashes are vulnerable to rainbow table attacks
 * - SHA-256 is too fast for password hashing
 * 
 * All PIN operations now send plaintext over HTTPS (TLS 1.2+) to server.
 */

export function validatePinFormat(pin: string): boolean {
  return /^\d{6}$/.test(pin)
}

export function maskPinForLogging(pin: string): string {
  if (pin.length <= 2) return '****'
  return '*'.repeat(pin.length - 2) + pin.slice(-2)
}
