export type BankCode =
  | 'BCA' | 'BNI' | 'BRI' | 'MANDIRI' | 'CIMB'
  | 'PERMATA' | 'DANAMON' | 'OCBC' | 'PANIN' | 'MEGA'
  | 'BTN' | 'BSI' | 'MAYBANK' | 'OTHER'

export interface BankAccount {
  id: string
  bankCode: BankCode
  bankName: string
  accountNumber: string
  accountName: string
  isPrimary: boolean
  isVerified: boolean
  createdAt: string
}
