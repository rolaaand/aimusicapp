import { NextRequest, NextResponse } from 'next/server'
import { addRating, getStats } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [body, { id }] = await Promise.all([req.json(), params])
  const score = Number(body.score)

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: '1~5 사이의 별점을 입력해주세요.' }, { status: 400 })
  }

  const playlist = await addRating(id, score)
  if (!playlist) {
    return NextResponse.json({ error: '재생목록을 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.json({ stats: getStats(playlist) })
}
