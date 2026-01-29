/**
 * YouTube Utilities
 * Functions to extract video information from YouTube URLs
 */

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch YouTube video title using our API route
 * This avoids CORS issues by fetching from the server side
 */
export async function fetchYouTubeVideoTitle(url: string): Promise<string | null> {
  try {
    if (!url) return null;

    // Use our API route to fetch the title
    const response = await fetch(`/api/youtube/title?url=${encodeURIComponent(url)}`);
    if (!response.ok) return null;

    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error('Error fetching YouTube video title:', error);
    return null;
  }
}

/**
 * Get a display-friendly title for YouTube video
 * Returns the fetched title or a fallback
 */
export async function getYouTubeDisplayTitle(url: string, fallback: string = 'Música Especial'): Promise<string> {
  const title = await fetchYouTubeVideoTitle(url);
  return title || fallback;
}
