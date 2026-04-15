import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to search YouTube videos
 * Scrapes YouTube search results page directly - no API key needed
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required (min 2 chars)' },
        { status: 400 }
      );
    }

    const searchQuery = encodeURIComponent(query.trim());

    // Fetch YouTube search page
    const response = await fetch(
      `https://www.youtube.com/results?search_query=${searchQuery}&sp=EgIQAQ%3D%3D`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const html = await response.text();

    // Extract ytInitialData JSON from the page
    const dataMatch = html.match(/var ytInitialData\s*=\s*({.+?});\s*<\/script>/s);
    if (!dataMatch) {
      return NextResponse.json({ results: [] });
    }

    let ytData;
    try {
      ytData = JSON.parse(dataMatch[1]);
    } catch {
      return NextResponse.json({ results: [] });
    }

    // Navigate the YouTube data structure to find video results
    const contents = ytData
      ?.contents
      ?.twoColumnSearchResultsRenderer
      ?.primaryContents
      ?.sectionListRenderer
      ?.contents;

    if (!contents || !Array.isArray(contents)) {
      return NextResponse.json({ results: [] });
    }

    const results: YouTubeSearchResult[] = [];

    for (const section of contents) {
      const items = section?.itemSectionRenderer?.contents;
      if (!items || !Array.isArray(items)) continue;

      for (const item of items) {
        const video = item?.videoRenderer;
        if (!video || !video.videoId) continue;

        // Extract duration text
        const durationText = video.lengthText?.simpleText || '';

        // Skip very long videos (likely not music)
        // and live streams (no duration)
        if (!durationText) continue;

        const title = video.title?.runs?.[0]?.text || '';
        const author = video.ownerText?.runs?.[0]?.text || '';
        const thumbnail =
          video.thumbnail?.thumbnails?.[video.thumbnail.thumbnails.length - 1]?.url || '';

        results.push({
          videoId: video.videoId,
          title,
          author,
          thumbnail,
          duration: durationText,
        });

        if (results.length >= 8) break;
      }
      if (results.length >= 8) break;
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return NextResponse.json(
      { error: 'Failed to search videos' },
      { status: 500 }
    );
  }
}

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: string;
}
