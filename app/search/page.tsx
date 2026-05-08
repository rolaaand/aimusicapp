'use client'

import { useState } from 'react'

interface VideoItem {
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  publishedAt: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [noApiKey, setNoApiKey] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setNoApiKey(false)
    setSearched(true)

    try {
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()

      if (data.error === 'NO_API_KEY') {
        setNoApiKey(true)
        setResults([])
        return
      }
      if (!res.ok) {
        setError(data.error || '검색 중 오류가 발생했습니다.')
        return
      }
      setResults(data.items)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">유튜브 검색</h1>
        <p className="text-gray-400">AI 음악 재생목록에 포함할 유튜브 영상을 검색해보세요</p>
      </div>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요 (예: AI music, Suno AI song...)"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-lg font-medium whitespace-nowrap"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>

      {/* Suno 배너 */}
      <a
        href="https://suno.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-8 group"
      >
        <div className="bg-gradient-to-r from-violet-950 via-purple-900 to-blue-950 border border-purple-700/40 rounded-xl p-5 flex items-center justify-between hover:border-purple-500/70 transition-all hover:shadow-lg hover:shadow-purple-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl shrink-0">
              🎵
            </div>
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-wider mb-0.5 font-medium">AI 음악 생성 플랫폼</p>
              <p className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                Suno로 나만의 AI 음악 만들기
              </p>
              <p className="text-sm text-gray-400 mt-0.5">텍스트 한 줄로 완성되는 나만의 노래 · suno.com</p>
            </div>
          </div>
          <div className="shrink-0 bg-purple-600 group-hover:bg-purple-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
            방문하기 <span>→</span>
          </div>
        </div>
      </a>

      {/* API 키 미설정 안내 */}
      {noApiKey && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6 text-sm mb-6">
          <p className="text-yellow-300 font-semibold mb-2 text-base">⚙️ YouTube API 키 설정이 필요합니다</p>
          <p className="text-gray-400 mb-4">검색 기능을 사용하려면 YouTube Data API v3 키를 설정해주세요.</p>
          <ol className="text-gray-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Google Cloud Console (console.cloud.google.com)에서 프로젝트를 생성하세요</li>
            <li>YouTube Data API v3를 활성화하세요</li>
            <li>사용자 인증 정보 → API 키를 발급받으세요</li>
            <li>
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300">wrangler.toml</code> 의{' '}
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300">[vars]</code> 섹션에{' '}
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300">YOUTUBE_API_KEY = &quot;발급받은키&quot;</code>를 추가하세요
            </li>
            <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300">npm run deploy</code>를 다시 실행하세요</li>
          </ol>
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {results.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{results.length}개의 검색 결과</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(video => (
              <a
                key={video.videoId}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-600 transition-all hover:shadow-xl hover:shadow-purple-900/20"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    ▶ YouTube
                  </div>
                </div>
                <div className="p-3">
                  <p
                    className="font-medium text-sm line-clamp-2 group-hover:text-purple-300 transition-colors mb-1"
                    dangerouslySetInnerHTML={{ __html: video.title }}
                  />
                  <p className="text-xs text-gray-500">{video.channelTitle}</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {searched && !loading && results.length === 0 && !error && !noApiKey && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">검색 결과가 없습니다</p>
          <p className="text-sm mt-1">다른 검색어로 시도해보세요</p>
        </div>
      )}
    </div>
  )
}
