"""Isolated contract tests: python3 -m unittest discover -s scripts -p 'test_*.py'."""

import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path

import lookup


class LookupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "catalog"
        self.root.mkdir()
        self.write("manifest.json", {"fileKey": "library-key", "schemaVersion": 1,
                                     "pages": [{"id": "0:1", "name": "Buttons"},
                                               {"id": "0:2", "name": "Icons"},
                                               {"id": "0:3", "name": "Empty page"}]})
        self.write("components.json", [
            {"id": "1:1", "key": "full-button-key-1", "name": "button/primary", "kind": "component_set",
             "pageId": "0:1", "pageName": "Buttons", "path": [{"id": "1:0", "name": "Actions", "type": "SECTION"}],
             "properties": {"Text#70:8": {"type": "TEXT", "defaultValue": "Continue"},
                            "size": {"type": "VARIANT", "defaultValue": "sm", "variantOptions": ["sm", "lg"]},
                            "state": {"type": "VARIANT", "defaultValue": "rest", "variantOptions": ["rest", "disabled"]}},
             "layers": [{"id": "1:99", "name": "Label", "characters": "Continue"}]},
            {"id": "2:1", "key": "full-button-key-2", "name": "button/primary", "kind": "standalone",
             "pageId": "0:2", "pageName": "Icons", "path": [{"id": "2:0", "name": "Legacy", "type": "SECTION"}]},
            {"id": "2:2", "key": "full-icon-key", "name": "classic/éclair ☀", "kind": "standalone",
             "pageId": "0:2", "pageName": "Icons"},
            {"id": "1:2", "key": "full-account-key", "name": "accountTile", "kind": "component_set",
             "pageId": "0:1", "pageName": "Buttons"},
        ])
        self.write("variants.json", [
            {"id": "3:1", "key": "variant-small-rest-key", "name": "size=sm, state=rest", "ownerId": "1:1",
             "pageId": "0:1", "pageName": "Buttons", "variantProperties": {"size": "sm", "state": "rest"}},
            {"id": "3:2", "key": "variant-large-disabled-key", "name": "size=lg, state=disabled", "ownerId": "1:1",
             "pageId": "0:1", "pageName": "Buttons", "variantProperties": {"size": "lg", "state": "disabled"}},
        ])
        self.write("variables.json", {"collections": [{"id": "vc:1", "name": "Themes", "modes": [{"modeId": "m:1", "name": "Dark"}]}],
                                      "variables": [
                                          {"id": "VariableID:1", "key": "alias-key", "name": "text/high", "collectionId": "vc:1",
                                           "resolvedType": "COLOR", "valuesByMode": {"m:1": {"type": "VARIABLE_ALIAS", "id": "VariableID:2"}}},
                                          {"id": "VariableID:2", "key": "target-key", "name": "palette/pearl", "collectionId": "vc:1",
                                           "resolvedType": "COLOR", "valuesByMode": {"m:1": {"r": 1, "g": 1, "b": 1}}},
                                      ]})
        self.write("styles.json", {"text": [{"id": "S:1", "key": "style-key", "name": "headlines/large"}],
                                   "effect": [], "paint": [], "grid": []})
        self.write("routes.json", [{"pattern": "Receiving account", "keywords": ["recipient", "wallet destination"],
                                    "componentIds": ["1:2"], "chooseWhen": "An account is already connected.",
                                    "avoidFor": "Wallet provider selection", "codeRefs": []}])
        self.catalog = lookup.Catalog(self.root)

    def write(self, name, value):
        (self.root / name).write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")

    def cli(self, *arguments):
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            status = lookup.run(["--catalog-root", str(self.root), *arguments])
        return status, stdout.getvalue(), stderr.getvalue()

    def test_duplicate_name_show_keeps_both_and_id_disambiguates(self):
        self.assertEqual(2, len(self.catalog.show("button/primary")))
        self.assertEqual("1:1", self.catalog.show("1:1")[0]["record"]["id"])
        with self.assertRaisesRegex(lookup.CatalogError, "Ambiguous family"):
            self.catalog.family_variants("button/primary")

    def test_json_show_preserves_exact_property_api_and_nested_layers(self):
        status, output, error = self.cli("show", "1:1", "--json")
        self.assertEqual((0, ""), (status, error))
        result = json.loads(output)["results"][0]
        self.assertEqual("Continue", result["properties"]["Text#70:8"]["defaultValue"])
        self.assertEqual("Continue", result["layers"][0]["characters"])
        self.assertEqual("full-button-key-1", result["key"])
        self.assertEqual("importComponentSetByKeyAsync", result["importMethod"])
        self.assertIn("node-id=1-1", result["url"])

    def test_filter_kind_and_page(self):
        matches = self.catalog.search("button", kind="component", page="Icons")
        self.assertEqual(["2:1"], [item["record"]["id"] for item in matches])
        matches = self.catalog.search("button", kind="component", page="0:1")
        self.assertEqual(["1:1"], [item["record"]["id"] for item in matches])

    def test_route_recommends_family_without_matching_its_name(self):
        matches = self.catalog.search("recipient", kind="component")
        self.assertEqual("1:2", matches[0]["record"]["id"])
        self.assertEqual("Receiving account", matches[0]["recommendations"][0]["pattern"])
        status, output, _ = self.cli("search", "recipient")
        self.assertEqual(0, status)
        self.assertIn("Wallet provider selection", output)

    def test_variants_are_actual_tuples_not_cartesian_product(self):
        _, variants = self.catalog.family_variants("1:1")
        self.assertEqual(2, len(variants))
        _, absent = self.catalog.family_variants("1:1", "size=sm state=disabled")
        self.assertEqual([], absent)
        _, present = self.catalog.family_variants("1:1", "size = lg state = disabled")
        self.assertEqual(["3:2"], [item["record"]["id"] for item in present])

    def add_multiword_family(self):
        family_id = "444:33621"
        self.catalog._add_records("component", [{"id": family_id, "name": "Stepper Container", "kind": "component_set"}])
        self.catalog._add_records("variant", [
            {"id": "444:33622", "ownerId": family_id, "name": "Property 1=active, Display state=Ready to claim",
             "variantProperties": {"Property 1": "active", "Display state": "Ready to claim", "size": "sm", "state": "rest"}},
            {"id": "444:33624", "ownerId": family_id, "name": "Property 1=finished, Display state=In progress",
             "variantProperties": {"Property 1": "finished", "Display state": "In progress", "size": "lg", "state": "disabled"}},
        ])
        return family_id

    def test_multiword_property_name_matches_real_stepper_contract(self):
        family = self.add_multiword_family()
        for query in ("Property 1=active", "Property   1 = active", '"Property 1"=active'):
            _, variants = self.catalog.family_variants(family, query)
            self.assertEqual(["444:33622"], [item["record"]["id"] for item in variants], query)

    def test_multiword_names_and_values_combine_with_single_word_assignments(self):
        family = self.add_multiword_family()
        for query in ("Property 1=active size=sm state=rest", "Display state=Ready to claim size=sm state=rest",
                      'size=lg Display state="In progress" Property 1=finished',
                      "size=lg; Display state=In progress, Property 1=finished"):
            _, variants = self.catalog.family_variants(family, query)
            expected = "444:33624" if "size=lg" in query else "444:33622"
            self.assertEqual([expected], [item["record"]["id"] for item in variants], query)
        _, variants = self.catalog.family_variants(family, "Display state=Ready to claim size=lg")
        self.assertEqual([], variants)

    def test_quoted_values_can_contain_other_property_assignment_text(self):
        family = self.add_multiword_family()
        entries = [item for item in self.catalog.records if item["record"].get("id") == "444:33622"]
        entries[0]["record"]["variantProperties"]["Display state"] = "Review state=rest before sending"
        _, variants = self.catalog.family_variants(family, 'Display state="Review state=rest before sending" size=sm')
        self.assertEqual(["444:33622"], [item["record"]["id"] for item in variants])

    def test_unterminated_quoted_variant_value_is_reported(self):
        family = self.add_multiword_family()
        with self.assertRaisesRegex(lookup.CatalogError, "unterminated"):
            self.catalog.family_variants(family, 'Display state="Ready to claim size=sm')

    def test_unicode_and_icon_terms(self):
        for query in ("éclair", "eclair", "☀", "classic"):
            matches = self.catalog.search(query, kind="component")
            self.assertIn("2:2", [item["record"]["id"] for item in matches])

    def test_alias_search_follows_target_names_and_keeps_alias_values(self):
        matches = self.catalog.search("pearl", kind="variable")
        ids = [item["record"]["id"] for item in matches]
        self.assertEqual(["VariableID:2", "VariableID:1"], ids)
        alias = self.catalog.result(matches[1])
        self.assertEqual({"type": "VARIABLE_ALIAS", "id": "VariableID:2"}, alias["valuesByMode"]["m:1"])
        self.assertEqual("https://www.figma.com/design/library-key/", alias["url"])

    def test_alias_cycles_do_not_recurse_forever(self):
        self.catalog.variables[1]["valuesByMode"] = {"m:1": {"type": "VARIABLE_ALIAS", "id": "VariableID:1"}}
        self.assertEqual(2, len(self.catalog.search("pearl", kind="variable")))

    def test_cached_alias_search_uses_exact_stable_key(self):
        target = self.catalog.variables[1]
        target["key"] = "f" * 40
        self.catalog.variables_by_key[target["key"]] = target
        self.catalog.variables[0]["valuesByMode"] = {"m:1": {"type": "VARIABLE_ALIAS", "id": "VariableID:" + target["key"] + "/999:1"}}
        self.assertEqual(2, len(self.catalog.search("pearl", kind="variable")))

    def test_truncation_is_explicit_and_deterministic(self):
        status, output, _ = self.cli("search", "button", "--limit", "1", "--json")
        self.assertEqual(0, status)
        result = json.loads(output)
        self.assertEqual(2, result["total"])
        self.assertEqual(1, result["returned"])
        self.assertTrue(result["truncated"])
        self.assertEqual("1:1", result["results"][0]["id"])
        self.assertEqual(self.cli("search", "button", "--limit", "1", "--json")[1], output)

    def test_paths_are_searchable(self):
        self.assertEqual("1:1", self.catalog.search("Actions", kind="component")[0]["record"]["id"])

    def test_page_ancestors_do_not_pollute_search_or_repeat_display_path(self):
        self.catalog.components[3]["path"] = [{"id": "0:1", "name": "Buttons", "type": "PAGE"}]
        self.assertEqual([], lookup.path_names(self.catalog.components[3]))
        matches = self.catalog.search("button", kind="component", page="0:1")
        self.assertEqual(["1:1"], [item["record"]["id"] for item in matches])

    def test_exact_names_are_case_insensitive_and_camel_case_searches_work(self):
        self.assertEqual("1:2", self.catalog.show("ACCOUNTTILE")[0]["record"]["id"])
        self.assertEqual("1:2", self.catalog.search("account tile", kind="component")[0]["record"]["id"])

    def test_long_property_options_are_concise_but_json_is_complete(self):
        self.catalog.components[0]["properties"]["Asset#1:0"] = {
            "type": "VARIANT", "defaultValue": "asset0", "variantOptions": ["asset%s" % i for i in range(20)]}
        self.assertIn("+12 more", lookup.property_summary(self.catalog.components[0]["properties"]))
        record = self.catalog.result(self.catalog.show("1:1")[0], detail=True)
        self.assertEqual(20, len(record["properties"]["Asset#1:0"]["variantOptions"]))

    def test_pages_include_empty_declared_pages_and_counts(self):
        pages = {page["id"]: page for page in self.catalog.pages()}
        self.assertEqual(0, pages["0:3"]["components"])
        self.assertEqual(2, pages["0:1"]["variants"])

    def test_project_and_skill_catalog_discovery(self):
        base = Path(self.temp.name)
        self.assertEqual(self.root.resolve(), lookup.find_catalog(script_path=base / "scripts/lookup.py", cwd=base))
        skill = base / "skill"
        target = skill / "references/catalog"
        target.mkdir(parents=True)
        (target / "manifest.json").write_text("{}")
        self.assertEqual(target.resolve(), lookup.find_catalog(script_path=skill / "scripts/lookup.py", cwd=base / "elsewhere"))
        self.assertEqual(target.resolve(), lookup.find_catalog(explicit=skill))

    def test_option_placement_and_not_found_status(self):
        status, output, _ = self.cli("--json", "show", "2:2")
        self.assertEqual(0, status)
        self.assertEqual("importComponentByKeyAsync", json.loads(output)["results"][0]["importMethod"])
        self.assertEqual(1, self.cli("show", "not-an-existing-node")[0])

    def test_malformed_catalog_is_reported_without_traceback(self):
        (self.root / "components.json").write_text("not-json")
        status, _, error = self.cli("summary")
        self.assertEqual(2, status)
        self.assertIn("Cannot read", error)


if __name__ == "__main__":
    unittest.main()
