import { openingBookMove } from "./openings.js";

export const BOT_LEVELS = {
  600: { depth: 1, candidateBreadth: 2, mistakeRate: 0.5, label: "Casual" },
  900: { depth: 1, candidateBreadth: 4, mistakeRate: 0.25, label: "Developing" },
  1200: { depth: 2, candidateBreadth: 8, mistakeRate: 0.08, label: "Club" },
  1500: { depth: 3, candidateBreadth: 12, mistakeRate: 0, label: "Challenging" }
};

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const centerBonus = (square) => {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return Math.round((3.5 - Math.abs(file - 3.5) + 3.5 - Math.abs(rank - 3.5)) * 3);
};

function evaluateMove(move) {
  return (VALUES[move.captured] ?? 0) - (VALUES[move.piece] ?? 0) * 0.02 + centerBonus(move.to) + (move.san.includes("+") ? 35 : 0);
}

function evaluatePosition(game, botColor) {
  if (game.isCheckmate()) return game.turn() === botColor ? -100000 : 100000;
  if (game.isDraw()) return 0;
  return game.board().flat().filter(Boolean).reduce((score, piece) => {
    const value = VALUES[piece.type] ?? 0;
    return score + (piece.color === botColor ? value : -value);
  }, 0);
}

function search(game, depth, botColor, breadth, alpha = -Infinity, beta = Infinity) {
  if (depth === 0 || game.isGameOver()) return evaluatePosition(game, botColor);
  const maximizing = game.turn() === botColor;
  const candidates = game.moves({ verbose: true })
    .sort((left, right) => evaluateMove(right) - evaluateMove(left))
    .slice(0, breadth);
  let best = maximizing ? -Infinity : Infinity;
  for (const move of candidates) {
    game.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = search(game, depth - 1, botColor, breadth, alpha, beta);
    game.undo();
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

export function chooseBotMove(game, level = 900, random = Math.random) {
  const config = BOT_LEVELS[level] ?? BOT_LEVELS[900];
  const legalMoves = game.moves({ verbose: true });
  if (!legalMoves.length) return null;
  const history = game.history({ verbose: true }).map((move) => `${move.from}${move.to}`);
  const book = openingBookMove(history, legalMoves);
  const bookMove = legalMoves.find((move) => `${move.from}${move.to}` === book);
  if (bookMove) return bookMove;

  const botColor = game.turn();
  const ranked = legalMoves.map((move) => {
    game.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = search(game, config.depth - 1, botColor, config.candidateBreadth);
    game.undo();
    return { move, score: score + evaluateMove(move) };
  });
  ranked.sort((a, b) => b.score - a.score || a.move.from.localeCompare(b.move.from));
  const breadth = Math.min(config.candidateBreadth, ranked.length);
  if (random() < config.mistakeRate) {
    return ranked[Math.min(breadth - 1, Math.floor(random() * breadth))].move;
  }
  return ranked[0].move;
}
