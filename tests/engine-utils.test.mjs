import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import ts from "typescript";

// Node 20 and 22 can run the same production utilities as Node 24.
function loadTypeScript(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  const source = readFileSync(url, "utf8");
  const {outputText} = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
  });
  const baseRequire = createRequire(url);
  const customRequire = (specifier) => {
    if (specifier.startsWith(".")) {
      for (const ext of [".ts", ".tsx"]) {
        const candidate = new URL(specifier + ext, url);
        try {
          readFileSync(candidate);
          return loadTypeScript(candidate.href);
        } catch {
          // Try next extension.
        }
      }
    }
    return baseRequire(specifier);
  };
  const exports = {};
  new Function("exports", "require", outputText)(exports, customRequire);
  return exports;
}
const {remapFrame, TYPE_SCALE, STYLE_PRESETS, resolveFinishingMode, contrastRatio} = loadTypeScript("../src/engine/theme.ts");
const {resolveParts} = loadTypeScript("../src/engine/episode/resolveParts.ts");
const {computePartBeats, SPRINGS} = loadTypeScript("../src/engine/motion/choreography.ts");
const {computeSafeBounds, resolveCaptionVisibility} = loadTypeScript("../src/engine/layout/SafeLayout.tsx");
const {computeFlowTiming} = loadTypeScript("../src/engine/archetypes/ProcessFlowScene.tsx");
const {computeCalloutLayout} = loadTypeScript("../src/engine/archetypes/SpotlightCalloutScene.tsx");

test("audio frame endpoints, shortened parts and out-of-bounds frames use the design window", () => {
  assert.equal(remapFrame(0, 330, 0, 210), 0);
  assert.equal(remapFrame(329, 330, 0, 210), 210);
  assert.equal(remapFrame(5, 11, 210, 480), 345);
  assert.equal(remapFrame(0, 1, 210, 480), 210);
  assert.equal(remapFrame(-10, 100, 210, 480), 210);
  assert.equal(remapFrame(500, 100, 210, 480), 480);
});

function audioPart(id) {
  return {id, audioSrc: `topics/demo/ep-01/parts/${id}.wav`};
}
const opening = audioPart("1-opening");
const ending = audioPart("10-ending");
const components = {"01": () => null, "10": () => null};

test("gaps in the audio numbering retain their assigned scene, including in previews", () => {
  const parts = [opening, ending];
  assert.deepEqual(resolveParts(parts, components), [
    {part: opening, Component: components["01"]},
    {part: ending, Component: components["10"]},
  ]);
  assert.deepEqual(resolveParts(parts, components, "10-ending"), [{part: ending, Component: components["10"]}]);
});

test("ambiguous prefixes, stale wiring and unknown previews report the offending id", () => {
  assert.throws(() => resolveParts([opening, audioPart("01-repeat")], components), /01-repeat/);
  assert.throws(() => resolveParts([opening, ending], {"01": components["01"]}), /10-ending/);
  assert.throws(() => resolveParts([opening], components), /10/);
  assert.throws(() => resolveParts([opening, ending], components, "03-missing"), /03-missing/);
  assert.throws(() => resolveParts([{...opening, audioSrc: ending.audioSrc}], components), /1-opening/);
});

test("TYPE_SCALE enforces >= 28px phone legibility and STYLE_PRESETS covers all 4 visual themes", () => {
  assert.ok(TYPE_SCALE.caption >= 28);
  assert.deepEqual(Object.keys(TYPE_SCALE), ["hero", "title", "subtitle", "body", "caption"]);
  assert.deepEqual(Object.keys(STYLE_PRESETS).sort(), [
    "b1-editorial",
    "hd2d-cinematic",
    "neo-25d-dark",
    "neo-25d-light",
  ]);
});

test("computePartBeats splits short, standard, and 1-frame parts into deterministic clamped phases", () => {
  assert.ok(SPRINGS.snappy.stiffness > 0);
  const start = computePartBeats(0, 300);
  assert.equal(start.enter, 0);
  assert.equal(start.progress, 0);
  const mid = computePartBeats(180, 300);
  assert.equal(mid.enter, 1);
  assert.ok(mid.act > 0.8 && mid.payoff > 0 && mid.payoff < 1);
  const end = computePartBeats(299, 300);
  assert.equal(end.enter, 1);
  assert.equal(end.act, 1);
  assert.equal(end.payoff, 1);
  assert.equal(end.settle, 1);
  const tiny = computePartBeats(0, 1);
  assert.ok(Number.isFinite(tiny.enter) && Number.isFinite(tiny.payoff) && Number.isFinite(tiny.settle));
  const shortPart = computePartBeats(10, 15);
  assert.ok(shortPart.enter === 1 && shortPart.payoff > 0 && shortPart.payoff <= 1);
});

test("computeSafeBounds shifts clear of active caption band under all 3 caption states", () => {
  assert.deepEqual(computeSafeBounds({showCaptions: true, captionPlacement: "top-safe"}), {
    left: 64,
    top: 396,
    width: 876,
    height: 1144,
    bottom: 1540,
  });
  assert.deepEqual(computeSafeBounds({showCaptions: true, captionPlacement: "bottom-safe"}), {
    left: 64,
    top: 180,
    width: 876,
    height: 1184,
    bottom: 1364,
  });
  assert.deepEqual(computeSafeBounds({showCaptions: false, captionPlacement: "top-safe"}), {
    left: 64,
    top: 180,
    width: 876,
    height: 1360,
    bottom: 1540,
  });
});

test("resolveCaptionVisibility reserves caption band whenever external Track captions render", () => {
  assert.equal(resolveCaptionVisibility({captionsRenderedByTrack: true, showCaptions: false}), true);
  assert.equal(resolveCaptionVisibility({captionsRenderedByTrack: false, showCaptions: false}), false);
  assert.equal(resolveCaptionVisibility({captionsRenderedByTrack: false, showCaptions: true}), true);
});

test("STYLE_PRESETS guarantee >= 4.5:1 WCAG contrast on accent and secondary badges", () => {
  for (const [name, preset] of Object.entries(STYLE_PRESETS)) {
    assert.ok(preset.onAccent, `Missing onAccent on ${name}`);
    assert.ok(preset.onSecondary, `Missing onSecondary on ${name}`);
    assert.ok(
      contrastRatio(preset.accent, preset.onAccent) >= 4.5,
      `Low accent contrast on ${name}: ${contrastRatio(preset.accent, preset.onAccent)}`,
    );
    assert.ok(
      contrastRatio(preset.secondary, preset.onSecondary) >= 4.5,
      `Low secondary contrast on ${name}: ${contrastRatio(preset.secondary, preset.onSecondary)}`,
    );
  }
});

test("computeFlowTiming sequences step card before connector across short and long parts", () => {
  const early = computeFlowTiming(computePartBeats(5, 30), 1, 3);
  assert.ok(early.cardProgress >= early.connectorProgress);
  const done = computeFlowTiming(computePartBeats(29, 30), 2, 3);
  assert.equal(done.cardProgress, 1);
  const longMid = computeFlowTiming(computePartBeats(300, 600), 1, 3);
  assert.ok(longMid.cardProgress > 0 && longMid.connectorProgress >= 0);
});

test("computeCalloutLayout clamps to active caption bounds and oversized boxWidth without inversion", () => {
  const topSafe = computeSafeBounds({showCaptions: true, captionPlacement: "top-safe"});
  const clampedTop = computeCalloutLayout(
    {id: "a", label: "A", targetX: 400, targetY: 500, boxX: 20, boxY: 200, boxWidth: 1200},
    topSafe,
  );
  assert.equal(clampedTop.boxW, 876);
  assert.equal(clampedTop.left, 64);
  assert.ok(clampedTop.top >= 396);
  const bottomSafe = computeSafeBounds({showCaptions: true, captionPlacement: "bottom-safe"});
  const clampedBottom = computeCalloutLayout(
    {id: "b", label: "B", targetX: 400, targetY: 1100, boxX: 600, boxY: 1450, boxWidth: 420},
    bottomSafe,
  );
  assert.ok(clampedBottom.top <= bottomSafe.bottom - 96);
});

test("resolveFinishingMode applies topic stylePreset while honoring Studio hd2dOverlay toggle", () => {
  assert.equal(resolveFinishingMode({stylePreset: "b1-editorial", hd2dOverlay: true}), "paper");
  assert.equal(resolveFinishingMode({stylePreset: "b1-editorial", hd2dOverlay: false}), "none");
  assert.equal(resolveFinishingMode({finishing: "auto", stylePreset: "hd2d-cinematic", hd2dOverlay: true}), "hd2d");
  assert.equal(resolveFinishingMode({finishing: "paper", stylePreset: "hd2d-cinematic", hd2dOverlay: true}), "paper");
  assert.equal(resolveFinishingMode({hd2dOverlay: true}), "hd2d");
});
