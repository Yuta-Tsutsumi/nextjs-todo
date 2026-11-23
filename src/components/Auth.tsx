'use client'

/* ---------------------------------------------------
このファイルの主な役割：
・認証画面を表示する。
・画面表示時にCSRFトークンの取得を開始する。
・CSRFトークンの取得結果を画面に表示する。

useEffect()：
  コンポーネントの表示後に副作用を実行するReact Hook。

useState()：
  コンポーネント内で状態を管理するReact Hook。

ensureCsrfToken()：
  GoバックエンドからCSRFトークンを取得する関数。
--------------------------------------------------- */

import { useEffect, useState } from 'react'
import { ensureCsrfToken } from '@/lib/api'

export const Auth = () => {
  // CSRFトークンの取得状況を管理する。
  const [status, setStatus] = useState('CSRFトークン取得中...')

  // 認証画面の表示後にCSRFトークンを取得する。
  // 第2引数の[]は、このEffectがpropsやstateの変更では
  // 再実行されないことを表す。
  useEffect(() => {
    let active = true

    // GoバックエンドのGET /csrfを呼び出す。
    ensureCsrfToken()
      .then(() => {
        // 取得成功時に画面のメッセージを更新する。
        if (active) {
          setStatus('CSRFトークンを取得しました')
        }
      })
      .catch((error: unknown) => {
        // 通信失敗時にブラウザのConsoleへエラーを出力する。
        console.error('CSRFトークン取得エラー:', error)

        if (active) {
          setStatus('CSRFトークンの取得に失敗しました')
        }
      })

    // コンポーネント破棄後の状態更新を防止する。
    return () => {
      active = false
    }
  }, [])

  return <div>{status}</div>
}
