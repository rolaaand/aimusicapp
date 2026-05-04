import { NextRequest, NextResponse } from 'next/server'
import { getPlaylist, getStats } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const playlist = await getPlaylist(id)
  if (!playlist) {
    return NextResponse.json({ error: '재생목록을 찾을 수 없습니다.' }, { status: 404 })
  }
  return NextResponse.json({ ...playlist, stats: getStats(playlist) })
}
