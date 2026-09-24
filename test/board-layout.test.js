import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(?:^|})${escaped}\\{([^}]*)\\}`));
  assert.ok(match, `${selector} rule should exist`);
  return match[1];
}

test("board uses fixed equal tracks so empty squares keep the same size as occupied squares", () => {
  const board = ruleBody(".chess-board");
  assert.match(board, /display:grid/);
  assert.match(board, /grid-template-columns:repeat\(8,minmax\(0,1fr\)\)/);
  assert.match(board, /grid-template-rows:repeat\(8,minmax\(0,1fr\)\)/);
  assert.match(board, /aspect-ratio:1(?![\d.])/);
});

test("squares do not size themselves from their content", () => {
  const square = ruleBody(".square");
  assert.match(square, /min-width:0/);
  assert.match(square, /min-height:0/);
  assert.match(square, /width:100%/);
  assert.match(square, /height:100%/);
});
