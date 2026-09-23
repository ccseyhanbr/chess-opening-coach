# Chess Opening Coach

## Product Goal

Build a small but polished web application that helps beginner and
intermediate chess players learn chess openings while playing against
computer opponents.

The application should feel like a real chess learning product rather
than a technical demo.

---

# Core Experience

The user should be able to:

1. Open the application.
2. See an interactive chess board.
3. Choose a bot strength.
4. Start a game.
5. Play legal chess moves.
6. Receive opening recommendations while the game is still in the
   opening phase.
7. See which known opening is currently being played.
8. Learn the main idea behind that opening.
9. Continue playing against the bot.

---

# Chess Openings

The MVP must recognize and teach these 10 openings:

1. Italian Game
2. Ruy Lopez
3. Queen's Gambit
4. Sicilian Defense
5. French Defense
6. Caro-Kann Defense
7. King's Indian Defense
8. London System
9. Scandinavian Defense
10. English Opening

For each opening include:

- opening name;
- common move sequence;
- short explanation;
- strategic idea;
- recommended next move when applicable.

The application does not need a complete professional opening database.

---

# Opening Coach

During the opening phase, display a coaching panel.

Example:

Current opening:

Italian Game

Recommended move:

Bc4

Idea:

Develop the bishop toward the vulnerable f7 square and prepare
castling.

Recommendations must depend on the actual move sequence played.

Do not recommend illegal moves.

If the player leaves the known opening sequence, explain that the game
has moved outside the application's known opening book.

---

# Chess Board

The UI must provide a real interactive chess board.

Requirements:

- legal move validation;
- visible pieces;
- click or drag movement;
- current-player indication;
- move history;
- game-over detection;
- check/checkmate indication;
- reset/new-game control.

The implementation may use a mature open-source chess rules library.

Do not implement chess move legality manually unless there is a strong
technical reason.

---

# Computer Opponents

Provide multiple bot strengths.

Initial target levels:

- approximately 600 Elo
- approximately 900 Elo
- approximately 1200 Elo
- approximately 1500 Elo

The UI must clearly say that these are approximate strength levels
unless the implementation uses an engine with properly calibrated Elo
controls.

The strength settings must produce meaningfully different playing
behavior.

A stronger bot should generally make better moves than a weaker bot.

The implementation may use Stockfish or another suitable local chess
engine if practical.

The application must not require a paid chess API.

---

# Recommended UX

Main screen should contain:

- chess board;
- current bot Elo selector;
- opening coach panel;
- current opening;
- suggested move;
- strategic explanation;
- move history;
- new game button.

The layout should work comfortably on a normal desktop browser.

A dark chess-oriented visual style is preferred.

Avoid a generic developer-dashboard appearance.

---

# Opening Learning Mode

In addition to normal play, the user should be able to browse the
10 supported openings.

Selecting an opening should show:

- opening name;
- main move sequence;
- short description;
- key strategic ideas.

If practical, allow the user to step through the opening moves on the
board.

---

# Technical Constraints

This is a local MVP.

Do not require:

- authentication;
- user accounts;
- cloud infrastructure;
- external database;
- paid external APIs.

Prefer a simple architecture.

The application must run locally with:

npm install
npm start

The health endpoint must remain:

GET /health

Response:

{
  "status": "ok"
}

---

# Quality Requirements

The application must have automated tests for important application
logic.

At minimum test:

- health endpoint;
- opening recognition;
- opening recommendation logic;
- invalid move handling where practical;
- bot level configuration.

The project's configured validation commands must pass.

---

# Human Acceptance

A human tester should be able to:

1. Launch the application.
2. Open it in a browser.
3. Start a game.
4. Choose a bot strength.
5. Make chess moves.
6. See the bot reply.
7. Follow an opening such as the Italian Game.
8. See the application recognize the opening.
9. See a useful next-move recommendation.
10. Start a new game.

The final pull request should include a screenshot of the completed
application.

Human merge approval is required.
