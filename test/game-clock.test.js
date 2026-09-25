import assert from "node:assert/strict";
import test from "node:test";
import { createGameClock, formatElapsed } from "../public/js/game-clock.js";

function fixture() {
  let time = 1_000_000;
  const clock = createGameClock({ now: () => time });
  return { clock, advance: (ms) => { time += ms; } };
}

test("all clocks read zero and are not running before the first move", () => {
  const { clock, advance } = fixture();
  advance(45_000);
  assert.deepEqual(clock.read(), { white: 0, black: 0, total: 0, running: null });
  assert.equal(clock.isStarted(), false);
  clock.switch();
  advance(1_000);
  assert.deepEqual(clock.read(), { white: 0, black: 0, total: 0, running: null });
});

test("start runs the total clock and the clock of the side to move next", () => {
  const { clock, advance } = fixture();
  clock.start("b");
  advance(2_500);
  assert.deepEqual(clock.read(), { white: 0, black: 2_500, total: 2_500, running: "b" });
  clock.start("w");
  assert.equal(clock.read().running, "b", "a second start is ignored");
});

test("switch hands time to the opponent while the total clock runs continuously", () => {
  const { clock, advance } = fixture();
  clock.start("b");
  advance(4_000);
  clock.switch();
  advance(3_000);
  assert.deepEqual(clock.read(), { white: 3_000, black: 4_000, total: 7_000, running: "w" });
  clock.switch();
  advance(1_000);
  assert.deepEqual(clock.read(), { white: 3_000, black: 5_000, total: 8_000, running: "b" });
});

test("stop freezes all three clocks and keeps their values", () => {
  const { clock, advance } = fixture();
  clock.start("b");
  advance(5_000);
  clock.switch();
  advance(2_000);
  clock.stop();
  const frozen = { white: 2_000, black: 5_000, total: 7_000, running: null };
  assert.deepEqual(clock.read(), frozen);
  advance(60_000);
  clock.switch();
  clock.start("w");
  advance(60_000);
  assert.deepEqual(clock.read(), frozen);
});

test("reset returns every clock to zero and stops them until the next first move", () => {
  const { clock, advance } = fixture();
  clock.start("b");
  advance(9_000);
  clock.reset();
  assert.deepEqual(clock.read(), { white: 0, black: 0, total: 0, running: null });
  advance(9_000);
  assert.deepEqual(clock.read(), { white: 0, black: 0, total: 0, running: null });
  clock.start("b");
  advance(1_000);
  assert.deepEqual(clock.read(), { white: 0, black: 1_000, total: 1_000, running: "b" });
});

test("values come from timestamps, so a long gap without reads stays accurate", () => {
  const { clock, advance } = fixture();
  clock.start("b");
  advance(31_250);
  clock.switch();
  advance(95_000);
  assert.deepEqual(clock.read(), { white: 95_000, black: 31_250, total: 126_250, running: "w" });
  advance(3_600_000);
  assert.equal(clock.read().total, 3_726_250);
});

test("a backwards time source never produces negative values", () => {
  let time = 10_000;
  const clock = createGameClock({ now: () => time });
  clock.start("b");
  time = 5_000;
  assert.deepEqual(clock.read(), { white: 0, black: 0, total: 0, running: "b" });
});

test("formatElapsed uses mm:ss and switches to h:mm:ss at one hour", () => {
  assert.equal(formatElapsed(0), "00:00");
  assert.equal(formatElapsed(59_000), "00:59");
  assert.equal(formatElapsed(60_000), "01:00");
  assert.equal(formatElapsed(3_599_000), "59:59");
  assert.equal(formatElapsed(3_600_000), "1:00:00");
  assert.equal(formatElapsed(3_661_000), "1:01:01");
});

test("formatElapsed floors to whole seconds and clamps invalid values to zero", () => {
  assert.equal(formatElapsed(999), "00:00");
  assert.equal(formatElapsed(59_999), "00:59");
  assert.equal(formatElapsed(3_599_999), "59:59");
  assert.equal(formatElapsed(-5_000), "00:00");
  assert.equal(formatElapsed(Number.NaN), "00:00");
});
