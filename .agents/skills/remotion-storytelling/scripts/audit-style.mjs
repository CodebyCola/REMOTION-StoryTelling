import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { validateSlug } from "./registry.mjs";

const RULES = {
  determinism: /\b(?:Math\.random|Date\.now|setTimeout|setInterval)\s*\(/,
  cssMotion: /\b(?:transition|animation|WebkitTransition|WebkitAnimation)\s*:/,
  fontSize: /\bfontSize\s*:\s*(\d+(?:\.\d+)?)\b/g,
  topCoord: /\btop\s*:\s*(-?\d+(?:\.\d+)?)\b/g,
  leftCoord: /\bleft\s*:\s*(-?\d+(?:\.\d+)?)\b/g,
};

export function auditSourceText(source, filePath = "Part.tsx") {
  const issues = [];
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    if (line.includes("safezone-exempt")) continue;

    if (RULES.determinism.test(line)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "determinism",
        message: "Forbidden non-deterministic call; use useCurrentFrame() and mulberry32(seed).",
      });
    }

    if (RULES.cssMotion.test(line)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "css-motion",
        message: "Forbidden CSS transition/animation; drive motion with interpolate() or spring().",
      });
    }

    for (const match of line.matchAll(RULES.fontSize)) {
      const size = Number(match[1]);
      if (size < 28) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "min-font-size",
          message: `fontSize ${size} is below 28px minimum phone legibility (use TYPE_SCALE).`,
        });
      }
    }

    for (const match of line.matchAll(RULES.topCoord)) {
      const top = Number(match[1]);
      if (top < 160 || top > 1560) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "safe-zone",
          message: `Literal top=${top} falls outside 9:16 SafeZone (180..1540); use <SafeLayout> or // safezone-exempt.`,
        });
      }
    }

    for (const match of line.matchAll(RULES.leftCoord)) {
      const left = Number(match[1]);
      if (left < 40 || left > 940) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "safe-zone",
          message: `Literal left=${left} falls outside 9:16 SafeZone (64..940); use <SafeLayout> or // safezone-exempt.`,
        });
      }
    }
  }

  return issues;
}

function collectPartFiles(rootDir, topic) {
  const topicsRoot = path.join(rootDir, "src", "topics");
  if (!fs.existsSync(topicsRoot)) return [];

  const topicDirs = topic
    ? [validateSlug(topic, "topic")]
    : fs
        .readdirSync(topicsRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();

  const files = [];
  for (const slug of topicDirs) {
    const topicPath = path.join(topicsRoot, slug);
    if (topic && !fs.existsSync(topicPath)) {
      throw new Error(`Topic not found: ${slug}`);
    }
    const episodesDir = path.join(topicPath, "episodes");
    if (!fs.existsSync(episodesDir)) continue;
    for (const ep of fs.readdirSync(episodesDir, { withFileTypes: true })) {
      if (!ep.isDirectory()) continue;
      const partsDir = path.join(episodesDir, ep.name, "parts");
      if (!fs.existsSync(partsDir)) continue;
      for (const file of fs.readdirSync(partsDir, { withFileTypes: true })) {
        if (file.isFile() && /\.(tsx?|jsx?)$/.test(file.name)) {
          files.push(path.join(partsDir, file.name));
        }
      }
    }
  }
  return files;
}

export function auditWorkspaceStyle({ rootDir = process.cwd(), topic } = {}) {
  const files = collectPartFiles(rootDir, topic);
  const issues = [];
  for (const file of files) {
    const rel = path.relative(rootDir, file).replace(/\\/g, "/");
    const source = fs.readFileSync(file, "utf8");
    issues.push(...auditSourceText(source, rel));
  }
  return { checkedFiles: files.length, issues };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      options: { topic: { type: "string" } },
    });
    const topic = values.topic ?? positionals[0];
    const result = auditWorkspaceStyle({ topic });
    if (result.issues.length > 0) {
      for (const issue of result.issues) {
        console.error(
          `${issue.file}:${issue.line} [${issue.rule}] ${issue.message}`,
        );
      }
      process.exitCode = 1;
    } else {
      console.log(
        JSON.stringify({
          ok: true,
          checkedFiles: result.checkedFiles,
          issues: 0,
        }),
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
