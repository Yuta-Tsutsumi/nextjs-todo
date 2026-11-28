/* ---------------------------------------------------
このファイルの主な役割：
・Axiosを使用してバックエンドAPIとのHTTP通信を管理する。
・環境変数からAPIの接続先URLを取得する。
・Cookieを使用する認証付きHTTPリクエストを可能にする。
・CSRFトークンを取得してHTTPヘッダーに設定する。
・複数のリクエストが同時に発生した場合、CSRFトークンの取得処理を共有する。

axios.create()：共通設定を持つAxiosインスタンスを生成するメソッド。
api：バックエンドAPIとの通信に使用するAxiosインスタンス。
csrfPromise：CSRFトークン取得処理のPromiseを保持する変数。
ensureCsrfToken()：CSRFトークンの取得と設定を行う非同期関数。
api.get()：GETリクエストを送信するメソッド。
.then()：非同期処理が成功した場合に実行するメソッド。
.finally()：非同期処理の成功・失敗にかかわらず実行するメソッド。
--------------------------------------------------- */

import axios from 'axios'
import type { CsrfToken } from '@/types'

// axios.create()を使用して、バックエンドAPIとのHTTP通信に使用するAxiosインスタンスを生成する。
// 「baseURL」はAPIの接続先URLを指定し、環境変数が未設定の場合は「http://localhost:8080」を使用する。
// 「withCredentials: true」は、クロスオリジン通信でCookieなどの認証情報を送信できるようにする設定。
// 「export const api」によって、生成したAxiosインスタンスを他のファイルから利用できるようにする。
export const api = axios.create({
  baseURL: process.env.NEXT_PUGIC_API_URL || 'http://localhost:8080',
  withCredentials: true,
})

// 「csrfPromise」は、CSRFトークンを取得する非同期処理を保持する変数。
// 「Promise<void> | null」は、戻り値のない非同期処理のPromise、またはnullを格納できる型。
// 初期値をnullにすることで、CSRFトークンの取得処理が実行中ではない状態を表す。
let csrfPromise: Promise<void> | null = null

// 「ensureCsrfToken()」は、CSRFトークンを取得してAxiosの共通HTTPヘッダーに設定する非同期関数。
// 「async」は非同期関数を定義するキーワードで、「Promise<void>」は正常終了時に値を返さないことを表す。
// 「if」は共通ヘッダーにCSRFトークンが既に設定されているかを確認する条件分岐。
// CSRFトークンが設定済みの場合は、returnによって取得処理を実行せずに関数を終了する。
export async function ensureCsrfToken(): Promise<void> {
  if (api.defaults.headers.common['X-CSRF-Token']) return

  // 「!csrfPromise」は、CSRFトークンの取得処理が実行中ではないことを確認する条件式。
  // 取得処理が実行中ではない場合は、「/csrf」にGETリクエストを送信してトークンを取得する。
  // 「.then()」で取得したトークンをAxiosの共通HTTPヘッダーに設定する。
  // 「.finally()」でPromiseをnullに戻し、次回の取得処理を実行できる状態にする。
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

  // 「await」は、CSRFトークンの取得処理が完了するまで待機する演算子。
  // 複数のリクエストが同時に発生した場合も、同じPromiseを共有して重複取得を防止する。
  // 取得に失敗した場合は、エラーが呼び出し元に伝わる。
  await csrfPromise
}

export async function refreshCsrfToken(): Promise<void> {
  delete api.defaults.headers.common['X-CSRF-Token']
  await ensureCsrfToken()
}
