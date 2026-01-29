import { isValidYouTubeUrl, youtubeUrlSchema } from '../message';

describe('YouTube URL Validation', () => {
  describe('isValidYouTubeUrl', () => {
    it('should accept youtube.com/watch?v= format', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('should accept youtu.be format', () => {
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('http://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('should accept youtube.com/embed format', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('http://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });

    it('should reject invalid YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://vimeo.com/123456')).toBe(false);
      expect(isValidYouTubeUrl('https://www.google.com')).toBe(false);
      expect(isValidYouTubeUrl('not a url')).toBe(false);
      expect(isValidYouTubeUrl('')).toBe(false);
      expect(isValidYouTubeUrl('https://youtube.com')).toBe(false);
    });

    it('should handle URLs with additional parameters', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe(true);
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLxyz')).toBe(true);
      // Test the specific URL that was causing issues
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=59GM_xjPhco&list=RD59GM_xjPhco&start_radio=1')).toBe(true);
    });
  });

  describe('youtubeUrlSchema', () => {
    it('should validate valid YouTube URLs', () => {
      const result = youtubeUrlSchema.safeParse('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.success).toBe(true);
    });

    it('should reject invalid YouTube URLs with error message', () => {
      const result = youtubeUrlSchema.safeParse('https://vimeo.com/123456');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid YouTube URL format');
      }
    });
  });
});
