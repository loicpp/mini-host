import { describe, it, expect } from 'vitest';
import { Playlist, Track } from '../../../core/domain/setup/types/playlist';

const normalizeTrackKey = (track: { title?: string; artist?: string; url?: string; id?: string }) => {
  const cleanTitle = (track.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const cleanArtist = (track.artist || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/artiste inconnu/g, '')
    .replace(/unknown artist/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  return { cleanTitle, cleanArtist };
};

const isDuplicateTrack = (t1: Track, t2: Track): boolean => {
  if (t1.url && t2.url && t1.url === t2.url) return true;
  if (t1.id && t2.id && t1.id === t2.id) return true;

  const k1 = normalizeTrackKey(t1);
  const k2 = normalizeTrackKey(t2);

  if (k1.cleanTitle && k1.cleanTitle === k2.cleanTitle) {
    if (k1.cleanArtist && k2.cleanArtist) {
      return k1.cleanArtist === k2.cleanArtist;
    }
    return true;
  }

  return false;
};

const getCombinedUniqueTracks = (playlistsToCombine: Playlist[]): Track[] => {
  const combinedTracks: Track[] = [];

  for (const pl of playlistsToCombine) {
    for (const track of pl.tracks) {
      const alreadyExists = combinedTracks.some(existing => isDuplicateTrack(existing, track));
      if (!alreadyExists) {
        combinedTracks.push(track);
      }
    }
  }

  return combinedTracks;
};

function combinePlaylists(selectedPlaylists: Playlist[]): Playlist | null {
  if (selectedPlaylists.length === 0) return null;

  const combinedTracks = getCombinedUniqueTracks(selectedPlaylists);

  return {
    id: selectedPlaylists.map(p => p.id).join('+'),
    name: selectedPlaylists.map(p => p.name).join(', '),
    type: selectedPlaylists[0]?.type || 'local',
    tracks: combinedTracks
  };
}

describe('Multi-playlist combination & duplicate detection', () => {
  const pl1: Playlist = {
    id: 'pl-1',
    name: 'Années 80',
    type: 'local',
    tracks: [
      { id: 'track-1', title: 'Billie Jean', artist: 'Michael Jackson', year: 1982, url: '/music/1.mp3' },
      { id: 'track-2', title: 'Take On Me', artist: 'a-ha', year: 1985, url: '/music/2.mp3' },
      { id: 'track-3', title: 'Eye of the Tiger', artist: 'Survivor', year: 1982, url: '/music/3.mp3' }
    ]
  };

  const pl2: Playlist = {
    id: 'pl-2',
    name: 'Rock Classics',
    type: 'local',
    tracks: [
      // Duplicate by ID/URL
      { id: 'track-2', title: 'Take On Me', artist: 'a-ha', year: 1985, url: '/music/2.mp3' },
      // Duplicate by Title & Artist (even with different ID and URL)
      { id: 'diff-id-99', title: 'Eye of the Tiger (Remastered)', artist: 'Survivor', url: '/other/survivor.mp3' },
      // Unique track
      { id: 'track-4', title: 'Back in Black', artist: 'AC/DC', year: 1980, url: '/music/4.mp3' }
    ]
  };

  it('combines tracks from multiple playlists with duplicate detection', () => {
    const combined = combinePlaylists([pl1, pl2]);
    expect(combined).not.toBeNull();
    expect(combined!.name).toBe('Années 80, Rock Classics');
    expect(combined!.tracks.length).toBe(4);
    expect(combined!.tracks.map(t => t.id)).toEqual(['track-1', 'track-2', 'track-3', 'track-4']);
  });

  it('detects duplicate when artist is Artiste Inconnu in one playlist', () => {
    const plA: Playlist = {
      id: 'pl-a',
      name: 'Playlist A',
      type: 'local',
      tracks: [{ id: 'a1', title: 'Wonderwall', artist: 'Oasis', url: '/oasis.mp3' }]
    };
    const plB: Playlist = {
      id: 'pl-b',
      name: 'Playlist B',
      type: 'local',
      tracks: [{ id: 'b1', title: 'Wonderwall', artist: 'Artiste Inconnu', url: '/wonderwall.mp3' }]
    };
    const combined = combinePlaylists([plA, plB]);
    expect(combined!.tracks.length).toBe(1);
    expect(combined!.tracks[0].title).toBe('Wonderwall');
  });

  it('returns null when no playlists are selected', () => {
    const combined = combinePlaylists([]);
    expect(combined).toBeNull();
  });
});
