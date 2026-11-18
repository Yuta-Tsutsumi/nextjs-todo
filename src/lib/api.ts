import axios from 'axios'
import type { CsrfToken } from '@/types'

// NEXT_PUBLIC_ の設定のみがブラウザー側に公開されます。
// Cookie/JWT はブラウザーが送信し、JavaScript 側には保存しません。
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true,
})

let csrfPromise: Promise<void> | null = null

// 最初の書き込み操作より前にCSRFトークンを取得します。
// 同時リクエスト時に /csrf を重複呼び出ししないよう Promise を共有します。
export async function ensureCsrfToken(): Promise<void> {
  if (api.defaults.headers.common['X-CSRF-Token']) return

  if (!csrfPromise) {
    csrfPromise = api
      .get<CsrfToken>('/csrf')
      .then(({ data }) => {
        api.defaults.headers.common['X-CSRF-Token'] = data.csrf_token
      })
      .finally(() => {
        csrfPromise = null
      })
  }
  await csrfPromise
}
