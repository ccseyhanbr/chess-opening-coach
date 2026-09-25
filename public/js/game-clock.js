const SECONDS_PER_HOUR = 3600;

export function formatElapsed(ms) {
  const totalSeconds = Math.floor(Math.max(0, Number.isFinite(ms) ? ms : 0) / 1000);
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / 60);
  const seconds = totalSeconds % 60;
  const pair = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pair(minutes)}:${pair(seconds)}` : `${pair(minutes)}:${pair(seconds)}`;
}

// Count-up clocks for both sides and the whole game. Elapsed time is always derived from
// timestamps (accumulated milliseconds plus now() - lastStart), never from counted ticks.
// Sides use chess.js turn notation: "w" for White and "b" for Black.
export function createGameClock({ now = Date.now } = {}) {
  let accumulated = { w: 0, b: 0, total: 0 };
  let running = null;
  let lastStart = 0;
  let started = false;

  function settle() {
    if (!running) return;
    const current = now();
    const delta = Math.max(0, current - lastStart);
    accumulated[running] += delta;
    accumulated.total += delta;
    lastStart = current;
  }

  return {
    // First legal move of a game: start the total clock and the clock of the side that moves next.
    start(side) {
      if (started || (side !== "w" && side !== "b")) return;
      started = true;
      running = side;
      lastStart = now();
    },
    // Stop the mover's clock and start the opponent's. Ignored before start and after stop.
    switch() {
      if (!running) return;
      settle();
      running = running === "w" ? "b" : "w";
    },
    // Freeze all three clocks, keeping their values. Stays frozen until reset.
    stop() {
      settle();
      running = null;
    },
    reset() {
      accumulated = { w: 0, b: 0, total: 0 };
      running = null;
      lastStart = 0;
      started = false;
    },
    isStarted: () => started,
    read() {
      const pending = running ? Math.max(0, now() - lastStart) : 0;
      return {
        white: accumulated.w + (running === "w" ? pending : 0),
        black: accumulated.b + (running === "b" ? pending : 0),
        total: accumulated.total + pending,
        running
      };
    }
  };
}
