import { db } from '../firebase';
import { ref as dbRef, update } from 'firebase/database';

let timeouts: ReturnType<typeof setTimeout>[] = [];

export const tutorialMockService = {
  async addFakePlayers(gameId: string) {
    const playersRef = dbRef(db, `games/${gameId}/players`);
    await update(playersRef, {
      'fake-player-1': {
        name: 'Alice',
        score: 0,
      },
      'fake-player-2': {
        name: 'Bob',
        score: 0,
      }
    });
    // Update score after creation to pass Firebase validation (score == 0 for new players)
    await update(playersRef, {
      'fake-player-1/score': 3.5,
      'fake-player-2/score': 4,
    });
  },

  async simulateAnswers(gameId: string, correctTrack?: any) {
    const playersRef = dbRef(db, `games/${gameId}/players`);
    
    timeouts.forEach(clearTimeout);
    timeouts = [];
    
    // Simulate Alice answering after 3 seconds
    const t1 = setTimeout(async () => {
      await update(playersRef, {
        'fake-player-1/currentGuess': {
          title: correctTrack && correctTrack.title ? correctTrack.title : 'Crab Rave',
          artist: correctTrack && correctTrack.artist ? correctTrack.artist : 'Noisestorm',
          submittedAt: Date.now()
        }
      });
    }, 3125);
    timeouts.push(t1);

    // Simulate Bob pressing buzzer or answering after 5 seconds
    const t2 = setTimeout(async () => {
      await update(playersRef, {
        'fake-player-2/currentGuess': {
          title: 'Sandstorm',
          artist: 'Darude',
          submittedAt: Date.now()
        }
      });
    }, 8782);
    timeouts.push(t2);
  },

  async clearAnswers(gameId: string) {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    const playersRef = dbRef(db, `games/${gameId}/players`);
    await update(playersRef, {
      'fake-player-1/currentGuess': null,
      'fake-player-2/currentGuess': null,
    });
  },

  async fastForwardAnswers(gameId: string, correctTrack?: any) {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    const playersRef = dbRef(db, `games/${gameId}/players`);
    await update(playersRef, {
      'fake-player-1/currentGuess': {
        title: correctTrack && correctTrack.title ? correctTrack.title : 'Crab Rave',
        artist: correctTrack && correctTrack.artist ? correctTrack.artist : 'Noisestorm',
        submittedAt: Date.now()
      },
      'fake-player-2/currentGuess': {
        title: 'Sandstorm',
        artist: 'Darude',
        submittedAt: Date.now()
      }
    });
  }
};
