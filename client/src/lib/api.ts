import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export interface VoteResponse {
  success: boolean
  message?: string
}

export interface ResultItem {
  charanga: string
  votes: number
}

export interface AdminVoteItem {
  id: number
  charanga: string
  ip: string | null
  user_agent: string | null
  created_at: string
}

export interface AdminDashboardData {
  total_votes: number
  unique_devices: number
  unique_ips: number
  leader_charanga: string | null
  leader_votes: number
  has_tie: boolean
  last_vote_at: string | null
  votes_by_charanga: ResultItem[]
  recent_votes: AdminVoteItem[]
}

export interface AdminResetVotesResponse {
  success: boolean
  message: string
  deleted_votes: number
}

export async function submitVote(charanga: string, deviceId: string): Promise<VoteResponse> {
  const { data } = await api.post<VoteResponse>('/api/vote', { charanga, deviceId })
  return data
}

export async function fetchResults(): Promise<ResultItem[]> {
  const { data } = await api.get<ResultItem[]>('/api/results')
  return data
}

export async function fetchAdminDashboard(adminKey: string): Promise<AdminDashboardData> {
  const { data } = await api.get<AdminDashboardData>('/api/admin/dashboard', {
    headers: {
      'X-Admin-Key': adminKey,
    },
  })
  return data
}

export async function resetAdminVotes(adminKey: string): Promise<AdminResetVotesResponse> {
  const { data } = await api.post<AdminResetVotesResponse>(
    '/api/admin/reset-votes',
    {},
    {
      headers: {
        'X-Admin-Key': adminKey,
      },
    },
  )
  return data
}

export function qrImageUrl(): string {
  return `${baseURL}/api/qr`
}
