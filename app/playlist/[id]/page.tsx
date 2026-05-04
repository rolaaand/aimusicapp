'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Stats { avg: number; count: number }

interface PlaylistData {
  id: string
  userName: string
  title: string
  playlistId: string
  composingTool: string
  lyricsTool: string
  createdAt: string
  stats: Stats
}

interface Track {
  videoId: string
  title: string | null
  thumbnail: string | null
}

/* ─── Star Rating ─────────────────────────────────────── */
function StarRating({ value, onChange, readonly }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean
}) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          className={`text-4xl leading-none transition-transform ${!readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <span className={display >= star ? 'text-yellow-400' : 'text-gray-600'}>★</span>
        </button>
      ))}
    </div>
  )
}

/* ─── Rating Stats ────────────────────────────────────── */
function RatingStats({ stats }: { stats: Stats }) {
  return (
    <div className="flex items-center gap-4 bg-gray-800/60 rounded-xl px-6 py-4 border border-gray-700">
      <div className="text-center min-w-[60px]">
        <div className="text-3xl font-bold text-yellow-400">{stats.count > 0 ? stats.avg.toFixed(1) : '-'}</div>
        <div className="text-xs text-gray-400 mt-1">평균 별점</div>
      </div>
      <div className="w-px h-10 bg-gray-700" />
      <div className="text-center min-w-[60px]">
        <div className="text-3xl font-bold text-purple-400">{stats.count}</div>
        <div className="text-xs text-gray-400 mt-1">참여 인원</div>
      </div>
      <div className="w-px h-10 bg-gray-700" />
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <span key={s} className={`text-xl ${s <= Math.round(stats.avg) ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
        ))}
      </div>
    </div>
  )
}

/* ─── Track Item ──────────────────────────────────────── */
function TrackItem({ index, track, isActive, onClick }: {
  index: number; track: Track; isActive: boolean; onClick: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const thumb = imgFailed ? null : (track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg`)

  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left group transition-all ${
        isActive ? 'bg-purple-900/40 border border-purple-700/40' : 'hover:bg-gray-800/60 border border-transparent'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-20 h-[54px] rounded overflow-hidden bg-gray-800 flex items-center justify-center">
        {thumb
          ? <img src={thumb} alt="" className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
          : <span className="text-gray-600 text-xl">♪</span>
        }
        <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isActive ? 'bg-black/30' : 'bg-transparent group-hover:bg-black/40'}`}>
          <span className={`text-white text-base transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>▶</span>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-300' : 'text-gray-200 group-hover:text-white'}`}>
          {track.title || `트랙 ${index + 1}`}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">트랙 {index + 1}</p>
      </div>

      {isActive && <span className="text-xs text-purple-400 font-medium shrink-0">재생 중</span>}
    </button>
  )
}

/* ─── Main Page ───────────────────────────────────────── */
export default function PlaylistPage() {
  const params = useParams()
  const id = params.id as string

  const [playlist, setPlaylist]     = useState<PlaylistData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const [myRating, setMyRating]     = useState(0)
  const [hasRated, setHasRated]     = useState(false)
  const [tempRating, setTempRating] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  const playerWrapperRef  = useRef<HTMLDivElement>(null)
  const ytPlayerRef       = useRef<any>(null)
  const videoListLoaded   = useRef(false)

  const [tracks, setTracks]               = useState<Track[]>([])
  const [tracksLoading, setTracksLoading] = useState(false)
  const [currentIndex, setCurrentIndex]  = useState(0)

  /* Load playlist metadata */
  useEffect(() => {
    if (!id) return
    const saved = localStorage.getItem(`rated_${id}`)
    if (saved) { setHasRated(true); setMyRating(parseInt(saved)) }

    fetch(`/api/playlists/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setPlaylist(d) })
      .catch(() => setError('재생목록을 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  /* Fetch oEmbed info for each video ID */
  const fetchTrackInfo = useCallback(async (videoIds: string[]) => {
    setTracksLoading(true)
    try {
      const res = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds: videoIds.slice(0, 50) }),
      })
      setTracks(await res.json())
    } catch {
      setTracks(videoIds.slice(0, 50).map(v => ({ videoId: v, title: null, thumbnail: null })))
    } finally {
      setTracksLoading(false)
    }
  }, [])

  /* Initialize YouTube IFrame Player API */
  useEffect(() => {
    if (!playlist || !playerWrapperRef.current) return

    let destroyed = false
    let poll: ReturnType<typeof setInterval> | null = null

    // Always create a fresh mount point so React/YouTube never conflict
    const container = document.createElement('div')
    container.style.width  = '100%'
    container.style.height = '100%'
    playerWrapperRef.current.appendChild(container)

    function initPlayer() {
      if (destroyed || !container.isConnected) return

      ytPlayerRef.current = new (window as any).YT.Player(container, {
        height: '100%',
        width:  '100%',
        playerVars: {
          listType: 'playlist',
          list: playlist!.playlistId,
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            if (destroyed) return
            // Poll until getPlaylist() returns IDs (cue may take a moment)
            let attempts = 0
            poll = setInterval(() => {
              if (destroyed) { clearInterval(poll!); return }
              const ids: string[] | null = event.target.getPlaylist()
              attempts++
              if ((ids && ids.length > 0) || attempts >= 24) {
                clearInterval(poll!)
                if (ids?.length && !videoListLoaded.current) {
                  videoListLoaded.current = true
                  fetchTrackInfo(ids)
                }
              }
            }, 500)
          },
          onStateChange: (event: any) => {
            if (destroyed) return
            const idx: number = event.target.getPlaylistIndex()
            if (idx >= 0) setCurrentIndex(idx)
            // Fallback: try on any state change
            if (!videoListLoaded.current) {
              const ids: string[] | null = event.target.getPlaylist()
              if (ids?.length) { videoListLoaded.current = true; fetchTrackInfo(ids) }
            }
          },
        },
      })
    }

    if ((window as any).YT?.Player) {
      initPlayer()
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const s = document.createElement('script')
        s.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(s)
      }
      const prev = (window as any).onYouTubeIframeAPIReady
      ;(window as any).onYouTubeIframeAPIReady = () => { prev?.(); initPlayer() }
    }

    return () => {
      destroyed = true
      if (poll) clearInterval(poll)
      try { ytPlayerRef.current?.destroy() } catch {}
      ytPlayerRef.current = null
      if (container.isConnected) container.remove()
      videoListLoaded.current = false
    }
  }, [playlist?.playlistId, fetchTrackInfo])

  /* Rating handler */
  async function handleRate(score: number) {
    if (hasRated || ratingLoading) return
    setTempRating(score); setRatingLoading(true)
    try {
      const res = await fetch(`/api/playlists/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      })
      const data = await res.json()
      if (res.ok) {
        setMyRating(score); setHasRated(true)
        localStorage.setItem(`rated_${id}`, score.toString())
        setPlaylist(prev => prev ? { ...prev, stats: data.stats } : null)
      } else setTempRating(0)
    } catch { setTempRating(0) }
    finally { setRatingLoading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">불러오는 중...</div>
  )
  if (error || !playlist) return (
    <div className="text-center py-20">
      <p className="text-red-400 mb-4">{error || '재생목록을 찾을 수 없습니다.'}</p>
      <Link href="/" className="text-purple-400 hover:underline">홈으로 돌아가기</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
        ← 홈으로
      </Link>

      {/* AI 정보 배너 */}
      <div className="bg-indigo-950/60 border border-indigo-800/60 rounded-xl p-5 mb-4 space-y-2.5">
        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-3">재생목록 AI 정보</p>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-indigo-400 shrink-0">🎵</span>
          <span className="text-gray-300">
            <span className="text-gray-400">재생목록에 포함된 곡을 작곡하는데 사용한 AI Tool:</span>{' '}
            <span className="text-white font-medium">{playlist.composingTool}</span>
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-indigo-400 shrink-0">✍️</span>
          <span className="text-gray-300">
            <span className="text-gray-400">재생목록에 포함된 곡을 작사하는데 사용한 AI Tool:</span>{' '}
            <span className="text-white font-medium">{playlist.lyricsTool}</span>
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm pt-1 border-t border-indigo-800/40">
          <span className="text-yellow-500 shrink-0">⚠️</span>
          <span className="text-gray-400">
            재생목록에 추가된 모든 곡은 AI로 만든 곡에 대한 책임은{' '}
            <span className="text-purple-300 font-medium">{playlist.userName}</span>님에게 있습니다
          </span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

        {/* YouTube Player — wrapper managed by React, inner div owned by YouTube */}
        <div className="aspect-video w-full bg-black" ref={playerWrapperRef} />

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{playlist.title}</h1>
            <p className="text-gray-400">
              by <span className="text-purple-300 font-medium">{playlist.userName}</span>
              <span className="mx-2 text-gray-600">·</span>
              <span className="text-sm">{new Date(playlist.createdAt).toLocaleDateString('ko-KR')}</span>
            </p>
          </div>

          <RatingStats stats={playlist.stats} />

          {/* Track List */}
          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-lg font-semibold mb-4">
              재생목록
              {tracks.length > 0 && (
                <span className="text-sm font-normal text-gray-400 ml-2">{tracks.length}곡</span>
              )}
            </h2>

            {tracksLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-sm">곡 목록을 불러오는 중...</span>
              </div>
            ) : tracks.length > 0 ? (
              <div className="space-y-1 max-h-[420px] overflow-y-auto">
                {tracks.map((track, i) => (
                  <TrackItem
                    key={track.videoId}
                    index={i}
                    track={track}
                    isActive={currentIndex === i}
                    onClick={() => {
                      ytPlayerRef.current?.playVideoAt(i)
                      setCurrentIndex(i)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-sm">
                <p>재생 버튼을 누르면 곡 목록이 표시됩니다</p>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-lg font-semibold mb-4">별점 평가</h2>
            {hasRated ? (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-3">내가 준 별점</p>
                <div className="flex justify-center"><StarRating value={myRating} readonly /></div>
                <p className="text-sm text-gray-500 mt-3">이미 평가하셨습니다 ✓</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">이 재생목록은 어떠셨나요?</p>
                <div className="flex justify-center mb-3">
                  <StarRating value={tempRating} onChange={handleRate} />
                </div>
                {ratingLoading
                  ? <p className="text-sm text-gray-500 mt-2">저장 중...</p>
                  : <p className="text-xs text-gray-500 mt-2">별을 클릭하여 평가해주세요</p>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
