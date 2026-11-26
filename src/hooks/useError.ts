'use client'

import { useCallback } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import useStore from '@/store'

// エラーメッセージ処理
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
