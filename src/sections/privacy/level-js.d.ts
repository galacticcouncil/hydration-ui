// Minimal ambient declaration for level-js — it ships no .d.ts. We only
// pass the returned value through to the RAILGUN engine, so a loose shape
// (compatible with abstract-leveldown) is enough.
declare module "level-js" {
  type LevelJsFactory = (location: string, options?: unknown) => unknown
  const factory: LevelJsFactory
  export default factory
}
