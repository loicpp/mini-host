import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localBackendService, GameHistoryEntry } from './localBackendService';

describe('localBackendService history', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('saveHistoryEntry sends POST to /api/history', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' })
    });
    global.fetch = mockFetch;

    const entry: GameHistoryEntry = {
      id: 'GAME123',
      endedAt: '2026-10-23T12:00:00.000Z',
      players: [
        { position: 1, name: 'Alice', score: 10 },
        { position: 2, name: 'Bob', score: 8 }
      ]
    };

    const success = await localBackendService.saveHistoryEntry(entry);
    expect(success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/history'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    );
  });

  it('loadHistory sends GET to /api/history and returns entries', async () => {
    const fakeHistory: GameHistoryEntry[] = [
      {
        id: 'GAME_A',
        endedAt: '2026-10-23T14:00:00.000Z',
        players: [{ position: 1, name: 'Charlie', score: 25 }]
      }
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeHistory
    });
    global.fetch = mockFetch;

    const data = await localBackendService.loadHistory();
    expect(data).toEqual(fakeHistory);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/history'));
  });

  it('loadHistory returns empty array on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));
    const data = await localBackendService.loadHistory();
    expect(data).toEqual([]);
  });
});
