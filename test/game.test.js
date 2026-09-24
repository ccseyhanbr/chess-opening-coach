import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "../public/js/chess-engine.js";
import { BOT_LEVELS, chooseBotMove } from "../public/js/bot.js";
import { OPENINGS, getOpeningCoach } from "../public/js/openings.js";
import { BotTurnController } from "../public/js/turn-controller.js";

function play(game, coordinateMove) {
  const result = game.move({ from: coordinateMove.slice(0, 2), to: coordinateMove.slice(2, 4), promotion: "q" });
  assert.ok(result, `${coordinateMove} should be legal`);
  return result;
}

test("all ten required opening lines are recognized and recommend a legal continuation", () => {
  assert.equal(OPENINGS.length, 10);
  const expected = [
    "Italian Game", "Ruy Lopez", "Queen's Gambit", "Sicilian Defense", "French Defense",
    "Caro-Kann Defense", "King's Indian Defense", "London System", "Scandinavian Defense", "English Opening"
  ];
  assert.deepEqual(OPENINGS.map((opening) => opening.name), expected);

  for (const opening of OPENINGS) {
    const game = new Chess();
    const prefix = opening.moves.slice(0, -1);
    prefix.forEach((move) => play(game, move));
    const legalMoves = game.moves({ verbose: true });
    const coach = getOpeningCoach(prefix, legalMoves);
    assert.equal(coach.name, opening.name, `${opening.name} should be recognized`);
    assert.ok(coach.recommendation, `${opening.name} should include a recommendation`);
    assert.ok(legalMoves.some((move) => `${move.from}${move.to}` === coach.move), `${opening.name} recommendation must be legal`);
    assert.ok(coach.explanation.length > 20, `${opening.name} should teach a useful idea`);
  }
});

test("off-book play is explicit and suppresses recommendations", () => {
  const game = new Chess();
  play(game, "a2a3");
  const coach = getOpeningCoach(["a2a3"], game.moves({ verbose: true }));
  assert.equal(coach.status, "off-book");
  assert.equal(coach.name, "Outside known opening book");
  assert.equal(coach.recommendation, null);
});

test("illegal moves are rejected without changing turn or history", () => {
  const game = new Chess();
  assert.throws(() => game.move({ from: "e2", to: "e5" }), /Invalid move/);
  assert.throws(() => game.move({ from: "e7", to: "e5" }), /Invalid move/);
  assert.equal(game.turn(), "w");
  assert.deepEqual(game.history(), []);
});

test("rules detect checkmate and game over", () => {
  const game = new Chess();
  ["f2f3", "e7e5", "g2g4", "d8h4"].forEach((move) => play(game, move));
  assert.equal(game.isCheck(), true);
  assert.equal(game.isCheckmate(), true);
  assert.equal(game.isGameOver(), true);
  assert.match(game.history().at(-1), /#$/);
});

test("each approximate bot level has a legal move and progressively stronger configuration", () => {
  const levels = [600, 900, 1200, 1500];
  const game = new Chess();
  play(game, "a2a3");
  for (const level of levels) {
    const move = chooseBotMove(game, level, () => 0.99);
    assert.ok(game.moves({ verbose: true }).some((candidate) => candidate.from === move.from && candidate.to === move.to));
  }
  for (let index = 1; index < levels.length; index += 1) {
    const weaker = BOT_LEVELS[levels[index - 1]];
    const stronger = BOT_LEVELS[levels[index]];
    assert.ok(stronger.depth >= weaker.depth);
    assert.ok(stronger.candidateBreadth > weaker.candidateBreadth);
    assert.ok(stronger.mistakeRate < weaker.mistakeRate);
  }
});

test("reset restores a fresh playable position", () => {
  const game = new Chess();
  play(game, "e2e4");
  game.reset();
  assert.equal(game.turn(), "w");
  assert.equal(game.history().length, 0);
  assert.equal(game.moves().length, 20);
});

test("reset cancels a pending bot reply before it can alter the fresh game", () => {
  const pending = new Map();
  let nextTimer = 1;
  const controller = new BotTurnController({
    setTimer(callback) {
      const id = nextTimer++;
      pending.set(id, callback);
      return id;
    },
    clearTimer(id) {
      pending.delete(id);
    }
  });
  const game = new Chess();
  play(game, "e2e4");
  controller.schedule(() => {
    const reply = chooseBotMove(game, 900, () => 0.99);
    game.move({ from: reply.from, to: reply.to, promotion: reply.promotion });
  }, 350);
  const staleCallback = [...pending.values()][0];

  controller.cancel();
  game.reset();
  staleCallback();

  assert.equal(game.turn(), "w");
  assert.deepEqual(game.history(), []);
  assert.equal(game.get("d2").type, "p");
  assert.equal(game.get("e2").type, "p");
});
