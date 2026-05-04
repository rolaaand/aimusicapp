export function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('list')
  } catch {
    return null
  }
}

export function getEmbedUrl(playlistId: string): string {
  return `https://www.youtube.com/embed/videoseries?list=${playlistId}`
}
