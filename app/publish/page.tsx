'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const AI_TOOLS = ['Suno', 'Udio', 'ChatGPT', 'Gemini', '기타']

function AiToolSelector({
  label,
  value,
  customValue,
  onSelect,
  onCustomChange,
  error,
}: {
  label: string
  value: string
  customValue: string
  onSelect: (v: string) => void
  onCustomChange: (v: string) => void
  error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">{label}</label>
      <div className="flex flex-wrap gap-2">
        {AI_TOOLS.map(tool => (
          <button
            key={tool}
            type="button"
            onClick={() => onSelect(tool)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              value === tool
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white'
            }`}
          >
            {tool}
          </button>
        ))}
      </div>
      {value === '기타' && (
        <input
          type="text"
          value={customValue}
          onChange={e => onCustomChange(e.target.value)}
          placeholder="사용한 AI 서비스 이름을 직접 입력해주세요"
          className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
        />
      )}
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  )
}

function AgreementField({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: 'yes' | 'no' | ''
  onChange: (v: 'yes' | 'no') => void
  error?: string
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <p className="text-sm text-gray-200 mb-3 leading-relaxed">{label}</p>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={label}
            checked={value === 'yes'}
            onChange={() => onChange('yes')}
            className="accent-purple-500 w-4 h-4 cursor-pointer"
          />
          <span className={`text-sm font-medium ${value === 'yes' ? 'text-purple-300' : 'text-gray-400'} group-hover:text-white transition-colors`}>
            예
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={label}
            checked={value === 'no'}
            onChange={() => onChange('no')}
            className="accent-red-500 w-4 h-4 cursor-pointer"
          />
          <span className={`text-sm font-medium ${value === 'no' ? 'text-red-400' : 'text-gray-400'} group-hover:text-white transition-colors`}>
            아니오
          </span>
        </label>
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default function PublishPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [title, setTitle] = useState('')
  const [playlistUrl, setPlaylistUrl] = useState('')

  const [composingTool, setComposingTool] = useState('')
  const [composingToolCustom, setComposingToolCustom] = useState('')
  const [lyricsTool, setLyricsTool] = useState('')
  const [lyricsToolCustom, setLyricsToolCustom] = useState('')

  const [agreeAI, setAgreeAI] = useState<'yes' | 'no' | ''>('')
  const [agreeResponsibility, setAgreeResponsibility] = useState<'yes' | 'no' | ''>('')
  const [agreeAIError, setAgreeAIError] = useState('')
  const [agreeRespError, setAgreeRespError] = useState('')

  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const finalComposingTool = composingTool === '기타' ? composingToolCustom.trim() : composingTool
    const finalLyricsTool = lyricsTool === '기타' ? lyricsToolCustom.trim() : lyricsTool

    // Validate tool fields
    if (!composingTool) {
      setError('작곡/편곡에 사용한 AI Tool을 선택해주세요.')
      return
    }
    if (composingTool === '기타' && !finalComposingTool) {
      setError('작곡/편곡에 사용한 AI Tool 이름을 입력해주세요.')
      return
    }
    if (!lyricsTool) {
      setError('작사에 사용한 AI Tool을 선택해주세요.')
      return
    }
    if (lyricsTool === '기타' && !finalLyricsTool) {
      setError('작사에 사용한 AI Tool 이름을 입력해주세요.')
      return
    }

    // Validate agreements
    let hasAgreementError = false
    if (agreeAI !== 'yes') {
      setAgreeAIError('동의해주셔야 등록이 됩니다')
      hasAgreementError = true
    } else {
      setAgreeAIError('')
    }
    if (agreeResponsibility !== 'yes') {
      setAgreeRespError('동의해주셔야 등록이 됩니다')
      hasAgreementError = true
    } else {
      setAgreeRespError('')
    }
    if (hasAgreementError) return

    setLoading(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          title,
          playlistUrl,
          composingTool: finalComposingTool,
          lyricsTool: finalLyricsTool,
          comment: comment.trim() || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
        return
      }
      router.push(`/playlist/${data.id}`)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
          ← 홈으로
        </Link>
        <h1 className="text-2xl font-bold">재생목록 퍼블리시</h1>
        <p className="text-gray-400 mt-1">AI로 만든 음악이 담긴 유튜브 재생목록을 공유해보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        {/* 기본 정보 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">닉네임</label>
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="예: AI음악러버"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">재생목록 제목</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="예: AI가 만든 감성 팝 모음"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">유튜브 재생목록 주소</label>
          <input
            type="url"
            value={playlistUrl}
            onChange={e => setPlaylistUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=..."
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">유튜브 재생목록 페이지의 전체 주소를 붙여넣으세요</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            나의 한마디 <span className="text-gray-500 font-normal">(선택)</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, 100))}
            placeholder="이 재생목록을 한 줄로 소개해주세요"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{comment.length}/100</p>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-800 pt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">AI Tool 정보</p>

          <div className="space-y-5">
            <AiToolSelector
              label="재생목록에 등록된 곡을 작곡/편곡하는데 사용한 AI Tool은 무엇입니까?"
              value={composingTool}
              customValue={composingToolCustom}
              onSelect={setComposingTool}
              onCustomChange={setComposingToolCustom}
            />

            <AiToolSelector
              label="재생목록에 등록된 곡을 작사하는데 사용한 AI Tool은 무엇입니까?"
              value={lyricsTool}
              customValue={lyricsToolCustom}
              onSelect={setLyricsTool}
              onCustomChange={setLyricsToolCustom}
            />
          </div>
        </div>

        {/* 동의 항목 */}
        <div className="border-t border-gray-800 pt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">동의 항목</p>

          <div className="space-y-3">
            <AgreementField
              label="재생목록에 추가된 모든 곡은 AI로 만든 곡임을 동의합니다"
              value={agreeAI}
              onChange={v => { setAgreeAI(v); setAgreeAIError('') }}
              error={agreeAIError}
            />

            <AgreementField
              label="이 서비스에 등록한 곡에 대한 책임은 모두 업로드한 유저에게 있음을 동의합니다"
              value={agreeResponsibility}
              onChange={v => { setAgreeResponsibility(v); setAgreeRespError('') }}
              error={agreeRespError}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed transition-colors py-3 rounded-lg font-medium"
        >
          {loading ? '게시 중...' : '재생목록 퍼블리시하기'}
        </button>
      </form>
    </div>
  )
}
