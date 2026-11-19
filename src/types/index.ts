// 元のEcho REST APIが返すタスク形式を維持します。
export type Task = {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export type CsrfToken = {
  csrf_token: string
}

export type Credential = {
  email: string
  password: string
}

export type EditedTask = Pick<Task, 'id' | 'title'>
