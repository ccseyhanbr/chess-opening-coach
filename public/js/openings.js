export const OPENINGS = [
  {
    name: "Italian Game",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6", "d2d3"],
    description: "Rapid development aimed at the sensitive f7 square.",
    ideas: [
      "Claim the center and free the king's bishop.", "Meet White in the center and open lines for development.",
      "Develop with tempo against e5 and prepare castling.", "Defend e5 while developing a queenside piece.",
      "Aim at f7 and prepare to castle safely.", "Develop and challenge White's central pawn.",
      "Support e4 and keep the center flexible."
    ]
  },
  {
    name: "Ruy Lopez",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b5a4"],
    description: "Long-term pressure on the knight that protects Black's e5 pawn.",
    ideas: ["Occupy the center.", "Match White's central space.", "Pressure e5.", "Develop and defend e5.", "Pin the defender of e5.", "Question the bishop and gain queenside space.", "Preserve the bishop while maintaining pressure."]
  },
  {
    name: "Queen's Gambit",
    moves: ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3"],
    description: "Offer a wing pawn to challenge Black's central strongpoint.",
    ideas: ["Control e5 and open the queen's bishop.", "Build a firm central foothold.", "Challenge d5 and gain central influence.", "Support d5 with a solid pawn chain.", "Add pressure to d5 and develop naturally."]
  },
  {
    name: "Sicilian Defense",
    moves: ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4", "c5d4", "f3d4"],
    description: "An asymmetrical fight where Black contests the center from the c-file.",
    ideas: ["Take central space.", "Fight for d4 without mirroring White.", "Develop and prepare d4.", "Control e5 and support the queenside structure.", "Open the center before Black completes development.", "Exchange the c-pawn for White's central pawn.", "Recapture with development and centralize the knight."]
  },
  {
    name: "French Defense",
    moves: ["e2e4", "e7e6", "d2d4", "d7d5", "b1c3"],
    description: "A resilient pawn chain that prepares a direct challenge to e4.",
    ideas: ["Establish a central pawn.", "Prepare d5 while keeping a compact position.", "Build the ideal pawn center.", "Attack White's center immediately.", "Defend e4 and increase central control."]
  },
  {
    name: "Caro-Kann Defense",
    moves: ["e2e4", "c7c6", "d2d4", "d7d5", "b1c3"],
    description: "A solid defense that challenges e4 while preserving the light bishop.",
    ideas: ["Claim central territory.", "Prepare d5 with a stable pawn base.", "Build a broad center.", "Challenge e4 in one move.", "Develop while reinforcing the center."]
  },
  {
    name: "King's Indian Defense",
    moves: ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "f8g7", "e2e4", "d7d6"],
    description: "Black allows a broad white center and prepares a kingside counterattack.",
    ideas: ["Take central space.", "Develop flexibly and watch e4.", "Gain more queenside and central influence.", "Prepare a kingside fianchetto.", "Support e4 and develop.", "Complete the fianchetto and prepare castling.", "Build the classical pawn center.", "Restrain e5 and prepare counterplay."]
  },
  {
    name: "London System",
    moves: ["d2d4", "d7d5", "g1f3", "g8f6", "c1f4", "e7e6"],
    description: "A dependable development system built around a bishop outside the pawn chain.",
    ideas: ["Secure central space.", "Claim equal central influence.", "Develop and support d4.", "Develop naturally and contest e4.", "Place the bishop actively before playing e3.", "Reinforce d5 and prepare development."]
  },
  {
    name: "Scandinavian Defense",
    moves: ["e2e4", "d7d5", "e4d5", "d8d5", "b1c3", "d5d8"],
    description: "Black challenges e4 immediately, accepting early queen activity.",
    ideas: ["Occupy the center.", "Strike at e4 at once.", "Accept the challenge and gain a tempo target.", "Restore material balance.", "Develop with tempo against the queen.", "Retreat safely while keeping a sound structure."]
  },
  {
    name: "English Opening",
    moves: ["c2c4", "e7e5", "b1c3", "g8f6", "g2g3"],
    description: "Control the center from the flank and keep the pawn structure flexible.",
    ideas: ["Control d5 without committing the central pawns.", "Take central space and restrict d4.", "Increase pressure on d5.", "Develop and contest the center.", "Prepare a long-diagonal fianchetto."]
  }
];

const normalize = (move) => typeof move === "string" ? move.replace(/[+#]/g, "") : `${move.from}${move.to}`;

export function getOpeningCoach(history, legalMoves = []) {
  const played = history.map(normalize);
  const matching = OPENINGS.filter((opening) => played.every((move, index) => opening.moves[index] === move));
  if (matching.length === 0) {
    return {
      status: "off-book", name: "Outside known opening book", recommendation: null,
      explanation: "This position has left the coach's ten curated lines. Keep developing pieces, protect your king, and check forcing moves."
    };
  }
  const exactOrLongest = [...matching].sort((a, b) => b.moves.length - a.moves.length)[0];
  const identified = matching.length === 1 || played.length >= 2 ? exactOrLongest.name : "Opening book";
  const next = exactOrLongest.moves[played.length];
  if (!next) {
    return { status: "known", name: exactOrLongest.name, recommendation: null, explanation: `${exactOrLongest.description} The curated line is complete; continue with sound development.` };
  }
  const legal = legalMoves.find((move) => normalize(move) === next);
  if (!legalMoves.length || legal) {
    return {
      status: "known", name: identified,
      recommendation: legal ? legal.san : next,
      move: next,
      explanation: exactOrLongest.ideas[played.length] ?? exactOrLongest.description
    };
  }
  return {
    status: "off-book", name: "Outside known opening book", recommendation: null,
    explanation: "The book continuation is not legal in this position, so the coach has withheld it."
  };
}

export function openingBookMove(history, legalMoves) {
  return getOpeningCoach(history, legalMoves).move ?? null;
}
