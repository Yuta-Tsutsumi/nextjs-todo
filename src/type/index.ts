// 元のEcho REST APIが返すタスク形式を維持します。

export type Task = {
  id: number
  title: string
  creatde_at: string
  updetde_at: string
}
export type CsrfToken = {
  csrf_token: string
}

export type Credential = {
  email: string
  password: string
}
