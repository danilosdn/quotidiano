#!/usr/bin/env python3
"""Validate the curated runtime subset without requiring Node packages."""
from pathlib import Path
from PIL import Image
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
manifest_path = root / 'src/game/house/HouseAssetManifest.ts'
manifest = manifest_path.read_text(encoding='utf-8')
registry = (root / 'src/game/house/HouseObjectRegistry.ts').read_text(encoding='utf-8')
layout = (root / 'src/game/house/HouseLayout.ts').read_text(encoding='utf-8')
renderer = (root / 'src/game/house/HouseRenderer.ts').read_text(encoding='utf-8')
frame_map = (root / 'src/game/entities/playerFrameMap.ts').read_text(encoding='utf-8')

entries = re.findall(r"key:'([^']+)', path:'([^']+)'", manifest)
sprite_entries = {
    key: (path, int(width), int(height))
    for key, path, width, height in re.findall(
        r"key:'([^']+)', path:'([^']+)', frameWidth:(\d+), frameHeight:(\d+)",
        manifest,
    )
}
issues: list[str] = []
warnings: list[str] = []
seen: set[str] = set()
dimensions: dict[str, tuple[int, int]] = {}
frame_counts: dict[str, int] = {}

for key, path in entries:
    if key in seen:
        issues.append(f'duplicate key: {key}')
    seen.add(key)
    file = root / 'public' / path.lstrip('/')
    if not file.exists():
        issues.append(f'missing file for {key}: {file.relative_to(root)}')
        continue
    try:
        with Image.open(file) as image:
            dimensions[key] = (image.width, image.height)
            if image.width <= 0 or image.height <= 0:
                issues.append(f'invalid dimensions for {key}')
            if image.mode not in {'RGBA', 'RGB', 'P'}:
                issues.append(f'unexpected mode for {key}: {image.mode}')
            if key in sprite_entries:
                _, frame_width, frame_height = sprite_entries[key]
                if image.width % frame_width or image.height % frame_height:
                    issues.append(
                        f'spritesheet {key} ({image.width}x{image.height}) is not divisible by '
                        f'{frame_width}x{frame_height}'
                    )
                else:
                    frame_counts[key] = (image.width // frame_width) * (image.height // frame_height)
    except Exception as exc:  # Pillow reports corrupt/truncated images here.
        issues.append(f'cannot open {key}: {exc}')

used_keys: set[str] = set(re.findall(r"texture: '([^']+)'", registry))
used_keys.update(re.findall(r"(?:floorTexture|wallTexture): '([^']+)'", layout))
item_block = re.search(r"const ITEM_TEXTURES:[\s\S]*?= \{([\s\S]*?)\};", renderer)
if item_block:
    used_keys.update(re.findall(r": '([^']+)'", item_block.group(1)))
for call in re.findall(r"this\.texture\(([^\n]+)\);", renderer):
    strings = re.findall(r"'([^']+)'", call)
    used_keys.update(strings[1:])
used_keys.add('player')
missing_manifest = sorted(used_keys - seen)
if missing_manifest:
    issues.extend(f'used texture missing from manifest: {key}' for key in missing_manifest)

# Highest runtime frame that must exist for each spritesheet.
required_frames = {'fridge': 1, 'oven': 1, 'coffee': 5, 'toaster': 10, 'front-door': 1}
player_frames = [int(value) for value in re.findall(r"\b\d+\b", frame_map)]
if player_frames:
    required_frames['player'] = max(player_frames)
for key, highest in required_frames.items():
    count = frame_counts.get(key)
    if count is None:
        issues.append(f'no valid frame count available for spritesheet {key}')
    elif highest >= count:
        issues.append(f'{key} requests frame {highest}, but only {count} frames exist')

unused = sorted(seen - used_keys)
# Keep alternate/state textures in the manifest even when selected dynamically.
if unused:
    warnings.append(f'{len(unused)} manifest assets are not statically referenced: {", ".join(unused)}')

report = {
    'valid': not issues,
    'assetCount': len(entries),
    'uniqueKeys': len(seen),
    'usedTextureKeys': len(used_keys),
    'spriteFrameCounts': frame_counts,
    'issues': issues,
    'warnings': warnings,
}
print(json.dumps(report, indent=2, ensure_ascii=False))
sys.exit(0 if not issues else 1)
