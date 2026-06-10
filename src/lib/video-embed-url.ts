/**
 * Convert video URLs to embeddable format
 */
export function getEmbedUrl(videoUrl: string): string {
  if (!videoUrl) return '';

  // Convert Loom share URL to embed URL
  if (videoUrl.includes('loom.com/share/')) {
    const id = videoUrl.split('loom.com/share/')[1]?.split('?')[0];
    if (id) {
      return `https://www.loom.com/embed/${id}`;
    }
  }

  // Convert YouTube share URL to embed URL
  if (videoUrl.includes('youtu.be/')) {
    const id = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    if (id) {
      return `https://www.youtube.com/embed/${id}`;
    }
  }

  // YouTube already in embed format
  if (videoUrl.includes('youtube.com/embed/')) {
    return videoUrl;
  }

  // YouTube watch URL to embed
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const id = videoUrl.split('v=')[1]?.split('&')[0];
    if (id) {
      return `https://www.youtube.com/embed/${id}`;
    }
  }

  // Vimeo
  if (videoUrl.includes('vimeo.com/')) {
    const id = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (id) {
      return `https://player.vimeo.com/video/${id}`;
    }
  }

  // If already an embed URL or other format, return as-is
  return videoUrl;
}
