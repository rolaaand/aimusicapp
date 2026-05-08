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
  const { userName, title, playlistUrl, composingTool, lyricsTool, comment } = body

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

  // Fetch thumbnail: try YouTube Data API first (for random selection), fallback to oEmbed
  let thumbnail: string | undefined
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (apiKey) {
      // Get playlist items and pick a random video thumbnail
      const itemsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}&maxResults=50`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        const videos = (itemsData.items ?? []).filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => item.snippet?.thumbnails?.medium?.url
        )
        if (videos.length > 0) {
          const random = videos[Math.floor(Math.random() * videos.length)]
          thumbnail = random.snippet.thumbnails.medium?.url ?? random.snippet.thumbnails.default?.url
        }
      }
    }

    if (!thumbnail) {
      // Fallback: use oEmbed playlist thumbnail
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlistId}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (oembedRes.ok) {
        const oembed = await oembedRes.json()
        if (oembed.thumbnail_url) thumbnail = oembed.thumbnail_url
      }
    }
  } catch { /* no thumbnail */ }

  const playlist = await createPlaylist({
    userName: userName.trim(),
    title: title.trim(),
    playlistUrl: playlistUrl.trim(),
    playlistId,
    composingTool: composingTool.trim(),
    lyricsTool: lyricsTool.trim(),
    comment: comment?.trim() || undefined,
    thumbnail,
  })

  return NextResponse.json({ ...playlist, stats: getStats(playlist) }, { status: 201 })
}
