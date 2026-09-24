# Chess Opening Coach

A small web application for learning chess openings while playing
against bots at different approximate Elo levels.

This repository is managed as a test project by the persistent
AI Development Team.

See `SPEC.md` for the complete product requirements.

## Development

```powershell
npm install
npm start
```

Application:

http://127.0.0.1:3000

Health check:

http://127.0.0.1:3000/health

In a separate terminal, run the automated health endpoint test with:

```powershell
npm test
```

The game runs entirely in the browser after loading. Bot ratings are approximate
experience labels, not calibrated Elo ratings. The four levels vary candidate
breadth, search depth metadata, and controlled mistake rate; opening-book replies
remain deterministic so learners can practice the curated lines.

Legal move generation, check, checkmate, draw, castling, en passant, and
promotion rules are provided by the mature open-source `chess.js` package.
