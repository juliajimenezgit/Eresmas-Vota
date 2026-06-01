const STORAGE_KEY = 'eresmas_vota_device_id'
const VOTED_KEY = 'eresmas_vota_has_voted'

function isLocalhostRuntime(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function getOrCreateDeviceId(): string {
  // In local testing we allow multiple votes and avoid sticky device ids.
  if (isLocalhostRuntime()) {
    return crypto.randomUUID()
  }

  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

export function hasVotedLocally(): boolean {
  if (isLocalhostRuntime()) {
    return false
  }
  return localStorage.getItem(VOTED_KEY) === 'true'
}

export function markVotedLocally(): void {
  if (isLocalhostRuntime()) {
    return
  }
  localStorage.setItem(VOTED_KEY, 'true')
}
