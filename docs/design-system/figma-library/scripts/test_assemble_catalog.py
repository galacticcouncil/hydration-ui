"""Transport integrity and complete-page integration fixtures for the assembler."""

import base64
import contextlib
import io
import json
import struct
import tempfile
import unittest
from pathlib import Path

import assemble_catalog as assembler
import lookup


def encode(value):
    text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    dictionary = {bytes([index]): index for index in range(256)}
    previous = b""
    codes = []
    next_code = 256
    for number in text.encode("utf-8"):
        char = bytes([number])
        candidate = previous + char
        if candidate in dictionary:
            previous = candidate
            continue
        codes.append(dictionary[previous])
        if next_code < 65535:
            dictionary[candidate] = next_code
            next_code += 1
        else:
            codes.append(65535)
            dictionary = {bytes([index]): index for index in range(256)}
            next_code = 256
        previous = char
    if previous:
        codes.append(dictionary[previous])
    binary = b"".join(struct.pack(">H", code) for code in codes)
    return base64.b64encode(binary).decode("ascii"), len(text.encode("utf-16-le")) // 2


def write_chunks(root, label, value, size=80):
    encoded, json_length = encode(value)
    target = root / "raw/chunks" / label
    target.mkdir(parents=True, exist_ok=True)
    for offset in range(0, len(encoded), size):
        chunk = {"codec": assembler.CODEC, "offset": offset,
                 "nextOffset": offset + size if offset + size < len(encoded) else None,
                 "totalLength": len(encoded), "jsonLength": json_length,
                 "data": encoded[offset:offset + size]}
        (target / (str(offset) + ".json")).write_text(json.dumps(chunk), encoding="utf-8")
    return target


class TransportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_lzw_special_case_and_dictionary_reset(self):
        binary = b"".join(struct.pack(">H", code) for code in [65, 256, 65535, 66, 256])
        self.assertEqual(b"AAABBB", assembler.decode_lzw(binary))

    def test_unicode_round_trip_uses_javascript_utf16_length(self):
        value = {"name": "📚 électricité 🦩", "text": "abc" * 200}
        target = write_chunks(self.root, "1-2", value)
        decoded, provenance = assembler.decode_chunks(target, self.root)
        self.assertEqual(value, decoded)
        self.assertGreater(len(provenance["chunks"]), 1)
        self.assertEqual(64, len(provenance["decodedSha256"]))

    def test_missing_chunk_is_rejected(self):
        target = write_chunks(self.root, "1-2", {"name": "abcdef" * 100})
        (target / "80.json").unlink()
        with self.assertRaisesRegex(assembler.AssemblyError, "gap or overlap"):
            assembler.decode_chunks(target, self.root)

    def test_inconsistent_metadata_is_rejected(self):
        target = write_chunks(self.root, "1-2", {"name": "abcdef" * 100})
        path = target / "80.json"
        value = json.loads(path.read_text())
        value["jsonLength"] += 1
        path.write_text(json.dumps(value))
        with self.assertRaisesRegex(assembler.AssemblyError, "Inconsistent jsonLength"):
            assembler.decode_chunks(target, self.root)

    def test_equivalent_foundation_page_labels_are_accepted(self):
        target = write_chunks(self.root, "foundations", {"name": "abcdef" * 100})
        for path in target.glob("*.json"):
            value = json.loads(path.read_text())
            value.update({"mode": "foundations", "pageId": None if path.stem == "0" else "foundations"})
            path.write_text(json.dumps(value))
        value, _ = assembler.decode_chunks(target, self.root)
        self.assertEqual("abcdef" * 100, value["name"])

    def test_invalid_lzw_and_odd_bytes_are_rejected(self):
        with self.assertRaisesRegex(assembler.AssemblyError, "Invalid LZW code"):
            assembler.decode_lzw(struct.pack(">H", 300))
        with self.assertRaisesRegex(assembler.AssemblyError, "incomplete"):
            assembler.decode_lzw(b"a")

    def test_large_encoder_round_trip_crosses_dictionary_limit(self):
        import random
        rng = random.Random(7)
        value = {"random": "".join(chr(rng.randrange(32, 126)) for _ in range(240000))}
        payload, _ = encode(value)
        binary = base64.b64decode(payload)
        self.assertIn(65535, [code for (code,) in struct.iter_unpack(">H", binary)])
        self.assertEqual(value, json.loads(assembler.decode_lzw(binary).decode("utf-8")))


class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.pages = [{"id": "0:%s" % i, "name": "Components" if i == 1 else "Separator %s" % i} for i in range(1, 28)]
        (self.root / "raw").mkdir()
        (self.root / "raw/manifest.json").write_text(json.dumps({"fileKey": "fixture", "pages": self.pages}))
        for page in self.pages:
            components = [{"id": "1:1", "key": "a" * 40, "name": "button/primary", "kind": "component_set",
                           "pageId": page["id"], "pageName": page["name"], "path": [],
                           "properties": {"Text#70:8": {"type": "TEXT", "defaultValue": "Continue"}},
                           "layout": {"width": 100, "height": 40}, "layers": [], "visible": False,
                           "layerInspection": "representative-definition", "customField": {"keep": True}}] if page["id"] == "0:1" else []
            variants = [{"id": "1:2", "key": "b" * 40, "name": "size=sm", "ownerId": "1:1",
                         "pageId": page["id"], "pageName": page["name"], "variantProperties": {"size": "sm"}}] if components else []
            snapshot = {"fileKey": "fixture", "page": page, "roots": [{"id": "9:1", "name": "Example", "type": "FRAME"}],
                        "containers": [], "counts": {"sets": len(components), "standalone": 0, "variants": len(variants),
                                                    "total": len(components) + len(variants)}, "components": components, "variants": variants}
            write_chunks(self.root, page["id"].replace(":", "-"), snapshot)
        self.foundation = {"fileKey": "fixture", "collections": [{"id": "collection", "key": "c" * 40, "name": "Themes",
                            "modes": [{"modeId": "dark", "name": "Dark"}], "defaultModeId": "dark", "variableIds": ["v1", "v2"]}],
                           "variables": [{"id": "v1", "key": "d" * 40, "name": "text/high", "collectionId": "collection",
                                          "resolvedType": "COLOR", "scopes": ["ALL_FILLS"],
                                          "valuesByMode": {"dark": {"type": "VARIABLE_ALIAS", "id": "v2"}}},
                                         {"id": "v2", "key": "e" * 40, "name": "palette/white", "collectionId": "collection",
                                          "resolvedType": "COLOR", "valuesByMode": {"dark": {"r": 1, "g": 1, "b": 1}}}],
                           "styles": {"text": [{"id": "S:1", "key": "f" * 40, "name": "regular/base", "fontSize": 14}],
                                      "paint": [], "effect": [], "grid": []}}
        write_chunks(self.root, "foundations", self.foundation)

    def test_all_27_pages_and_zero_definition_separators_are_preserved(self):
        catalog = assembler.assemble(self.root, "2026-10-26")
        self.assertTrue(catalog["diagnostics"]["valid"])
        self.assertEqual(27, catalog["manifest"]["counts"]["pages"])
        self.assertEqual(2, catalog["manifest"]["counts"]["definitions"])
        self.assertEqual(0, catalog["pages"][-1]["counts"]["total"])
        self.assertEqual({"keep": True}, catalog["components"][0]["customField"])
        self.assertIn("Text#70:8", catalog["components"][0]["properties"])
        self.assertEqual("not-tested", catalog["components"][0]["verification"]["import"]["status"])
        self.assertFalse(catalog["components"][0]["verification"]["inventory"]["visibleAtExport"])

    def test_generated_catalog_integrates_with_lookup_and_full_page_docs(self):
        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout):
            status = assembler.run(["--root", str(self.root)])
        self.assertEqual(0, status)
        self.assertLess(len(stdout.getvalue()), 1500)
        catalog = lookup.Catalog(self.root / "catalog")
        self.assertEqual(1, len(catalog.search("button", kind="component")))
        self.assertEqual(27, len(list((self.root / "pages").glob("*.md"))))
        self.assertIn("a" * 40, (self.root / "FAMILIES.md").read_text())
        self.assertIn("VARIABLE_ALIAS", (self.root / "FOUNDATIONS.md").read_text())
        self.assertIn("not extra", (self.root / "SCHEMA.md").read_text())

    def test_check_only_writes_nothing(self):
        with contextlib.redirect_stdout(io.StringIO()):
            status = assembler.run(["--root", str(self.root), "--check-only"])
        self.assertEqual(0, status)
        self.assertFalse((self.root / "catalog").exists())
        self.assertFalse((self.root / "pages").exists())

    def test_invalid_owner_and_short_keys_are_errors(self):
        catalog = assembler.assemble(self.root, "2026-10-26")
        snapshot, _ = assembler.decode_chunks(self.root / "raw/chunks/0-1", self.root)
        snapshot["variants"][0]["ownerId"] = "does-not-exist"
        snapshot["components"][0]["key"] = "abcd…1234"
        for path in (self.root / "raw/chunks/0-1").glob("*.json"):
            path.unlink()
        write_chunks(self.root, "0-1", snapshot)
        catalog = assembler.assemble(self.root, "2026-10-26")
        self.assertFalse(catalog["diagnostics"]["valid"])
        codes = {issue["code"] for issue in catalog["diagnostics"]["errors"]}
        self.assertTrue({"invalid-key", "variant-owner"}.issubset(codes))

    def test_external_alias_is_a_visible_warning_without_fabricated_value(self):
        self.foundation["variables"][0]["valuesByMode"]["dark"]["id"] = "external-variable"
        for path in (self.root / "raw/chunks/foundations").glob("*.json"):
            path.unlink()
        write_chunks(self.root, "foundations", self.foundation)
        catalog = assembler.assemble(self.root, "2026-10-26")
        self.assertTrue(catalog["diagnostics"]["valid"])
        self.assertIn("external-variable-alias", [item["code"] for item in catalog["diagnostics"]["warnings"]])

    def test_cached_ids_resolve_by_exact_key_without_claiming_verified_imports(self):
        snapshot, _ = assembler.decode_chunks(self.root / "raw/chunks/0-1", self.root)
        snapshot["components"][0]["usedBindings"] = [{"bindings": {"fills": {"type": "VARIABLE_ALIAS", "id": "VariableID:" + "e" * 40 + "/999:1"}}}]
        snapshot["components"][0]["usedStyles"] = [{"styles": {"fillStyleId": "S:" + "f" * 40 + ",999:1"}}]
        snapshot["components"][0]["dependencies"] = [{"id": "999:2", "key": "b" * 40, "name": "old variant", "remote": True}]
        for path in (self.root / "raw/chunks/0-1").glob("*.json"):
            path.unlink()
        write_chunks(self.root, "0-1", snapshot)
        catalog = assembler.assemble(self.root, "2026-10-26")
        dependencies = catalog["dependencies"]
        self.assertEqual("local-key-identity", dependencies["variableReferences"][0]["resolution"])
        self.assertEqual("v2", dependencies["variableReferences"][0]["canonicalId"])
        self.assertFalse(dependencies["variableReferences"][0]["importVerified"])
        self.assertEqual("local-key-identity", dependencies["styleReferences"][0]["resolution"])
        self.assertEqual("1:2", dependencies["edges"][0]["canonicalTargetId"])
        self.assertFalse(dependencies["edges"][0]["importVerified"])
        self.assertEqual([], catalog["diagnostics"]["warnings"])


if __name__ == "__main__":
    unittest.main()
