import HomeClient from '@/app/components/HomeClient'
import { getAllPlaylists, getStats } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const playlists = await getAllPlaylists()
  const items = playlists.map(p => ({ ...p, stats: getStats(p) }))
  return <HomeClient items={items} />
}
