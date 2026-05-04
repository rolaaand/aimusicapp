import { NextRequest, NextResponse } from 'next/server'

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

export async function GET(req: NextRequest) {
  const playlistId = req.nextUrl.searchParams.get('playlistId')
  if (!playlistId) {
    return NextResponse.json({ error: 'playlistId required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`,
      { next: { revalidate: 300 } }
    )

    if (!res.ok) return NextResponse.json([])

    const xml = await res.text()
    const entries = xml.split('<entry>').slice(1)

    const tracks = entries
      .map(entry => {
        const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1]
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1]
        if (!videoId) return null
        return {
          videoId,
          title: title ? decodeHtml(title) : `트랙 ${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        }
      })
      .filter(Boolean)

    return NextResponse.json(tracks)
  } catch {
    return NextResponse.json([])
  }
}
