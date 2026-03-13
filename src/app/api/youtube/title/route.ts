import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';

/**
 * API Route to fetch YouTube video title
 * This avoids CORS issues by fetching from the server side
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Use YouTube oEmbed API (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video information' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      title: data.title || 'Música Especial',
      author: data.author_name || '',
      thumbnail: data.thumbnail_url || ''
    });
  } catch (error) {
    console.error('Error fetching YouTube video title:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
