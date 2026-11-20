import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {auditWorkspaceStyle} from "../.agents/skills/remotion-storytelling/scripts/audit-style.mjs";
import {addPart, scaffoldEpisode, validateSlug} from "../.agents/skills/remotion-storytelling/scripts/scaffold.mjs";

function workspace(t) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "storytelling-scaffold-"));
  t.after(() => fs.rmSync(rootDir, {recursive: true, force: true}));
  return rootDir;
}
const read = (file) => fs.readFileSync(file, "utf8");

test("reject invalid topic and episode paths before creating anything", (t) => {
  const rootDir = workspace(t);
  for (const name of ["../outside", "My Topic", "", "safe/room"]) {
    assert.throws(() => validateSlug(name), /invalid/i);
    assert.throws(() => scaffoldEpisode({rootDir, topic: "valid", episode: name}), /invalid/i);
  }
  assert.deepEqual(fs.readdirSync(rootDir), []);
});

test("register a new topic and each episode, with independent styles and part maps", (t) => {
  const rootDir = workspace(t);
  const options = {rootDir, topic: "ai-basics", episode: "ep-01", partCount: 2, style: "hybrid"};
  const first = scaffoldEpisode(options);
  assert.ok(fs.existsSync(first.publicPartsDir));
  const file = path.join(first.episodeDir, "parts", "Part01.tsx");
  assert.match(read(file), /Stickman/);
  assert.match(read(file), /TitleHookScene|SafeLayout/);
  assert.deepEqual(auditWorkspaceStyle({rootDir, topic: "ai-basics"}).issues, []);
  assert.match(read(path.join(first.episodeDir, "parts.generated.ts")), /Part02/);
  fs.writeFileSync(file, "// authored scene\n");
  assert.throws(() => scaffoldEpisode(options), /already exists/i);
  const config = path.join(first.topicDir, "topic.config.ts");
  assert.match(read(config), /stylePreset:\s*"neo-25d-light"/);
  assert.doesNotMatch(read(path.join(first.episodeDir, "Episode.tsx")), /finishing="/);
  const editedConfig = read(config) + "\n// topic settings\n";
  fs.writeFileSync(config, editedConfig);
  scaffoldEpisode({...options, episode: "ep-02", style: "hd2d"});
  assert.equal(read(config), editedConfig);
  assert.match(read(path.join(first.topicDir, "episodes.generated.ts")), /ep-01/);
  assert.match(read(path.join(first.topicDir, "episodes.generated.ts")), /ep-02/);
  assert.match(read(path.join(rootDir, "src", "topics", "index.ts")), /ai-basics/);
  const added = addPart(options);
  assert.equal(path.basename(added), "Part03.tsx");
  assert.match(read(path.join(first.episodeDir, "parts.generated.ts")), /Part03/);
  assert.equal(read(file), "// authored scene\n");
  assert.deepEqual(fs.readdirSync(first.publicPartsDir), []);
});

test("workspace skill docs, AGENTS.md, README.md exist and legacy folders are removed", () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const skillDir = path.join(repoRoot, ".agents", "skills", "remotion-storytelling");
  const skillFile = path.join(skillDir, "SKILL.md");
  assert.ok(fs.existsSync(skillFile), "Missing SKILL.md");
  const skillText = read(skillFile);
  const lineCount = skillText.split(/\r?\n/).length;
  assert.ok(lineCount <= 120, `SKILL.md must be <= 120 lines, got ${lineCount}`);
  assert.match(skillText, /^---\r?\nname:\s*remotion-storytelling/m);
  for (const ref of ["art-direction-playbook.md", "engine-api.md", "safezone-motion.md", "workflow.md"]) {
    const refPath = path.join(skillDir, "references", ref);
    assert.ok(fs.existsSync(refPath), `Missing reference ${ref}`);
    assert.ok(read(refPath).trim().length > 100, `Reference ${ref} is too short`);
    assert.match(skillText, new RegExp(`references/${ref.replace(".", "\\.")}`));
  }
  const agentsFile = path.join(repoRoot, "AGENTS.md");
  const readmeFile = path.join(repoRoot, "README.md");
  assert.ok(fs.existsSync(agentsFile), "Missing AGENTS.md");
  assert.ok(fs.existsSync(readmeFile), "Missing README.md");
  assert.match(read(agentsFile), /remotion-storytelling/);
  assert.match(read(readmeFile), /npm run sync/);
  assert.match(read(readmeFile), /npm run scaffold/);
  assert.match(read(readmeFile), /npm run audit-style/);
  for (const legacy of ["kenapa-ai", "remotion-claude", "PROMPT.md"]) {
    assert.ok(!fs.existsSync(path.join(repoRoot, legacy)), `Legacy path still exists: ${legacy}`);
  }
});
