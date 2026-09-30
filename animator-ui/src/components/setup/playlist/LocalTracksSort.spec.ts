import { describe, it, expect } from 'vitest';
import { Track } from '../../../services/music/MusicProvider';

function sortTracks(
  tracks: Track[],
  originalTracks: Track[],
  trackSort: 'artist' | 'title' | 'year' | 'playlist',
  sortDirection: 'asc' | 'desc'
): Track[] {
  const result = [...tracks];
  const originalIndexMap = new Map<string, number>();
  originalTracks.forEach((track, index) => {
    if (track.id) {
      originalIndexMap.set(track.id, index);
    }
  });

  result.sort((a, b) => {
    if (trackSort === 'playlist') {
      const indexA = originalIndexMap.get(a.id || '') ?? 0;
      const indexB = originalIndexMap.get(b.id || '') ?? 0;
      return sortDirection === 'asc' ? indexA - indexB : indexB - indexA;
    }

    if (trackSort === 'year') {
      const yearA = a.year;
      const yearB = b.year;

      if (yearA === undefined && yearB === undefined) {
        return a.title.localeCompare(b.title);
      }
      if (yearA === undefined) return 1;
      if (yearB === undefined) return -1;

      if (yearA !== yearB) {
        return sortDirection === 'asc' ? yearA - yearB : yearB - yearA;
      }
      return a.title.localeCompare(b.title);
    }

    const field = trackSort === 'title' ? 'title' : 'artist';
    const secondaryField = field === 'title' ? 'artist' : 'title';

    const valA = (a[field] || '').trim();
    const valB = (b[field] || '').trim();

    if (!valA && !valB) return 0;
    if (!valA) return 1;
    if (!valB) return -1;

    const comp = sortDirection === 'asc'
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);

    if (comp !== 0) return comp;

    const secA = (a[secondaryField] || '').trim();
    const secB = (b[secondaryField] || '').trim();
    return sortDirection === 'asc'
      ? secA.localeCompare(secB)
      : secB.localeCompare(secA);
  });

  return result;
}

describe('Track sorting logic in game', () => {
  const sampleTracks: Track[] = [
    { id: '1', title: 'Waterloo', artist: 'ABBA', year: 1974, duration: 180, source: 'local' },
    { id: '2', title: 'Highway to Hell', artist: 'AC/DC', year: 1979, duration: 200, source: 'local' },
    { id: '3', title: '[Bonus] Song', artist: 'Daft Punk', duration: 150, source: 'local' },
    { id: '4', title: 'One More Time', artist: '*** Star ***', year: 2000, duration: 220, source: 'local' },
    { id: '5', title: 'Bad', artist: 'Michael Jackson', year: 1987, duration: 240, source: 'local' },
    { id: '6', title: '#Special Track', artist: 'Zebda', duration: 190, source: 'local' },
  ];

  it('sorts by playlist order', () => {
    const asc = sortTracks(sampleTracks, sampleTracks, 'playlist', 'asc');
    expect(asc.map(t => t.id)).toEqual(['1', '2', '3', '4', '5', '6']);

    const desc = sortTracks(sampleTracks, sampleTracks, 'playlist', 'desc');
    expect(desc.map(t => t.id)).toEqual(['6', '5', '4', '3', '2', '1']);
  });

  it('sorts by year with missing years at bottom', () => {
    const asc = sortTracks(sampleTracks, sampleTracks, 'year', 'asc');
    expect(asc[0].year).toBe(1974);
    expect(asc[1].year).toBe(1979);
    expect(asc[2].year).toBe(1987);
    expect(asc[3].year).toBe(2000);
    expect(asc[4].year).toBeUndefined();
    expect(asc[5].year).toBeUndefined();

    const desc = sortTracks(sampleTracks, sampleTracks, 'year', 'desc');
    expect(desc[0].year).toBe(2000);
    expect(desc[1].year).toBe(1987);
    expect(desc[2].year).toBe(1979);
    expect(desc[3].year).toBe(1974);
    expect(desc[4].year).toBeUndefined();
    expect(desc[5].year).toBeUndefined();
  });

  it('sorts by title with symbols at top in asc, and at bottom in desc', () => {
    const asc = sortTracks(sampleTracks, sampleTracks, 'title', 'asc');
    // Symbols at top in asc: '[Bonus] Song' and '#Special Track'
    expect(asc[0].title).toBe('[Bonus] Song');
    expect(asc[1].title).toBe('#Special Track');
    expect(asc[2].title).toBe('Bad');
    expect(asc[3].title).toBe('Highway to Hell');
    expect(asc[4].title).toBe('One More Time');
    expect(asc[5].title).toBe('Waterloo');

    const desc = sortTracks(sampleTracks, sampleTracks, 'title', 'desc');
    // Symbols at bottom in desc: Waterloo down to Bad, then '#Special Track' and '[Bonus] Song'
    expect(desc[0].title).toBe('Waterloo');
    expect(desc[1].title).toBe('One More Time');
    expect(desc[2].title).toBe('Highway to Hell');
    expect(desc[3].title).toBe('Bad');
    expect(desc[4].title).toBe('#Special Track');
    expect(desc[5].title).toBe('[Bonus] Song');
  });

  it('sorts by artist with symbols at top in asc, and at bottom in desc', () => {
    const asc = sortTracks(sampleTracks, sampleTracks, 'artist', 'asc');
    // Symbols at top in asc: '*** Star ***'
    expect(asc[0].artist).toBe('*** Star ***');
    expect(asc[1].artist).toBe('ABBA');
    expect(asc[2].artist).toBe('AC/DC');
    expect(asc[3].artist).toBe('Daft Punk');
    expect(asc[4].artist).toBe('Michael Jackson');
    expect(asc[5].artist).toBe('Zebda');

    const desc = sortTracks(sampleTracks, sampleTracks, 'artist', 'desc');
    // Symbols at bottom in desc: Zebda down to ABBA, then '*** Star ***'
    expect(desc[0].artist).toBe('Zebda');
    expect(desc[1].artist).toBe('Michael Jackson');
    expect(desc[2].artist).toBe('Daft Punk');
    expect(desc[3].artist).toBe('AC/DC');
    expect(desc[4].artist).toBe('ABBA');
    expect(desc[5].artist).toBe('*** Star ***');
  });
});
