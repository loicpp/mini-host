import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameTimer } from './useGameTimer';

describe('useGameTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default values', () => {
    const { isBuffering, isDelaying, timeLeft, delayTimeLeft } = useGameTimer(() => 0);
    expect(isBuffering.value).toBe(false);
    expect(isDelaying.value).toBe(false);
    expect(timeLeft.value).toBe(0);
    expect(delayTimeLeft.value).toBe(0);
  });

  it('handles buffering state if start time is in the future', () => {
    const mockTime = 1000;
    const { isBuffering, timeLeft, startTimer } = useGameTimer(() => mockTime);
    
    // Start time in 5000ms
    startTimer(6000, 30000, 0);
    
    expect(isBuffering.value).toBe(true);
    expect(timeLeft.value).toBe(30); // 30000ms -> 30s
  });

  it('decrements time properly and stops at 0', () => {
    let currentTime = 1000;
    const { timeLeft, startTimer } = useGameTimer(() => currentTime);
    
    startTimer(1000, 10000, 0); // 10s duration
    expect(timeLeft.value).toBe(10);
    
    // Fast forward 5s
    currentTime = 6000;
    vi.advanceTimersByTime(100); // trigger the interval
    expect(timeLeft.value).toBe(5);
    
    // Fast forward to end
    currentTime = 11000;
    vi.advanceTimersByTime(100);
    expect(timeLeft.value).toBe(0);
  });
  
  it('handles delay block correctly', () => {
    let currentTime = 1000;
    const { isDelaying, delayTimeLeft, timeLeft, startTimer } = useGameTimer(() => currentTime);
    
    // 10s duration, 3s block delay
    startTimer(1000, 10000, 3000);
    
    expect(isDelaying.value).toBe(true);
    expect(delayTimeLeft.value).toBe(3);
    
    // Fast forward 2s
    currentTime = 3000;
    vi.advanceTimersByTime(100);
    expect(isDelaying.value).toBe(true);
    expect(delayTimeLeft.value).toBe(1);
    
    // Fast forward past delay
    currentTime = 4000;
    vi.advanceTimersByTime(100);
    expect(isDelaying.value).toBe(false);
    expect(delayTimeLeft.value).toBe(0);
    expect(timeLeft.value).toBe(7);
  });
});
