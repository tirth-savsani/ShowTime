/**
 * Extracts and converts YouTube URLs to embed format with autoplay.
 * Supports:
 * - youtube.com/watch?v=ID
 * - youtu.be/ID
 * - youtube.com/shorts/ID
 * - youtube.com/embed/ID
 * Returns null if not a recognized YouTube URL.
 */
export const getYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  try {
    const trimmed = url.trim();
    // In case no protocol was provided
    const validUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    const parsed = new URL(validUrl);

    // youtu.be/<id>
    if (parsed.hostname === 'youtu.be' || parsed.hostname.endsWith('.youtu.be')) {
      const videoId = parsed.pathname.replace(/^\//, '').split('/')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }

    // youtube.com
    if (parsed.hostname.includes('youtube.com')) {
      // /shorts/<id>
      if (parsed.pathname.startsWith('/shorts/')) {
        const videoId = parsed.pathname.split('/')[2];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
      }

      // /embed/<id>
      if (parsed.pathname.startsWith('/embed/')) {
        const videoId = parsed.pathname.split('/')[2];
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
      }

      // /watch?v=<id>
      const v = parsed.searchParams.get('v');
      if (v) {
        return `https://www.youtube.com/embed/${v}?autoplay=1`;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export default getYoutubeEmbedUrl;
