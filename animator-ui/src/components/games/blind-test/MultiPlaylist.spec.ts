import { describe, it, expect } from 'vitest';
import { Playlist, Track } from '../../../core/domain/setup/types/playlist';

function combinePlaylists(selectedPlaylists: Playlist[]): Playlist | null {
  if (selectedPlaylists.length === 0) return null;

  const seenTracks = new Set<string>();
  const combinedTracks: Track[] = [];

  for (const pl of selectedPlaylists) {
    for (const track of pl.tracks) {
      const key = track.id || track.url;
      if (!seenTracks.has(key)) {
        seenTracks.add(key);
        combinedTracks.push(track);
      }
    }
  }

  return {
    id: selectedPlaylists.map(p => p.id).join('+'),
    name: selectedPlaylists.map(p => p.name).join(', '),
    type: selectedPlaylists[0]?.type || 'local',
    tracks: combinedTracks
  };
}

describe('Multi-playlist combination', () => {
  const pl1: Playlist = {
    id: 'pl-1',
    name: 'Années 80',
    type: 'local',
    tracks: [
      { id: 'track-1', title: 'Billie Jean', artist: 'Michael Jackson', year: 1982, url: '/music/1.mp3' },
      { id: 'track-2', title: 'Take On Me', artist: 'a-ha', year: 1985, url: '/music/2.mp3' }
    ]
  };

  const pl2: Playlist = {
    id: 'pl-2',
    name: 'Rock Classics',
    type: 'local',
    tracks: [
      { id: 'track-2', title: 'Take On Me (Duplicate in pl2)', artist: 'a-ha', year: 1985, url: '/music/2.mp3' },
      { id: 'track-3', title: 'Back in Black', artist: 'AC/DC', year: 1980, url: '/music/3.mp3' }
    ]
  };

  it('combines tracks from multiple playlists', () => {
    const combined = combinePlaylists([pl1, pl2]);
    expect(combined).not.toBeNull();
    expect(combined!.name).toBe('Années 80, Rock Classics');
    expect(combined!.tracks.length).toBe(3);
    expect(combined!.tracks.map(t => t.id)).toEqual(['track-1', 'track-2', 'track-3']);
  });

  it('returns null when no playlists are selected', () => {
    const combined = combinePlaylists([]);
    expect(combined).toBeNull();
  });
});
