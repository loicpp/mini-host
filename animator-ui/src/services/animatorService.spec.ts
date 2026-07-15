import { describe, it, expect, vi, beforeEach } from 'vitest';
import { animatorService } from './animatorService';

// Mock du module firebase local
vi.mock('../firebase', () => ({
  auth: {},
  db: {}
}));

// Mock de firebase/auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({ user: { uid: '123' } })
}));

// Mock du repository pour isoler le test du service
const { mockRepoInstance } = vi.hoisted(() => {
  return {
    mockRepoInstance: {
      createGame: vi.fn().mockResolvedValue({ gameId: 'TEST', secret: 'abc' }),
      getGame: vi.fn().mockResolvedValue({ status: 'playing' }),
      updateGameState: vi.fn(),
      listenToPlayers: vi.fn(),
      listenToBuzzer: vi.fn(),
      clearPlayerGuess: vi.fn(),
      clearCurrentBuzzer: vi.fn(),
      awardPoints: vi.fn(),
      deleteGame: vi.fn(),
      clearPlayerAnswers: vi.fn(),
      decrementBlockedTurns: vi.fn(),
      resetPlayers: vi.fn(),
      removePlayer: vi.fn(),
      setPlayerBlock: vi.fn()
    }
  };
});

vi.mock('../infrastructure/FirebaseGameRepository', () => {
  return {
    FirebaseGameRepository: class {
      constructor() {
        return mockRepoInstance;
      }
    }
  };
});

describe('animatorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signIn - calls Firebase auth correctly', async () => {
    const user = await animatorService.signIn('test@test.com', 'password');
    expect(user.uid).toBe('123');
  });

  it('createGame - delegates to repository', async () => {
    const result = await animatorService.createGame({ mode: 'buzzer' });
    expect(mockRepoInstance.createGame).toHaveBeenCalledWith({ mode: 'buzzer' });
    expect(result.gameId).toBe('TEST');
  });

  it('getGame - delegates to repository', async () => {
    const result = await animatorService.getGame('GAME_1');
    expect(mockRepoInstance.getGame).toHaveBeenCalledWith('GAME_1');
    expect(result.status).toBe('playing');
  });

  it('updateGameState - delegates to repository', async () => {
    await animatorService.updateGameState('GAME_1', 'finished', { title: 'Test' });
    expect(mockRepoInstance.updateGameState).toHaveBeenCalledWith('GAME_1', 'finished', { title: 'Test' });
  });

  it('other methods delegate properly', async () => {
    await animatorService.clearPlayerGuess('G1', 'P1');
    expect(mockRepoInstance.clearPlayerGuess).toHaveBeenCalledWith('G1', 'P1');

    await animatorService.clearCurrentBuzzer('G1');
    expect(mockRepoInstance.clearCurrentBuzzer).toHaveBeenCalledWith('G1');

    await animatorService.awardPoints('G1', 'P1', 10);
    expect(mockRepoInstance.awardPoints).toHaveBeenCalledWith('G1', 'P1', 10);

    await animatorService.deleteGame('G1');
    expect(mockRepoInstance.deleteGame).toHaveBeenCalledWith('G1');

    await animatorService.clearPlayerAnswers('G1');
    expect(mockRepoInstance.clearPlayerAnswers).toHaveBeenCalledWith('G1');

    await animatorService.decrementBlockedTurns('G1');
    expect(mockRepoInstance.decrementBlockedTurns).toHaveBeenCalledWith('G1');

    await animatorService.resetPlayers('G1');
    expect(mockRepoInstance.resetPlayers).toHaveBeenCalledWith('G1');

    await animatorService.removePlayer('G1', 'P1');
    expect(mockRepoInstance.removePlayer).toHaveBeenCalledWith('G1', 'P1');

    await animatorService.setPlayerBlock('G1', 'P1', 2);
    expect(mockRepoInstance.setPlayerBlock).toHaveBeenCalledWith('G1', 'P1', 2);
  });

  it('listener methods delegate properly', () => {
    const cb = vi.fn();
    animatorService.listenToPlayers('G1', cb);
    expect(mockRepoInstance.listenToPlayers).toHaveBeenCalledWith('G1', cb);

    animatorService.listenToBuzzer('G1', cb);
    expect(mockRepoInstance.listenToBuzzer).toHaveBeenCalledWith('G1', cb);
  });
});
