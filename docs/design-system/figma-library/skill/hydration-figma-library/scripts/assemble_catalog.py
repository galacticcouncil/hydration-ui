#!/usr/bin/env python3
"""Assemble read-only Figma exports into a complete, searchable local catalog.

No network or Figma access is used. Input is raw/manifest.json and the transport
chunks under raw/chunks/<page-id-with-dashes|foundations>/<offset>.json.
"""

import argparse
import base64
import binascii
import collections
import hashlib
import json
import re
import struct
import sys
from pathlib import Path
from urllib.parse import quote


CODEC = "lzw16be-utf8-v1"
VERSION = 1


class AssemblyError(Exception):
    pass


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        raise AssemblyError("Cannot read %s: %s" % (path, error)) from error


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def decode_lzw(binary):
    """Decode the exporter's byte dictionary, including reset and KwKwK cases."""
    if len(binary) % 2:
        raise AssemblyError("LZW payload has an incomplete 16-bit code")
    dictionary = [bytes([index]) for index in range(256)]
    previous = None
    output = bytearray()
    for (code,) in struct.iter_unpack(">H", binary):
        if code == 65535:
            dictionary = [bytes([index]) for index in range(256)]
            previous = None
            continue
        if code < len(dictionary):
            entry = dictionary[code]
        elif previous is not None and code == len(dictionary):
            entry = previous + previous[:1]
        else:
            raise AssemblyError("Invalid LZW code %s at dictionary size %s" % (code, len(dictionary)))
        output.extend(entry)
        if previous is not None and len(dictionary) < 65535:
            dictionary.append(previous + entry[:1])
        previous = entry
    return bytes(output)


def decode_chunks(directory, root):
    files = list(directory.glob("*.json"))
    if not files:
        raise AssemblyError("No transport chunks in " + str(directory))
    chunks = []
    for path in files:
        item = load_json(path)
        if not isinstance(item, dict):
            raise AssemblyError(str(path) + " must contain an object")
        offset = item.get("offset")
        if not isinstance(offset, int) or offset < 0 or path.stem != str(offset):
            raise AssemblyError(str(path) + " must use its nonnegative offset as filename")
        chunks.append((offset, path, item))
    chunks.sort(key=lambda entry: entry[0])
    first = chunks[0][2]
    if first.get("codec") != CODEC:
        raise AssemblyError("Unsupported codec: " + str(first.get("codec")))
    total = first.get("totalLength")
    json_length = first.get("jsonLength")
    if not isinstance(total, int) or total <= 0 or not isinstance(json_length, int) or json_length < 0:
        raise AssemblyError(str(directory) + " has invalid transport lengths")
    next_offset = 0
    parts = []
    provenance = []
    for offset, path, chunk in chunks:
        for field in ("codec", "totalLength", "jsonLength", "pageId", "mode", "counts"):
            equivalent_foundation_label = (field == "pageId" and first.get("mode") == "foundations"
                                          and chunk.get(field) in (None, "foundations")
                                          and first.get(field) in (None, "foundations"))
            if chunk.get(field) != first.get(field) and not equivalent_foundation_label:
                raise AssemblyError("Inconsistent %s metadata in %s" % (field, path))
        data = chunk.get("data")
        if not isinstance(data, str) or not data:
            raise AssemblyError("Empty or non-string chunk in " + str(path))
        if offset != next_offset:
            raise AssemblyError("Chunk gap or overlap in %s: expected offset %s, got %s" % (
                directory, next_offset, offset))
        next_offset = offset + len(data)
        expected_next = next_offset if next_offset < total else None
        if next_offset > total or chunk.get("nextOffset") != expected_next:
            raise AssemblyError("Invalid nextOffset or end boundary in " + str(path))
        parts.append(data)
        provenance.append({"path": str(path.relative_to(root)), "offset": offset,
                           "length": len(data), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    if next_offset != total:
        raise AssemblyError("Incomplete payload in %s: %s of %s characters" % (directory, next_offset, total))
    try:
        raw = decode_lzw(base64.b64decode("".join(parts), validate=True))
        text = raw.decode("utf-8")
        # JavaScript String.length counts UTF-16 code units, including surrogate pairs.
        actual_length = len(text.encode("utf-16-le")) // 2
        if actual_length != json_length:
            raise AssemblyError("Decoded jsonLength mismatch in %s: %s, expected %s" % (
                directory, actual_length, json_length))
        value = json.loads(text)
    except (binascii.Error, UnicodeError, ValueError) as error:
        raise AssemblyError("Invalid encoded JSON in %s: %s" % (directory, error)) from error
    if not isinstance(value, dict):
        raise AssemblyError("Decoded snapshot must contain an object: " + str(directory))
    if value.get("counts") is not None and first.get("counts") is not None and value["counts"] != first["counts"]:
        raise AssemblyError("Transport counts differ from decoded snapshot in " + str(directory))
    return value, {"label": directory.name, "codec": CODEC, "chunks": provenance,
                   "encodedLength": total, "jsonLength": json_length,
                   "decodedBytes": len(raw), "decodedSha256": hashlib.sha256(raw).hexdigest()}


def node_url(file_key, node_id=None):
    base = "https://www.figma.com/design/%s/" % quote(str(file_key), safe="")
    if node_id and re.fullmatch(r"\d+:\d+", str(node_id)):
        return base + "?node-id=" + str(node_id).replace(":", "-")
    return base


def alias_ids(value):
    if isinstance(value, dict):
        if value.get("type") == "VARIABLE_ALIAS" and value.get("id"):
            yield str(value["id"])
        for child in value.values():
            yield from alias_ids(child)
    elif isinstance(value, list):
        for child in value:
            yield from alias_ids(child)


def embedded_key(identity):
    match = re.match(r"^(?:VariableID:|S:)([0-9a-fA-F]{40})(?:/|,)", str(identity))
    return match.group(1) if match else None


def enrich(record, file_key, label, date, import_method):
    inventory = {"status": "live-export", "date": date}
    if "visible" in record:
        inventory.update({"visibleAtExport": record["visible"], "visibilityScope": "includes source ancestors"})
    return {**record, "fileKey": file_key, "url": node_url(file_key, record.get("id")),
            "importMethod": import_method,
            "provenance": {"snapshot": label, "source": "raw/chunks/" + label, "exportDate": date},
            "verification": {"inventory": inventory,
                             "import": {"status": "not-tested"},
                             "behavior": {"status": "not-tested",
                                          "note": "Exported layout is not proof of resize or interaction behavior."}}}


def is_icon(record):
    page = record.get("pageName", "").casefold()
    name = record.get("name", "").casefold()
    return ("icon" in page or name.startswith(("classic/", "icons/", "icon/", "asseticon/", "chainicon/")))


def assemble(root, date):
    raw_manifest = load_json(root / "raw/manifest.json")
    expected_pages = raw_manifest.get("pages", [])
    if not isinstance(expected_pages, list) or not expected_pages:
        raise AssemblyError("raw/manifest.json must declare the complete pages array")
    file_key = raw_manifest.get("fileKey")
    if not file_key:
        raise AssemblyError("raw/manifest.json is missing fileKey")
    page_ids = [str(page.get("id")) for page in expected_pages]
    if len(set(page_ids)) != len(page_ids):
        raise AssemblyError("raw/manifest.json declares duplicate page IDs")
    components, variants, pages, snapshots = [], [], [], []
    diagnostics = {"errors": [], "warnings": []}
    def issue(level, code, message, **details):
        diagnostics[level].append({"code": code, "message": message, **details})
    for declared in expected_pages:
        label = str(declared["id"]).replace(":", "-")
        page, provenance = decode_chunks(root / "raw/chunks" / label, root)
        if page.get("fileKey") != file_key or str(page.get("page", {}).get("id")) != str(declared["id"]):
            raise AssemblyError("Snapshot identity does not match declared page " + str(declared["id"]))
        if page["page"].get("name") != declared.get("name"):
            issue("warnings", "page-name-drift", "Page name differs from manifest", pageId=declared["id"],
                  declared=declared.get("name"), exported=page["page"].get("name"))
        local_components = page.get("components", [])
        local_variants = page.get("variants", [])
        actual = {"sets": sum(item.get("kind") == "component_set" for item in local_components),
                  "standalone": sum(item.get("kind") == "standalone" for item in local_components),
                  "variants": len(local_variants), "total": len(local_components) + len(local_variants)}
        if page.get("counts") != actual:
            issue("errors", "page-counts", "Exported counts do not match definition arrays", pageId=declared["id"],
                  declared=page.get("counts"), actual=actual)
        for item in local_components:
            method = "importComponentSetByKeyAsync" if item.get("kind") == "component_set" else "importComponentByKeyAsync"
            components.append(enrich(item, file_key, label, date, method))
        variants.extend(enrich(item, file_key, label, date, "importComponentByKeyAsync") for item in local_variants)
        pages.append({**page, "components": [item["id"] for item in local_components],
                      "variants": [item["id"] for item in local_variants], "counts": actual,
                      "url": node_url(file_key, declared["id"]), "provenance": provenance,
                      "navigationNote": "Root frames and containers are navigation/examples, not additional component definitions."})
        snapshots.append(provenance)
    foundation, provenance = decode_chunks(root / "raw/chunks/foundations", root)
    if foundation.get("fileKey") != file_key:
        raise AssemblyError("Foundations fileKey does not match raw manifest")
    snapshots.append(provenance)
    variables = {"collections": foundation.get("collections", []),
                 "variables": [enrich(item, file_key, "foundations", date, "importVariableByKeyAsync")
                               for item in foundation.get("variables", [])]}
    styles = {kind: [enrich(item, file_key, "foundations", date, "importStyleByKeyAsync")
                     for item in foundation.get("styles", {}).get(kind, [])]
              for kind in ("text", "paint", "effect", "grid")}
    for kind, expected_count in raw_manifest.get("styleCounts", {}).items():
        if kind in styles and expected_count != len(styles[kind]):
            issue("errors", "foundation-style-count", "Foundation style count differs from raw manifest",
                  styleType=kind, declared=expected_count, actual=len(styles[kind]))
    for declared_collection in raw_manifest.get("collections", []):
        actual_count = sum(item.get("collectionId") == declared_collection.get("id") for item in variables["variables"])
        expected_count = declared_collection.get("variableCount")
        if expected_count is not None and expected_count != actual_count:
            issue("errors", "foundation-variable-count", "Foundation collection count differs from raw manifest",
                  collectionId=declared_collection.get("id"), declared=expected_count, actual=actual_count)
    definitions = components + variants
    ids = [str(item.get("id")) for item in definitions]
    for identity, count in collections.Counter(ids).items():
        if count > 1:
            issue("errors", "duplicate-id", "Definition ID occurs more than once", id=identity, count=count)
    by_id = {str(item.get("id")): item for item in definitions}
    families_by_id = {str(item.get("id")): item for item in components}
    for variant in variants:
        owner = families_by_id.get(str(variant.get("ownerId")))
        if not owner or owner.get("kind") != "component_set":
            issue("errors", "variant-owner", "Variant owner is not an inventoried component set",
                  id=variant.get("id"), ownerId=variant.get("ownerId"))
        elif owner.get("pageId") != variant.get("pageId"):
            issue("errors", "variant-page", "Variant and owner have different pages", id=variant.get("id"))
    for item in definitions:
        if str(item.get("pageId")) not in page_ids:
            issue("errors", "definition-page", "Definition references an undeclared page", id=item.get("id"))
    all_keyed = definitions + variables["collections"] + variables["variables"]
    all_keyed += [item for entries in styles.values() for item in entries]
    for item in all_keyed:
        key = item.get("key")
        if not key:
            issue("warnings", "missing-key", "No import key exported; inventory does not imply import availability", id=item.get("id"))
        elif not re.fullmatch(r"[0-9a-fA-F]{40}", str(key)):
            issue("errors", "invalid-key", "Import key is not a full 40-character Figma key", id=item.get("id"), key=key)
    named = collections.defaultdict(list)
    for item in components:
        named[item.get("name", "")].append(item)
    for name, entries in sorted(named.items()):
        if len(entries) > 1:
            issue("warnings", "duplicate-name", "Use node IDs or keys to disambiguate this family name", name=name,
                  definitions=[{"id": item["id"], "pageName": item.get("pageName")} for item in entries])
    collection_by_id = {str(item.get("id")): item for item in variables["collections"]}
    variable_by_id = {str(item.get("id")): item for item in variables["variables"]}
    variable_by_key = {item.get("key"): item for item in variables["variables"] if item.get("key")}
    unresolved_aliases = collections.defaultdict(list)
    for variable in variables["variables"]:
        collection = collection_by_id.get(str(variable.get("collectionId")))
        if not collection:
            issue("errors", "variable-collection", "Variable collection is not present", id=variable.get("id"))
        else:
            mode_ids = {str(mode.get("modeId")) for mode in collection.get("modes", [])}
            for mode_id in variable.get("valuesByMode", {}):
                if str(mode_id) not in mode_ids:
                    issue("errors", "variable-mode", "Variable references an unknown collection mode",
                          id=variable.get("id"), modeId=mode_id)
        for alias in alias_ids(variable.get("valuesByMode", {})):
            if alias not in variable_by_id and embedded_key(alias) not in variable_by_key:
                unresolved_aliases[alias].append(variable.get("id"))
    for alias, sources in sorted(unresolved_aliases.items()):
        issue("warnings", "external-variable-alias", "Alias target is not in local foundations; external resolution was not tested",
              targetId=alias, sources=sorted(set(sources)))
    for collection in variables["collections"]:
        declared_ids = set(map(str, collection.get("variableIds", [])))
        actual_ids = {identity for identity, variable in variable_by_id.items()
                      if str(variable.get("collectionId")) == str(collection.get("id"))}
        if declared_ids != actual_ids:
            issue("errors", "collection-membership", "Collection variableIds differ from exported variables", id=collection.get("id"),
                  missing=sorted(declared_ids - actual_ids), unexpected=sorted(actual_ids - declared_ids))
    style_ids = {str(item.get("id")) for entries in styles.values() for item in entries}
    style_by_key = {item.get("key"): item for entries in styles.values() for item in entries if item.get("key")}
    unresolved_bindings = collections.defaultdict(set)
    unresolved_styles = collections.defaultdict(set)
    variable_references = collections.defaultdict(set)
    style_references = collections.defaultdict(set)
    for definition in definitions:
        binding_values = [definition.get("usedBindings", []), definition.get("bindings", {})]
        for binding_value in binding_values:
            for target in alias_ids(binding_value):
                variable_references[target].add(definition["id"])
                if target not in variable_by_id and embedded_key(target) not in variable_by_key:
                    unresolved_bindings[target].add(definition["id"])
        style_values = [entry.get("styles", {}) for entry in definition.get("usedStyles", [])]
        style_values.append(definition.get("styles", {}))
        for style_value in style_values:
            for target in style_value.values():
                if target:
                    style_references[str(target)].add(definition["id"])
                    if str(target) not in style_ids and embedded_key(target) not in style_by_key:
                        unresolved_styles[str(target)].add(definition["id"])
    for target, sources in sorted(unresolved_bindings.items()):
        issue("warnings", "external-variable-binding", "Bound variable is absent from local foundations; external resolution was not tested",
              targetId=target, sources=sorted(sources))
    for target, sources in sorted(unresolved_styles.items()):
        issue("warnings", "external-style-reference", "Referenced style is absent from local foundations; external resolution was not tested",
              targetId=target, sources=sorted(sources))
    edges = []
    definition_by_key = {item.get("key"): item for item in definitions if item.get("key")}
    for component in components:
        for dependency in component.get("dependencies", []):
            target_id = str(dependency.get("id"))
            canonical_target = by_id.get(target_id) or definition_by_key.get(dependency.get("key"))
            status = ("local-inventory" if target_id in by_id else "local-key-identity" if canonical_target
                      else "external-unverified" if dependency.get("remote") else "unresolved")
            edge = {**dependency, "fromId": component["id"], "inspection": component.get("layerInspection"),
                    "resolution": status, "importVerified": False}
            if canonical_target:
                edge["canonicalTargetId"] = canonical_target["id"]
            edges.append(edge)
            if status == "unresolved":
                issue("warnings", "unresolved-dependency", "Representative definition has a dependency absent from inventory", **edge)
    def reference_records(references, by_id, by_key):
        records = []
        for target, sources in sorted(references.items()):
            canonical = by_id.get(target) or by_key.get(embedded_key(target))
            records.append({"targetId": target, "sources": sorted(sources),
                            "resolution": "local-id" if target in by_id else "local-key-identity" if canonical else "not-in-local-inventory",
                            "canonicalId": canonical.get("id") if canonical else None,
                            "key": canonical.get("key") if canonical else embedded_key(target),
                            "importVerified": False})
        return records
    style_by_id = {str(item.get("id")): item for entries in styles.values() for item in entries}
    dependencies = {"coverage": "Direct dependencies of each family representative only; nested instance internals and other variants were not expanded. Stable-key identity is not a verified import.",
                    "nodes": [{key: item.get(key) for key in ("id", "key", "name", "kind", "pageId", "url")}
                              for item in definitions], "edges": edges,
                    "variableReferences": reference_records(variable_references, variable_by_id, variable_by_key),
                    "styleReferences": reference_records(style_references, style_by_id, style_by_key)}
    counts = {"pages": len(pages), "componentSets": sum(item.get("kind") == "component_set" for item in components),
              "standaloneComponents": sum(item.get("kind") == "standalone" for item in components),
              "families": len(components), "variants": len(variants), "definitions": len(definitions),
              "collections": len(variables["collections"]), "variables": len(variables["variables"]),
              "styles": {kind: len(entries) for kind, entries in styles.items()}, "dependencyEdges": len(edges)}
    diagnostics["counts"] = counts
    diagnostics["valid"] = not diagnostics["errors"]
    manifest = {"schemaVersion": VERSION, "fileKey": file_key, "name": raw_manifest.get("name", "Hydration Design Library"),
                "exportDate": date, "assembledDate": date, "generator": "scripts/assemble_catalog.py", "counts": counts,
                "pages": [{"id": item["page"]["id"], "name": item["page"]["name"], "counts": item["counts"]} for item in pages],
                "rawManifest": "raw/manifest.json",
                "rawManifestSha256": hashlib.sha256((root / "raw/manifest.json").read_bytes()).hexdigest(),
                "rawProvenance": snapshots,
                "confidence": {"inventory": "live-export", "import": "not-tested", "behavior": "not-tested"},
                "coverage": {"allDeclaredPages": True, "definitionCountReconciled": not diagnostics["errors"],
                             "layers": "Family representative only; owned layers are filtered; nested instances are not recursively expanded.",
                             "variants": "Actual exported variants only; no Cartesian products inferred.",
                             "publication": "Not verified. A key or local definition does not prove published import availability.",
                             "navigation": "Page roots and ancestor containers are navigation, not extra component definitions."}}
    return {"manifest": manifest, "components": components, "variants": variants, "variables": variables,
            "styles": styles, "pages": pages, "dependencies": dependencies, "diagnostics": diagnostics}


def md(value):
    return str(value).replace("|", "\\|").replace("\r", "").replace("\n", "<br>")


def link(item):
    return "[%s](%s)" % (md(item.get("name", item.get("id", ""))).replace("[", "\\[").replace("]", "\\]"), item["url"])


def shelf(component):
    return " / ".join(part.get("name", "") if isinstance(part, dict) else str(part)
                      for part in component.get("path", []) if not isinstance(part, dict) or part.get("type") != "PAGE") or "Page root"


def property_line(component):
    return "; ".join("`%s` %s%s" % (md(name), prop.get("type", "?"),
                                   "=" + md(compact(prop.get("defaultValue"))) if "defaultValue" in prop else "")
                     for name, prop in component.get("properties", {}).items()) or "—"


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def generate_docs(root, catalog):
    pages_directory = root / "pages"
    pages_directory.mkdir(exist_ok=True)
    components = catalog["components"]
    variant_counts = collections.Counter(item.get("ownerId") for item in catalog["variants"])
    index = ["# Library page map", "", "All declared pages, including separators and pages without definitions. Root frames are navigation/examples.", "",
             "| Page | Component sets | Standalone | Actual variants | Local map |", "|---|---:|---:|---:|---|"]
    for page in catalog["pages"]:
        info = page["page"]
        filename = str(info["id"]).replace(":", "-") + ".md"
        counts = page["counts"]
        index.append("| [%s](%s) | %s | %s | %s | [Open](pages/%s) |" % (
            md(info["name"]), page["url"], counts["sets"], counts["standalone"], counts["variants"], filename))
        lines = ["# " + info["name"], "", "[Open Figma page](%s) · Page ID `%s`" % (page["url"], info["id"]), "",
                 "Inventory: %s sets, %s standalone components, %s actual variants. Import and behavior have not been tested." % (
                     counts["sets"], counts["standalone"], counts["variants"]), "",
                 "## Navigation roots", "", "These frames, sections, and examples are not additional component definitions.", "",
                 "| Name | Type | ID | Visible | Size |", "|---|---|---|---|---|"]
        for navigation in page.get("roots", []):
            layout = navigation.get("layout", {})
            lines.append("| [%s](%s) | %s | `%s` | %s | %s × %s |" % (
                md(navigation.get("name", "")), node_url(catalog["manifest"]["fileKey"], navigation.get("id")),
                navigation.get("type", ""), navigation.get("id", ""), navigation.get("visible", "?"),
                layout.get("width", "?"), layout.get("height", "?")))
        if page.get("containers"):
            lines += ["", "## Ancestor containers", "", "These sections and frames organize the definitions below.", "",
                      "| Container | Type | ID | Parent ID |", "|---|---|---|---|"]
            for container in page["containers"]:
                lines.append("| [%s](%s) | %s | `%s` | `%s` |" % (
                    md(container.get("name", "")), node_url(catalog["manifest"]["fileKey"], container.get("id")),
                    container.get("type", ""), container.get("id", ""), container.get("parentId", "")))
        groups = collections.defaultdict(list)
        for component in components:
            if component.get("pageId") == info["id"]:
                groups[shelf(component)].append(component)
        if not groups:
            lines += ["", "No component definitions on this page."]
        for group, entries in sorted(groups.items()):
            lines += ["", "## " + group, "", "| Definition | Kind / actual variants | Visible at export | Node ID | Full import key | Exact properties / defaults |",
                      "|---|---|---|---|---|---|"]
            for item in sorted(entries, key=lambda item: (item["name"].casefold(), item["id"])):
                lines.append("| %s | %s / %s | %s | `%s` | `%s` | %s |" % (
                    link(item), item["kind"], variant_counts[item["id"]], item.get("visible", "unknown"),
                    item["id"], item.get("key", ""), property_line(item)))
        lines += ["", "Exact layout, nested property references, representative dependencies, and style/variable bindings are in `catalog/components.json`.",
                  "Use `lookup.py show NODE_ID --json`; enumerate actual variant tuples with `lookup.py variants NODE_ID`.", ""]
        (pages_directory / filename).write_text("\n".join(lines), encoding="utf-8")
    (root / "PAGES.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    families = ["# Component families", "", "Complete non-icon family directory. Searchable icon definitions remain fully listed in page maps and JSON.", "",
                "| Family | Page / shelf | Kind | Actual variants | Visible at export | ID | Full import key |", "|---|---|---|---:|---|---|---|"]
    for item in sorted((item for item in components if not is_icon(item)), key=lambda item: (item["name"].casefold(), item["id"])):
        families.append("| %s | %s / %s | %s | %s | %s | `%s` | `%s` |" % (
            link(item), md(item.get("pageName", "")), md(shelf(item)), item["kind"], variant_counts[item["id"]],
            item.get("visible", "unknown"), item["id"], item.get("key", "")))
    prefixes = collections.Counter((item.get("pageName", ""), item["name"].split("/")[0]) for item in components if is_icon(item))
    families += ["", "## Icon prefix counts", "", "Classification uses icon page names or explicit icon prefixes; it is a navigation aid, not a semantic claim.", "",
                 "| Page | Prefix | Families |", "|---|---|---:|"]
    for (page_name, prefix), count in sorted(prefixes.items()):
        families.append("| %s | %s | %s |" % (md(page_name), md(prefix), count))
    (root / "FAMILIES.md").write_text("\n".join(families) + "\n", encoding="utf-8")
    foundation = ["# Variables and styles", "", "Every exported local variable and style is listed below with full IDs and keys. Alias values remain aliases.",
                  "Mode defaults are source data; selecting a project mode is a separate decision. Import and rendering behavior are untested."]
    for collection in catalog["variables"]["collections"]:
        modes = collection.get("modes", [])
        mode_names = {mode["modeId"]: mode.get("name", mode["modeId"]) for mode in modes}
        foundation += ["", "## Collection: " + collection["name"], "", "ID `%s` · Key `%s` · Default mode `%s`" % (
            collection["id"], collection.get("key", ""), collection.get("defaultModeId", "")), "",
            "Modes: " + "; ".join("%s (`%s`)" % (md(mode.get("name", "")), mode["modeId"]) for mode in modes), "",
            "| Variable | ID | Full key | Type / scopes | Values by mode |", "|---|---|---|---|---|"]
        for variable in sorted((item for item in catalog["variables"]["variables"] if item.get("collectionId") == collection["id"]),
                               key=lambda item: (item["name"].casefold(), item["id"])):
            values = "; ".join("%s (`%s`): `%s`" % (md(mode_names.get(mode_id, "UNKNOWN")), mode_id, md(compact(value)))
                               for mode_id, value in variable.get("valuesByMode", {}).items())
            foundation.append("| %s | `%s` | `%s` | %s / %s | %s |" % (
                md(variable["name"]), variable["id"], variable.get("key", ""), variable.get("resolvedType", ""),
                md(compact(variable.get("scopes", []))), values))
    for kind, entries in catalog["styles"].items():
        foundation += ["", "## " + kind.title() + " styles", "", "| Name | ID | Full key | Definition |", "|---|---|---|---|"]
        for style in sorted(entries, key=lambda item: (item["name"].casefold(), item["id"])):
            attributes = {key: value for key, value in style.items() if key not in (
                "id", "key", "name", "type", "fileKey", "url", "importMethod", "provenance", "verification")}
            foundation.append("| %s | `%s` | `%s` | `%s` |" % (md(style["name"]), style["id"], style.get("key", ""), md(compact(attributes))))
    (root / "FOUNDATIONS.md").write_text("\n".join(foundation) + "\n", encoding="utf-8")
    schema = """# Catalog schema and coverage

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
python3 scripts/assemble_catalog.py --check-only
python3 scripts/lookup.py search "receiving account"
python3 scripts/lookup.py show NODE_ID --json
python3 scripts/lookup.py variants COMPONENT_SET_ID "size=sm"
```

Assembly is offline and read-only toward Figma. `--check-only` validates input and references without rewriting catalog or documentation. Diagnostics errors cause exit status 1; transport/JSON failures cause status 2.
"""
    (root / "SCHEMA.md").write_text(schema, encoding="utf-8")


def run(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, help="Library documentation root (contains raw/)")
    parser.add_argument("--check-only", action="store_true", help="Validate without writing files")
    parser.add_argument("--date", default="2026-10-26", help="Recorded source snapshot date (YYYY-MM-DD)")
    args = parser.parse_args(argv)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        parser.error("--date must be YYYY-MM-DD")
    root = (args.root or Path(__file__).resolve().parent.parent).resolve()
    try:
        catalog = assemble(root, args.date)
        if not args.check_only:
            directory = root / "catalog"
            directory.mkdir(exist_ok=True)
            for name, value in catalog.items():
                write_json(directory / (name + ".json"), value)
            generate_docs(root, catalog)
        diagnostics = catalog["diagnostics"]
        print(compact({"root": str(root), "checkOnly": args.check_only, "valid": diagnostics["valid"],
                       "counts": diagnostics["counts"], "errors": len(diagnostics["errors"]),
                       "warnings": len(diagnostics["warnings"])}))
        for issue in diagnostics["errors"][:10]:
            print("ERROR " + compact(issue), file=sys.stderr)
        return 0 if diagnostics["valid"] else 1
    except (AssemblyError, OSError, KeyError, TypeError) as error:
        print("assemble_catalog: " + str(error), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(run())
