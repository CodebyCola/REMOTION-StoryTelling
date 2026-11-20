import type {PartComponents, PartMeta} from "./episode.types";

// Prefixes stay stable when a clip is renamed or intermediate numbers are absent.
export function resolveParts(metadata: PartMeta[], components: PartComponents, onlyPartId?: string) {
  const used = new Set<string>();
  const resolved = metadata.map((part) => {
    const stem = part.audioSrc.split("/").pop()?.replace(/\.[^.]+$/, "");
    const prefix = /^(\d+)(?:-|$)/.exec(part.id)?.[1];
    if (stem !== part.id || !prefix) {
      throw new Error(`Part "${part.id}" requires an audio filename with the same numbered stem.`);
    }
    const key = prefix.replace(/^0+(?=\d)/, "").padStart(2, "0");
    if (used.has(key)) throw new Error(`Duplicate audio prefix ${key} in "${part.id}".`);
    used.add(key);
    const Component = components[key];
    if (!Component) throw new Error(`Missing component for "${part.id}" (key ${key}).`);
    return {part, Component};
  });
  for (const key of Object.keys(components)) {
    if (!used.has(key)) throw new Error(`Component ${key} has no matching audio. Sync the episode.`);
  }
  if (onlyPartId === undefined) return resolved;
  const selected = resolved.find(({part}) => part.id === onlyPartId);
  if (!selected) throw new Error(`Unknown episode part "${onlyPartId}".`);
  return [selected];
}
