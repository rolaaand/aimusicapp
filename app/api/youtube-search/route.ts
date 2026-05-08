import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query?.trim()) return NextResponse.json({ items: [] })

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'NO_API_KEY' }, { status: 503 })
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=12&order=relevance`

  const res = await fetch(url)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message || '검색에 실패했습니다.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (data.items ?? []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
    }))
  })
}
