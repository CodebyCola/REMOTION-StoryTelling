import assert from "node:assert/strict";
import test from "node:test";
import {
  auditSourceText,
  auditWorkspaceStyle,
} from "../.agents/skills/remotion-storytelling/scripts/audit-style.mjs";

test("auditSourceText flags non-determinism, CSS transitions, tiny fontSize, and out-of-SafeZone text coordinates", () => {
  const bad = [
    "export function BadPart() {",
    "  const r = Math.random();",
    '  return <div style={{ transition: "all 0.3s", fontSize: 18, top: 40, left: 20 }}>Hi {r}</div>;',
    "}",
  ].join("\n");
  const issues = auditSourceText(bad, "Part01.tsx");
  const rules = issues.map((i) => i.rule);
  assert.ok(rules.includes("determinism"));
  assert.ok(rules.includes("css-motion"));
  assert.ok(rules.includes("min-font-size"));
  assert.ok(rules.includes("safe-zone"));
});

test("auditSourceText honors safezone-exempt comments and passes clean engine components", () => {
  const clean = [
    "export function CleanPart() {",
    "  return (",
    "    <>",
    "      <div style={{ left: -200, top: 0 }} /> {/* safezone-exempt */}",
    "      <div style={{ left: 80, top: 240, fontSize: 40 }}>Valid</div>",
    "    </>",
    "  );",
    "}",
  ].join("\n");
  assert.deepEqual(auditSourceText(clean, "Part01.tsx"), []);
});

test("auditWorkspaceStyle passes on the current repository topics", () => {
  const result = auditWorkspaceStyle();
  assert.ok(result.checkedFiles > 0);
  assert.deepEqual(result.issues, []);
});
