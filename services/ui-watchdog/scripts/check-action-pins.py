"""Resolve action pins via the commits API: tag-object SHAs are not executable."""
import json
import pathlib
import re
import subprocess

pins = set()
for workflow in pathlib.Path(".github/workflows").glob("*.y*ml"):
    for action, ref in re.findall(r"uses:\s*([\w.-]+/[\w./-]+)@([^\s#]+)", workflow.read_text()):
        if not re.fullmatch(r"[a-f0-9]{40}", ref):
            # Existing unrelated workflows may still use tags. Watchdog workflows cannot.
            if workflow.name.startswith("ui-watchdog"):
                raise SystemExit(f"Unpinned action: {action}@{ref}")
            continue
        pins.add(("/".join(action.split("/")[:2]), ref))
for repo, sha in sorted(pins):
    result = json.loads(subprocess.check_output(["gh", "api", f"repos/{repo}/commits/{sha}"]))
    if result["sha"] != sha:
        raise SystemExit(f"Action pin is not a commit: {repo}@{sha}")
    print(f"Verified commit: {repo}@{sha}")
