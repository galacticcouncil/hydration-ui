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
