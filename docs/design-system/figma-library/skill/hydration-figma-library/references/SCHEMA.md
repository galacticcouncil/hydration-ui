# Catalog schema and coverage

`catalog/manifest.json` records the source file, every declared page, counts, chunk hashes, extraction date, and confidence.
`components.json` contains each component set and standalone component exactly once. `variants.json` contains actual child variants with exact property tuples; combinations are never inferred.
`pages.json` preserves page metadata, roots, ancestor containers, and definition IDs. Page roots are navigation/examples, not extra definitions.
`variables.json` preserves collections, mode IDs/names/defaults, variables, scopes, code syntax, and alias IDs. `styles.json` preserves all local text/paint/effect/grid styles.
`dependencies.json` records direct dependencies inspected in family representatives. `diagnostics.json` records count/reference/key errors and ambiguity/external-reference warnings.

All original exported fields are preserved. Added fields are `fileKey`, `url`, `importMethod`, `provenance`, and `verification`. Original transport chunks remain in `raw/chunks`; their file and decoded hashes are in the manifest.

## Reading confidence correctly

- Inventory was exported from the live source document on the recorded date; it is a snapshot and can drift.
- Root definition visibility is the exported effective visibility, including source ancestors. Nested child `visible` fields retain the exporter's own scope and are not a rendered preview.
- Import, publication availability, resizing, and interactive behavior were **not tested** by this read-only scan.
- A family inspects one representative definition. Its layer list is filtered to immediate children, text, instances, property references, and bound/style-bearing layers. It is not every descendant of every variant.
- Nested instances are dependency boundaries; their internal layer trees were not recursively expanded.
- Other variants include root layout/bindings/styles and immediate child layout, rather than a full descendant audit.
- `COMPONENT_SET.layout` describes the canvas arrangement of its variants, **not runtime instance dimensions**. Choose an actual variant and inspect its `layout` before sizing an instance.
- Variable alias targets absent from local foundations are flagged as unresolved external references, not silently replaced by literal colors.
- `dependencies.json` reconciles imported/cached variable and style IDs by exact stable key when present in current local foundations. This establishes identity only; it does not verify an import or the rendered value of an old instance.
- Exact Figma property names retain their suffixes. Import keys are full values, never abbreviated. Use node IDs or keys when names repeat.

## Commands

```sh
python3 ../scripts/assemble_catalog.py --check-only
python3 ../scripts/lookup.py search "receiving account"
python3 ../scripts/lookup.py show NODE_ID --json
python3 ../scripts/lookup.py variants COMPONENT_SET_ID "size=sm"
```

Assembly is offline and read-only toward Figma. `--check-only` validates input and references without rewriting catalog or documentation. Diagnostics errors cause exit status 1; transport/JSON failures cause status 2.

The portable skill omits raw transport chunks; they remain in the project documentation. A fresh standalone refresh must export all pages and foundations.
