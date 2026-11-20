# AGENTS.md — Remotion Storytelling Workspace

For all video authoring, scene editing, topic/episode creation, audio synchronization, or Remotion tasks in this repository, load and follow the local skill:

- **Skill Entrypoint:** [`.agents/skills/remotion-storytelling/SKILL.md`](.agents/skills/remotion-storytelling/SKILL.md)

## Quick Commands

- Scaffold topic / episode: `npm run scaffold -- <topic>/<episode> --parts <N> --style <hybrid|hd2d|b1-stickman>`
- Sync external audio & optional captions: `npm run sync -- <topic>/<episode>`
- Refresh topic/part registry: `npm run scaffold -- --registry`
- Typecheck & lint: `npm run lint`
- Run unit tests: `npm test`
- Live preview: `npm run dev`
