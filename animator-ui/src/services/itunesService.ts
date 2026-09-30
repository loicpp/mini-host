export const itunesService = {
  async search(query: string) {
    if (!query || query.length < 2) return [];
    
    try {
      // We use the iTunes Search API. It's free and requires no auth.
      // media=music restricts results to songs.
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.results) return [];

      // Extract unique combinations of track and artist
      const results: {title: string, artist: string, year?: number, coverUrl: string}[] = [];
      const seen = new Set();
      
      for (const item of data.results) {
        const title = item.trackName;
        const artist = item.artistName;
        const key = `${title}-${artist}`.toLowerCase();
        
        if (!seen.has(key)) {
          seen.add(key);
          const parsedYear = item.releaseDate && typeof item.releaseDate === 'string'
            ? parseInt(item.releaseDate.substring(0, 4), 10)
            : undefined;
          const year = parsedYear && !isNaN(parsedYear) ? parsedYear : undefined;

          results.push({
            title,
            artist,
            year,
            coverUrl: item.artworkUrl60 || item.artworkUrl100
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error("iTunes API error:", error);
      return [];
    }
  }
};
