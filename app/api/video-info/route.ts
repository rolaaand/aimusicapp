import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { videoIds } = await req.json()
  if (!Array.isArray(videoIds) || videoIds.length === 0) return NextResponse.json([])

  const limited = (videoIds as string[]).slice(0, 50)

  const results = await Promise.allSettled(
    limited.map(async (videoId: string) => {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { next: { revalidate: 3600 } }
      )
      if (!res.ok) return { videoId, title: null, thumbnail: null }
      const data = await res.json()
      return {
        videoId,
        title: data.title as string | null,
        thumbnail: data.thumbnail_url as string | null,
      }
    })
  )

  return NextResponse.json(
    results.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { videoId: limited[i], title: null, thumbnail: null }
    )
  )
}
