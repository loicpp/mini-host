import { describe, it, expect, beforeEach } from 'vitest';
import { ref } from 'vue';
import type { Track } from '../../../services/music/MusicProvider';

describe('BlindTest random music selection logic', () => {
  const localTracks = ref<Track[]>([]);
  const playedTracks = ref<string[]>([]);
  const selectedTrack = ref<Track | null>(null);

  beforeEach(() => {
    localTracks.value = [
      { id: 'track-1', title: 'Song 1', artist: 'Artist 1', duration: 30000, source: 'local' },
      { id: 'track-2', title: 'Song 2', artist: 'Artist 2', duration: 30000, source: 'local' },
      { id: 'track-3', title: 'Song 3', artist: 'Artist 3', duration: 30000, source: 'local' },
    ];
    playedTracks.value = [];
    selectedTrack.value = null;
  });

  const pickRandomTrack = () => {
    if (!localTracks.value || localTracks.value.length === 0) return null;
    const unplayed = localTracks.value.filter(t => !playedTracks.value.includes(t.id));
    const pool = unplayed.length > 0 ? unplayed : localTracks.value;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  it('picks only from unplayed tracks when some tracks are played', () => {
    playedTracks.value = ['track-1', 'track-3'];
    const chosen = pickRandomTrack();
    expect(chosen?.id).toBe('track-2');
  });

  it('picks from all tracks if all tracks have been played', () => {
    playedTracks.value = ['track-1', 'track-2', 'track-3'];
    const chosen = pickRandomTrack();
    expect(chosen).not.toBeNull();
    expect(['track-1', 'track-2', 'track-3']).toContain(chosen?.id);
  });

  it('returns null if there are no local tracks', () => {
    localTracks.value = [];
    const chosen = pickRandomTrack();
    expect(chosen).toBeNull();
  });
});
