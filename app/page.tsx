import Link from 'next/link'
import { getAllPlaylists, getStats } from '@/lib/db'

export const dynamic = 'force-dynamic'

function cardGradient(id: string): string {
  const gradients = [
    'from-purple-600 via-purple-700 to-blue-700',
    'from-pink-600 via-rose-600 to-purple-700',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-emerald-600 via-green-600 to-teal-700',
    'from-orange-600 via-red-600 to-pink-700',
    'from-indigo-600 via-purple-600 to-blue-700',
    'from-yellow-600 via-orange-600 to-red-600',
    'from-cyan-600 via-blue-600 to-indigo-700',
  ]
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return gradients[hash % gradients.length]
}

export default async function Home() {
  const playlists = await getAllPlaylists()
  const items = playlists.map(p => ({ ...p, stats: getStats(p) }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI 음악 재생목록</h1>
        <p className="text-gray-400">AI로 만든 음악을 담은 유튜브 재생목록을 발견하고 평가해보세요</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <div className="text-7xl mb-4">🎵</div>
          <p className="text-xl mb-2">아직 등록된 재생목록이 없습니다</p>
          <p className="text-sm mb-8">첫 번째로 AI 음악 재생목록을 공유해보세요!</p>
          <Link
            href="/publish"
            className="bg-purple-600 hover:bg-purple-500 transition-colors px-6 py-3 rounded-lg font-medium"
          >
            재생목록 퍼블리시하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(p => (
            <Link
              key={p.id}
              href={`/playlist/${p.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-600 transition-all hover:shadow-xl hover:shadow-purple-900/20"
            >
              <div
                className={`h-40 bg-gradient-to-br ${cardGradient(p.id)} flex items-center justify-center relative overflow-hidden`}
              >
                <span className="text-6xl opacity-20 absolute -right-3 -bottom-3 rotate-12 select-none">🎵</span>
                <span className="text-6xl opacity-15 absolute -left-3 -top-3 -rotate-12 select-none">♪</span>
                <span className="text-5xl drop-shadow-lg">🎧</span>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-1 group-hover:text-purple-300 transition-colors line-clamp-2">
                  {p.title}
                </h2>
                <p className="text-sm text-gray-400 mb-3">
                  by <span className="text-purple-300">{p.userName}</span>
                  <span className="mx-1.5 text-gray-700">·</span>
                  <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString('ko-KR')}</span>
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span
                        key={s}
                        className={s <= Math.round(p.stats.avg) ? 'text-yellow-400' : 'text-gray-600'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {p.stats.count > 0
                      ? `${p.stats.avg.toFixed(1)} (${p.stats.count}명)`
                      : '아직 평가 없음'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
