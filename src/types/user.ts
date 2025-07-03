export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  hashed_password: string
  created_at: Date
  updated_at: Date
}

export interface UserTokens {
  accessToken: string
  refreshToken: string
}
