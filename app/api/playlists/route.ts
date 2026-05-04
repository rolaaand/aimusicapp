import { NextRequest, NextResponse } from 'next/server'
import { getAllPlaylists, createPlaylist, getStats } from '@/lib/db'
import { extractPlaylistId } from '@/lib/youtube'

export const dynamic = 'force-dynamic'

export async function GET() {
  const playlists = await getAllPlaylists()
  return NextResponse.json(playlists.map(p => ({ ...p, stats: getStats(p) })))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userName, title, playlistUrl, composingTool, lyricsTool } = body

  if (!userName?.trim() || !title?.trim() || !playlistUrl?.trim()) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 })
  }
  if (!composingTool?.trim() || !lyricsTool?.trim()) {
    return NextResponse.json({ error: 'AI Tool을 선택해주세요.' }, { status: 400 })
  }

  const playlistId = extractPlaylistId(playlistUrl)
  if (!playlistId) {
    return NextResponse.json(
      { error: '유효한 유튜브 재생목록 주소를 입력해주세요. (list= 파라미터가 포함된 주소)' },
      { status: 400 }
    )
  }

  const playlist = await createPlaylist({
    userName: userName.trim(),
    title: title.trim(),
    playlistUrl: playlistUrl.trim(),
    playlistId,
    composingTool: composingTool.trim(),
    lyricsTool: lyricsTool.trim(),
  })

  return NextResponse.json({ ...playlist, stats: getStats(playlist) }, { status: 201 })
}
