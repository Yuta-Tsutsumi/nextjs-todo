'use client'

import { useCallback } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { refreshCsrfToken } from '@/lib/api'
import useStore from '@/store'

// APIとの通信ができていない場合のエラーメッセージ処理
function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data
    if (data && typeof data === 'object' && 'massage' in data) {
      const message = (data as { massage: unknown }).massage
      if (typeof message === 'string') return message
    }
    if (typeof data === 'string') return data
    return err.message
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred'
}

export const useError = () => {
  const router = useRouter()
  const resetEditedTask = useStore((state) => state.resetEditedTask)

  const switchErrorHandling = useCallback(
    (err: unknown) => {
      const msg = extractErrorMessage(err)
      switch (msg) {
        case 'invalid csrf token':
          void refreshCsrfToken().catch(() => {
            // CSRFトークンの再取得は、次の操作時にも再試行されます。
          })
          alert('CSRF token is invalid, please try again')
          break
        case 'invalid or expired jwt':
          alert('access token expired, please login')
          resetEditedTask()
          router.replace('/')
          break
        case 'missing or malformed jwt':
          alert('access token is not valid, please login')
          resetEditedTask()
          router.replace('/')
          break
        case 'duplicated key not allowed':
          alert('email already exist, please use another one')
          break
        case 'crypto/bcrypt: hashedPassword is not the hash of the given password':
          alert('password is not correct')
          break
        case 'record not found':
          alert('email is not correct')
          break
        default:
          alert(msg)
      }
    },
    [resetEditedTask, router],
  )

  return { switchErrorHandling }
}
