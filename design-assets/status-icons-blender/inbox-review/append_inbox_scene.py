"""Append the reviewed inbox to a preserved live status-icons file.

Never rebuilds prior icons. Writes a staged file; the caller publishes it after
the reopened preservation check passes. All paths are explicit to avoid using
the historical procedural builder on user-edited art.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

import bpy


def plain(value):
    if isinstance(value, bpy.types.ID):
        return {"id": value.name, "type": value.bl_rna.identifier}
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        return value if math.isfinite(value) else str(value)
    try:
        return [plain(item) for item in value]
    except TypeError:
        return str(value)


def settings(value):
    result = {}
    for prop in value.bl_rna.properties:
        name = prop.identifier
        if name in {"rna_type", "users", "session_uid", "tag", "is_updated", "is_updated_data", "is_updated_geometry", "matrix_world", "matrix_local", "bound_box", "dimensions"}:
            continue
        if prop.type == "COLLECTION":
            continue
        try:
            item = getattr(value, name)
            if name in {"filepath", "filepath_raw"} and isinstance(item, str) and item.startswith("//"):
                item = str(Path(bpy.path.abspath(item)).resolve())
            if prop.type == "POINTER" and not isinstance(item, bpy.types.ID):
                continue
            result[name] = plain(item)
        except (AttributeError, TypeError, RuntimeError):
            continue
    return result


def nodes(tree):
    if tree is None:
        return None
    return {
        "name": tree.name,
        "nodes": [{"settings": settings(node), "inputs": [
            {"name": socket.name, "default": plain(socket.default_value)}
            for socket in node.inputs if hasattr(socket, "default_value")
        ]} for node in tree.nodes],
        "links": sorted((link.from_node.name, link.from_socket.identifier,
                         link.to_node.name, link.to_socket.identifier)
                        for link in tree.links),
    }


def object_state(obj):
    result = {
        "settings": settings(obj),
        "modifiers": [settings(mod) for mod in obj.modifiers],
        "constraints": [settings(con) for con in obj.constraints],
        "vertex_groups": [settings(group) for group in obj.vertex_groups],
        "custom": {key: plain(obj[key]) for key in obj.keys()},
    }
    data = obj.data
    if isinstance(data, bpy.types.Mesh):
        result["mesh"] = {
            "vertices": [list(v.co) for v in data.vertices],
            "weights": [[(g.group, g.weight) for g in v.groups] for v in data.vertices],
            "edges": [list(edge.vertices) for edge in data.edges],
            "faces": [(list(face.vertices), face.material_index, face.use_smooth)
                      for face in data.polygons],
            "materials": [mat.name if mat else None for mat in data.materials],
        }
    elif data is not None:
        result["data"] = settings(data)
        if isinstance(data, bpy.types.Light):
            result["nodes"] = nodes(data.node_tree)
    return result


def preservation_state(scene_names, object_names, material_names):
    result = {"scenes": {}, "objects": {}, "materials": {}}
    for name in scene_names:
        scene = bpy.data.scenes[name]
        result["scenes"][name] = {
            "settings": settings(scene), "render": settings(scene.render),
            "image": settings(scene.render.image_settings),
            "cycles": settings(scene.cycles), "view": settings(scene.view_settings),
            "world": settings(scene.world), "worldNodes": nodes(scene.world.node_tree),
            "compositor": nodes(scene.compositing_node_group),
            "objects": sorted(ob.name for ob in scene.objects),
            "collections": sorted(col.name for col in scene.collection.children),
        }
    for name in object_names:
        result["objects"][name] = object_state(bpy.data.objects[name])
    for name in material_names:
        mat = bpy.data.materials[name]
        result["materials"][name] = {"settings": settings(mat), "nodes": nodes(mat.node_tree)}
    return result


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def differences(a, b, path=""):
    if type(a) is not type(b):
        return [(path, a, b)]
    if isinstance(a, dict):
        return [diff for key in a.keys() | b.keys()
                for diff in differences(a.get(key), b.get(key), path + "/" + str(key))]
    if isinstance(a, (list, tuple)):
        if len(a) != len(b):
            return [(path + "/length", len(a), len(b))]
        return [diff for index, (left, right) in enumerate(zip(a, b))
                for diff in differences(left, right, path + "/" + str(index))]
    return [] if a == b else [(path, a, b)]


parser = argparse.ArgumentParser()
parser.add_argument("--candidate", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--record", required=True)
parser.add_argument("--expected-output-sha256")
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
output = Path(args.output).resolve()
if args.expected_output_sha256:
    assert hashlib.sha256(output.read_bytes()).hexdigest() == args.expected_output_sha256, "Canonical source changed; stop and preserve the latest edits."
base_path = Path(bpy.data.filepath).resolve()
base_sha = hashlib.sha256(base_path.read_bytes()).hexdigest()
scene_names = sorted(scene.name for scene in bpy.data.scenes)
object_names = sorted(obj.name for obj in bpy.data.objects)
material_names = sorted(mat.name for mat in bpy.data.materials)
assert scene_names == ["01 - Hourglass", "02 - Review Document"], scene_names
before = preservation_state(scene_names, object_names, material_names)
studio = bpy.data.collections["STUDIO - Shared Softboxes"]
native_scene = bpy.data.scenes["02 - Review Document"]
native_world = native_scene.world
palette = {name: bpy.data.materials[name] for name in material_names}
before_ids = {name: set(getattr(bpy.data, name)) for name in
              ("collections", "objects", "lights", "materials", "worlds", "node_groups")}

with bpy.data.libraries.load(str(Path(args.candidate).resolve()), link=False) as (available, requested):
    assert "03 - Review Inbox" in available.scenes
    requested.scenes = ["03 - Review Inbox"]
    requested.texts = ["START HERE - Review Inbox"]
inbox = requested.scenes[0]
assert inbox.name == "03 - Review Inbox"

# Reuse only the original studio and palette references in the NEW scene.
for collection in list(inbox.collection.children):
    if collection.name.startswith("STUDIO - Shared Softboxes"):
        inbox.collection.children.unlink(collection)
inbox.collection.children.link(studio)
inbox.world = native_world
for obj in inbox.objects:
    if obj.type != "MESH":
        continue
    for slot in obj.material_slots:
        if slot.material:
            original_name = slot.material.name.rsplit(".", 1)[0] if slot.material.name[-4:-3] == "." else slot.material.name
            if original_name in palette:
                slot.material = palette[original_name]

# Each scene has its own compositor, with the current live source grade.
inbox.compositing_node_group = native_scene.compositing_node_group.copy()
inbox.compositing_node_group.name = "OUTPUT - Inbox Review Shared Palette Grade"
for node in inbox.compositing_node_group.nodes:
    if node.type == "R_LAYERS":
        node.scene = inbox
        node.layer = "Inbox Review"

# Remove only newly appended duplicates that are no longer used by the scene.
for collection in list(bpy.data.collections):
    if collection not in before_ids["collections"] and collection.users == 0:
        bpy.data.collections.remove(collection)
for obj in list(bpy.data.objects):
    if obj not in before_ids["objects"] and not obj.users_collection:
        bpy.data.objects.remove(obj)
for category in ("lights", "materials", "worlds", "node_groups"):
    blocks = getattr(bpy.data, category)
    for block in list(blocks):
        if block not in before_ids[category] and block.users == 0:
            blocks.remove(block)

after = preservation_state(scene_names, object_names, material_names)
assert before == after, "Existing icon data changed while appending. Do not publish."
inbox["Canonical scene"] = True
inbox["Preserved live source SHA256"] = base_sha
if bpy.context.window:
    bpy.context.window.scene = inbox
inbox.render.filepath = "//inbox-review/review-inbox-1024.png"
bpy.context.preferences.filepaths.save_version = 0
if args.expected_output_sha256:
    assert hashlib.sha256(output.read_bytes()).hexdigest() == args.expected_output_sha256, "Canonical changed during append; do not overwrite."
bpy.ops.wm.save_as_mainfile(filepath=str(output))

# Verify preservation again from the saved artifact, not only the in-memory build.
bpy.ops.wm.open_mainfile(filepath=str(output))
reopened = preservation_state(scene_names, object_names, material_names)
if before != reopened:
    print("PRESERVATION_DIFFERENCES", json.dumps(differences(before, reopened)[:30]), flush=True)
assert before == reopened, "Saved prior scenes changed. Do not publish."
assert hashlib.sha256(base_path.read_bytes()).hexdigest() == base_sha
report = {"base": str(base_path), "baseSha256": base_sha,
          "candidate": str(Path(args.candidate).resolve()), "stagedOutput": str(output),
          "preservedScenes": scene_names, "preservedObjects": len(object_names),
          "preservedMaterials": len(material_names),
          "beforeDigest": digest(before), "reopenedDigest": digest(reopened),
          "priorScenesUnchanged": True,
          "scenes": sorted(s.name for s in bpy.data.scenes),
          "sharedStudio": "STUDIO - Shared Softboxes"}
Path(args.record).write_text(json.dumps(report, indent=2) + "\n")
print("INBOX_APPEND_VERIFIED", json.dumps(report), flush=True)
