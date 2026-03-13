import { api } from '@/lib/api'
import { API } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'
import type { BankAccount } from '@/types/bank-account'

export const bankAccountService = {
  list() {
    return api.get<ApiResponse<{ bankAccounts: BankAccount[] }>>(API.BANK_ACCOUNTS_LIST)
  },

  create(data: { bankCode: string; bankName: string; accountNumber: string; accountName: string }) {
    // H-7 FIX: bankName was validated by addBankAccountSchema but silently dropped here —
    // the previous signature omitted bankName so it was never sent to the API.
    return api.post<ApiResponse<BankAccount>>(API.BANK_ACCOUNTS_CREATE, data)
  },

  delete(id: string) {
    return api.delete<ApiResponse<null>>(API.BANK_ACCOUNTS_DELETE(id))
  },

  setPrimary(id: string) {
    return api.post<ApiResponse<BankAccount>>(API.BANK_ACCOUNTS_SET_PRIMARY(id))
  },
}
