import { v4 as uuidv4 } from 'uuid'

export interface Rating {
  score: number
  createdAt: string
}

export interface Playlist {
  id: string
  userName: string
  playlistUrl: string
  playlistId: string
  title: string
  composingTool: string
  lyricsTool: string
  comment?: string
  thumbnail?: string
  createdAt: string
  ratings: Rating[]
}

const KV_KEY = 'playlists_data'

// Use Cloudflare KV when STORAGE_BACKEND=kv (set in wrangler.toml)
const USE_KV = process.env.STORAGE_BACKEND === 'kv'

async function getKV() {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (getCloudflareContext as any)()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx.env as any).PLAYLISTS_KV
}

async function readData(): Promise<{ playlists: Playlist[] }> {
  if (USE_KV) {
    const kv = await getKV()
    const raw: string | null = await kv.get(KV_KEY)
    return raw ? JSON.parse(raw) : { playlists: [] }
  }
  // Local development: file-system storage
  const { default: fs } = await import('fs')
  const { default: path } = await import('path')
  const file = path.join(process.cwd(), 'data', 'playlists.json')
  if (!fs.existsSync(file)) {
    const dir = path.dirname(file)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(file, JSON.stringify({ playlists: [] }, null, 2))
    return { playlists: [] }
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

async function writeData(data: { playlists: Playlist[] }): Promise<void> {
  if (USE_KV) {
    const kv = await getKV()
    await kv.put(KV_KEY, JSON.stringify(data))
    return
  }
  const { default: fs } = await import('fs')
  const { default: path } = await import('path')
  const file = path.join(process.cwd(), 'data', 'playlists.json')
  const dir = path.dirname(file)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const data = await readData()
  return data.playlists.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getPlaylist(id: string): Promise<Playlist | null> {
  const data = await readData()
  return data.playlists.find(p => p.id === id) ?? null
}

export async function createPlaylist(input: {
  userName: string
  playlistUrl: string
  playlistId: string
  title: string
  composingTool: string
  lyricsTool: string
  comment?: string
  thumbnail?: string
}): Promise<Playlist> {
  const data = await readData()
  const playlist: Playlist = {
    id: uuidv4(),
    ...input,
    createdAt: new Date().toISOString(),
    ratings: [],
  }
  data.playlists.push(playlist)
  await writeData(data)
  return playlist
}

export async function addRating(playlistId: string, score: number): Promise<Playlist | null> {
  const data = await readData()
  const playlist = data.playlists.find(p => p.id === playlistId)
  if (!playlist) return null
  playlist.ratings.push({ score, createdAt: new Date().toISOString() })
  await writeData(data)
  return playlist
}

export function getStats(playlist: Playlist) {
  const count = playlist.ratings.length
  const avg =
    count > 0
      ? playlist.ratings.reduce((sum, r) => sum + r.score, 0) / count
      : 0
  return { count, avg: Math.round(avg * 10) / 10 }
}
