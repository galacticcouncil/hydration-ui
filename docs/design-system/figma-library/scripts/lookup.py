#!/usr/bin/env python3
"""Search a Figma library catalog without third-party packages or network access.

Examples:
  python3 scripts/lookup.py search "receiving account"
  python3 scripts/lookup.py show "accountTile" --json
  python3 scripts/lookup.py variants "button/primary" "size=sm"
  python3 scripts/lookup.py --catalog-root references/catalog summary
"""

import argparse
import json
import re
import shlex
import sys
import unicodedata
from pathlib import Path
from urllib.parse import quote


class CatalogError(Exception):
    """A missing or malformed local catalog, or an ambiguous lookup."""


def fold(value):
    return "".join(
        char for char in unicodedata.normalize("NFKD", str(value)).casefold()
        if not unicodedata.combining(char)
    )


def words(value):
    text = fold(re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", str(value)))
    result = re.findall(r"[^\W_]+", text, re.UNICODE)
    return result or [char for char in text if not char.isspace()]


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def read_json(path, fallback=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        if fallback is not None:
            return fallback
        raise CatalogError("Missing catalog file: " + str(path)) from None
    except (OSError, ValueError) as error:
        raise CatalogError("Cannot read %s: %s" % (path, error)) from error


def find_catalog(explicit=None, script_path=None, cwd=None):
    """Accept a catalog itself, a project doc folder, or a reusable skill folder."""
    script_path = Path(script_path or __file__).resolve()
    cwd = Path(cwd or Path.cwd()).resolve()
    bases = [Path(explicit).expanduser().resolve()] if explicit else [
        script_path.parent.parent, cwd,
        cwd / "docs/design-system/figma-library",
    ]
    candidates = []
    for base in bases:
        candidates.extend([base, base / "catalog", base / "references/catalog"])
    for candidate in candidates:
        if (candidate / "manifest.json").is_file():
            return candidate
    raise CatalogError(
        "Catalog not found. Use --catalog-root with a folder containing "
        "manifest.json, or its project/skill parent. Searched: "
        + ", ".join(str(path) for path in candidates)
    )


def path_names(record):
    return [part.get("name", "") if isinstance(part, dict) else str(part)
            for part in record.get("path", []) if not isinstance(part, dict) or part.get("type") != "PAGE"]


def import_method(kind, record):
    if kind == "component":
        return ("importComponentSetByKeyAsync" if record.get("kind") == "component_set"
                else "importComponentByKeyAsync")
    return {"variant": "importComponentByKeyAsync", "variable": "importVariableByKeyAsync",
            "style": "importStyleByKeyAsync"}.get(kind)


def parse_variant_query(query, property_names):
    """Use real property names as boundaries, so spaces are valid in keys/values."""
    names = {" ".join(fold(name).split()): name for name in property_names}
    if not names:
        return [], words(query)
    patterns = [re.escape(name).replace(r"\ ", r"\s+")
                for name in sorted(names.values(), key=lambda name: (-len(name), name))]
    assignment = re.compile(
        r"(?<![^\s,;])(?P<quote>[\"']?)(?P<key>" + "|".join(patterns) + r")(?P=quote)\s*=\s*",
        re.IGNORECASE,
    )
    boundaries = []
    quote_char = None
    position = 0
    while position < len(query):
        char = query[position]
        if quote_char:
            if char == "\\" and quote_char == '"':
                position += 2
                continue
            if char == quote_char:
                quote_char = None
        else:
            match = assignment.match(query, position)
            if match:
                key = names[" ".join(fold(match.group("key")).split())]
                boundaries.append((position, match.end(), key))
                position = match.end()
                continue
            if char in ('"', "'") and (position == 0 or query[position - 1].isspace() or query[position - 1] in "=,;"):
                quote_char = char
        position += 1
    if quote_char:
        raise CatalogError("Invalid variant query: unterminated quoted name or value")
    if not boundaries:
        return [], words(query)
    assignments = []
    for index, (_, start, key) in enumerate(boundaries):
        end = boundaries[index + 1][0] if index + 1 < len(boundaries) else len(query)
        value = query[start:end].strip().rstrip(",;").strip()
        if value.startswith(('"', "'")):
            try:
                value = " ".join(shlex.split(value))
            except ValueError as error:
                raise CatalogError("Invalid variant query: " + str(error)) from error
        assignments.append((key, value))
    return assignments, words(query[:boundaries[0][0]].strip(" ,;"))


class Catalog:
    def __init__(self, root):
        self.root = Path(root)
        self.manifest = read_json(self.root / "manifest.json")
        if not isinstance(self.manifest, dict):
            raise CatalogError("manifest.json must contain an object")
        self.components = self._list("components.json")
        self.variants = self._list("variants.json", optional=True)
        variables = read_json(self.root / "variables.json", {"collections": [], "variables": []})
        if not isinstance(variables, dict):
            raise CatalogError("variables.json must contain an object")
        self.variables = variables.get("variables", [])
        self.collections = variables.get("collections", [])
        self.styles = read_json(self.root / "styles.json", {})
        if not isinstance(self.styles, dict):
            raise CatalogError("styles.json must contain an object")
        self.routes = self._list("routes.json", optional=True)
        self.records = []
        for kind, entries in (("component", self.components), ("variant", self.variants),
                              ("variable", self.variables)):
            self._add_records(kind, entries)
        for style_type in ("text", "effect", "paint", "grid"):
            self._add_records("style", self.styles.get(style_type, []), style_type)
        self.components_by_id = {str(item.get("id")): item for item in self.components}
        self.variables_by_id = {str(item.get("id")): item for item in self.variables}
        self.variables_by_key = {item.get("key"): item for item in self.variables if item.get("key")}
        self.collections_by_id = {str(item.get("id")): item for item in self.collections}

    def _list(self, filename, optional=False):
        value = read_json(self.root / filename, [] if optional else None)
        if not isinstance(value, list):
            raise CatalogError(filename + " must contain an array")
        return value

    def _add_records(self, kind, entries, style_type=None):
        if not isinstance(entries, list) or any(not isinstance(item, dict) for item in entries):
            raise CatalogError(kind + " records must be objects in an array")
        self.records.extend({"recordKind": kind, "record": item, "styleType": style_type}
                            for item in entries)

    def _file_key(self, record):
        source = record.get("source", {})
        own = record.get("fileKey") or source.get("fileKey")
        manifest_source = self.manifest.get("source", {})
        return (own or self.manifest.get("fileKey") or manifest_source.get("fileKey")
                or self.manifest.get("library", {}).get("fileKey"))

    def url(self, record):
        explicit = record.get("url") or record.get("source", {}).get("url")
        if explicit:
            return explicit
        file_key = self._file_key(record)
        node_id = record.get("id")
        if file_key and node_id and re.fullmatch(r"\d+:\d+", str(node_id)):
            return "https://www.figma.com/design/%s/?node-id=%s" % (
                quote(str(file_key), safe=""), quote(str(node_id).replace(":", "-"), safe="-"))
        if file_key:
            return "https://www.figma.com/design/%s/" % quote(str(file_key), safe="")
        return None

    def _alias_names(self, value, seen=None):
        seen = set() if seen is None else seen
        names = []
        if isinstance(value, dict):
            if value.get("type") == "VARIABLE_ALIAS":
                alias_id = str(value.get("id"))
                if alias_id not in seen:
                    seen.add(alias_id)
                    target = self.variables_by_id.get(alias_id)
                    if not target:
                        key_match = re.match(r"^VariableID:([0-9a-fA-F]{40})/", alias_id)
                        if key_match:
                            target = self.variables_by_key.get(key_match.group(1))
                    if target:
                        names.append(target.get("name", ""))
                        names.extend(self._alias_names(target.get("valuesByMode", {}), seen))
            for child in value.values():
                names.extend(self._alias_names(child, seen))
        elif isinstance(value, list):
            for child in value:
                names.extend(self._alias_names(child, seen))
        return names

    def _route_matches(self, query):
        query_words = words(query)
        matches = []
        for route in self.routes:
            phrases = [route.get("pattern", "")] + route.get("keywords", [])
            score = 0
            for phrase in phrases:
                if fold(query) == fold(phrase):
                    score = max(score, 8800)
                elif query_words and all(word in fold(phrase) for word in query_words):
                    score = max(score, 6500)
            if score:
                matches.append((score, route))
        return sorted(matches, key=lambda pair: (-pair[0], fold(pair[1].get("pattern", ""))))

    def _matches_page(self, record, page):
        if not page:
            return True
        owner = self.components_by_id.get(str(record.get("ownerId")), {})
        page_id = record.get("pageId") or owner.get("pageId")
        page_name = record.get("pageName") or owner.get("pageName", "")
        return str(page_id) == page or fold(page) in fold(page_name)

    def search(self, query, kind="all", page=None):
        terms = words(query)
        routes = self._route_matches(query)
        recommended = {}
        for route_score, route in routes:
            for component_id in route.get("componentIds", []):
                recommended.setdefault(str(component_id), []).append((route_score, route))
        matches = []
        for item in self.records:
            record = item["record"]
            if kind != "all" and item["recordKind"] != kind:
                continue
            if not self._matches_page(record, page):
                continue
            name = str(record.get("name", ""))
            path = " / ".join(path_names(record) + [name])
            values = [name, path, record.get("id", ""), record.get("key", ""),
                      record.get("description", ""),
                      compact(record.get("properties", {})),
                      compact(record.get("variantProperties", {}))]
            if item["recordKind"] == "variable":
                values += [compact(record.get("valuesByMode", {}))]
                values += self._alias_names(record.get("valuesByMode", {}))
                values += [self.collections_by_id.get(str(record.get("collectionId")), {}).get("name", "")]
            haystack = fold(" ".join(str(value) for value in values))
            score = 0
            if query == str(record.get("id")) or query == str(record.get("key")):
                score = 10000
            elif fold(query) == fold(name):
                score = 9000
            elif fold(query) == fold(path):
                score = 8500
            elif terms and all(term in fold(name) for term in terms):
                score = 7600
            elif terms and all(term in fold(path) for term in terms):
                score = 7000
            elif terms and all(term in haystack for term in terms):
                score = 3000
            recs = recommended.get(str(record.get("id")), []) if item["recordKind"] == "component" else []
            if recs:
                score = max(score, recs[0][0])
            if score:
                matches.append({**item, "score": score,
                                "recommendations": [route for _, route in recs]})
        return sorted(matches, key=lambda item: (
            -item["score"], fold(item["record"].get("name", "")),
            item["recordKind"], str(item["record"].get("id", ""))))

    def show(self, query):
        # Identity takes precedence, so a node ID can always disambiguate names.
        identity = [item for item in self.records
                    if query in (str(item["record"].get("id")), str(item["record"].get("key")))]
        if identity:
            return identity
        return [item for item in self.records if fold(query) == fold(item["record"].get("name", ""))]

    def family_variants(self, family, query=""):
        matches = [item for item in self.show(family) if item["recordKind"] == "component"]
        if len(matches) != 1:
            if not matches:
                raise CatalogError("No component family named " + repr(family) + "; search first, then use its ID.")
            raise CatalogError("Ambiguous family %r; use one of these IDs: %s" % (
                family, ", ".join(str(item["record"].get("id")) for item in matches)))
        owner = matches[0]["record"]
        entries = [item for item in self.records if item["recordKind"] == "variant"
                   and str(item["record"].get("ownerId")) == str(owner.get("id"))]
        if query:
            property_names = {name for item in entries for name in item["record"].get("variantProperties", {})}
            assignments, terms = parse_variant_query(query, property_names)
            def matches_query(item):
                record = item["record"]
                actual = {fold(key): fold(value) for key, value in record.get("variantProperties", {}).items()}
                if any(actual.get(fold(key)) != fold(value) for key, value in assignments):
                    return False
                text = record.get("name", "") + " " + " ".join(
                    "%s=%s" % pair for pair in record.get("variantProperties", {}).items())
                return all(term in fold(text) for term in terms)
            entries = [item for item in entries if matches_query(item)]
        entries.sort(key=lambda item: (fold(item["record"].get("name", "")),
                                       str(item["record"].get("id", ""))))
        return owner, entries

    def pages(self):
        pages = {}
        declared = self.manifest.get("pages", [])
        if isinstance(declared, list):
            for page in declared:
                if isinstance(page, dict):
                    page_id = str(page.get("id", page.get("pageId", "")))
                    pages[page_id] = {"id": page_id, "name": page.get("name", page.get("pageName", "")),
                                      "components": 0, "variants": 0}
        for item in self.records:
            if item["recordKind"] not in ("component", "variant"):
                continue
            record = item["record"]
            page_id = str(record.get("pageId", ""))
            if not page_id:
                continue
            page = pages.setdefault(page_id, {"id": page_id, "name": record.get("pageName", ""),
                                              "components": 0, "variants": 0})
            page["components" if item["recordKind"] == "component" else "variants"] += 1
        return sorted(pages.values(), key=lambda page: (fold(page["name"]), page["id"]))

    def result(self, item, detail=False):
        record = item["record"]
        output = dict(record) if detail else {key: record[key] for key in (
            "id", "key", "name", "kind", "pageId", "pageName", "path", "properties",
            "variantProperties", "description", "collectionId", "resolvedType", "valuesByMode", "visible", "remote", "verification"
        ) if key in record}
        output.update({"recordKind": item["recordKind"], "url": self.url(record),
                       "importMethod": import_method(item["recordKind"], record)})
        if item.get("styleType"):
            output["styleType"] = item["styleType"]
        if "score" in item:
            output["score"] = item["score"]
        if item.get("recommendations"):
            output["recommendations"] = item["recommendations"]
        return output


def property_summary(properties):
    result = []
    for name, prop in sorted(properties.items())[:12]:
        options = prop.get("variantOptions")
        suffix = ""
        if options:
            suffix = " [" + ", ".join(str(option) for option in options[:8])
            if len(options) > 8:
                suffix += ", +%s more; --json for all" % (len(options) - 8)
            suffix += "]"
        result.append("%s:%s=%s%s" % (name, prop.get("type", "?"),
                                      compact(prop.get("defaultValue")), suffix))
    if len(properties) > 12:
        result.append("+%s properties; --json for all" % (len(properties) - 12))
    return "; ".join(result)


def print_record(record, detail=False):
    print("%s  %s  [%s]" % (record["recordKind"], record.get("name", ""), record.get("id", "")))
    path = " / ".join(path_names(record))
    if record.get("pageName") or path:
        print("  Page/path: " + " / ".join(part for part in (record.get("pageName"), path) if part))
    print("  Key: " + str(record.get("key") or "unavailable"))
    if record.get("key"):
        print("  Import: %s(%s)" % (record["importMethod"], compact(record["key"])))
    if record.get("url"):
        print("  URL: " + record["url"])
    if record.get("visible") is False:
        print("  Visibility: hidden in the source hierarchy")
    checks = record.get("verification", {})
    if checks:
        print("  Checks: " + "; ".join("%s=%s" % (kind, checks.get(kind, {}).get("status", "unknown"))
                                      for kind in ("inventory", "import", "behavior")))
    if record.get("properties"):
        print("  Properties: " + property_summary(record["properties"]))
    if record.get("variantProperties"):
        print("  Actual variant: " + compact(record["variantProperties"]))
    if record.get("valuesByMode"):
        print("  Mode values: " + compact(record["valuesByMode"]))
    for route in record.get("recommendations", []):
        print("  Recommended for: " + route.get("pattern", ""))
        if route.get("chooseWhen"):
            print("    Choose: " + str(route["chooseWhen"]))
        if route.get("avoidFor"):
            print("    Avoid: " + str(route["avoidFor"]))
    if detail:
        for field in ("description", "layout", "dependencies", "bindings", "styles", "verification"):
            if record.get(field):
                print("  %s: %s" % (field, compact(record[field])))
        if record.get("layers"):
            print("  Layers: %s (use --json for exact nested properties and bindings)" % len(record["layers"]))


def positive_integer(value):
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return number


def parser():
    cli = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    def common(target):
        target.add_argument("--catalog-root", default=argparse.SUPPRESS,
                            help="Catalog folder, project doc folder, or reusable skill folder")
        target.add_argument("--json", action="store_true", default=argparse.SUPPRESS,
                            help="Return structured JSON without truncating individual records")
    common(cli)
    commands = cli.add_subparsers(dest="command", required=True)
    search = commands.add_parser("search", help="Rank names, paths, properties, aliases, and recommendations")
    common(search)
    search.add_argument("query", nargs="+")
    search.add_argument("--kind", choices=("component", "variant", "variable", "style", "all"), default="all")
    search.add_argument("--page", help="Exact page ID or part of its name")
    search.add_argument("--limit", type=positive_integer, default=10)
    show = commands.add_parser("show", help="Show all exact name matches, or a single ID/key")
    common(show)
    show.add_argument("identity", nargs="+")
    variants = commands.add_parser("variants", help="List only actual variants of a family")
    common(variants)
    variants.add_argument("family", help="Exact family name, node ID, or key")
    variants.add_argument("query", nargs="*", help="Optional variant name/property filter")
    variants.add_argument("--limit", type=positive_integer, default=25)
    for name in ("pages", "summary"):
        common(commands.add_parser(name))
    return cli


def run(argv=None):
    args = parser().parse_args(argv)
    try:
        catalog = Catalog(find_catalog(getattr(args, "catalog_root", None)))
        as_json = getattr(args, "json", False)
        if args.command in ("search", "show", "variants"):
            detail = args.command == "show"
            owner = None
            if args.command == "search":
                items = catalog.search(" ".join(args.query), args.kind, args.page)
            elif args.command == "show":
                items = catalog.show(" ".join(args.identity))
            else:
                owner, items = catalog.family_variants(args.family, " ".join(args.query))
            limit = getattr(args, "limit", len(items))
            records = [catalog.result(item, detail=detail) for item in items[:limit]]
            output = {"total": len(items), "returned": len(records), "truncated": len(records) < len(items),
                      "results": records}
            if owner:
                output["family"] = {"id": owner.get("id"), "name": owner.get("name"), "key": owner.get("key")}
            if as_json:
                print(json.dumps(output, ensure_ascii=False, indent=2))
            else:
                if owner:
                    print("Actual variants of %s [%s]" % (owner.get("name", ""), owner.get("id", "")))
                print("%s match(es); showing %s%s" % (
                    len(items), len(records), " (truncated; raise --limit)" if output["truncated"] else ""))
                for index, record in enumerate(records):
                    if index:
                        print()
                    print_record(record, detail=detail)
                if detail and len(items) > 1:
                    print("\nDuplicate exact name: use a node ID or full key to select one record.")
            return 0 if items else 1
        if args.command == "pages":
            output = catalog.pages()
            if as_json:
                print(json.dumps(output, ensure_ascii=False, indent=2))
            else:
                for page in output:
                    print("%s  %s — %s families, %s variants" % (
                        page["id"], page["name"], page["components"], page["variants"]))
        else:
            output = {"catalogRoot": str(catalog.root), "manifest": catalog.manifest,
                      "counts": {"components": len(catalog.components), "variants": len(catalog.variants),
                                 "variables": len(catalog.variables), "collections": len(catalog.collections),
                                 "styles": sum(len(values) for values in catalog.styles.values() if isinstance(values, list)),
                                 "routes": len(catalog.routes), "pages": len(catalog.pages())}}
            if as_json:
                print(json.dumps(output, ensure_ascii=False, indent=2))
            else:
                print("Catalog: " + str(catalog.root))
                print("Counts: " + ", ".join("%s %s" % (value, name) for name, value in output["counts"].items()))
                concise_manifest = {key: catalog.manifest[key] for key in (
                    "schemaVersion", "fileKey", "name", "exportDate", "assembledDate", "confidence", "coverage"
                ) if key in catalog.manifest}
                print("Manifest: " + compact(concise_manifest))
        return 0
    except CatalogError as error:
        print("lookup: " + str(error), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(run())
