# TRIPT 360 V6.2.3

## What changed

- Panorama filenames are taken from `data/scenes.js` instead of a hard-coded list.
- The editor now shows the actual panorama filenames from `assets/panoramas/`.
- Saved panorama paths are preserved exactly, including spaces and custom names.
- The viewer logo is read from `data/project.json`, so the fixed TRIPT logo remains independent of plan/panorama filenames.
- `generate_project.py` automatically finds the first image in `assets/plan/`, so the plan does not have to be named `plan.webp`.
- Plan fitting remains responsive and refits when the editor viewport changes size.

## Correct workflow

1. Put the floor plan in `assets/plan/`.
2. Put all 360 panoramas in `assets/panoramas/`.
3. Run:
   `python tools/convert_images.py`
4. Run:
   `python tools/generate_scenes.py`
5. For a new project, run:
   `python tools/generate_project.py`
   This detects the plan filename automatically.
6. Open `editor.html` with VS Code Live Server.
7. Add/edit views and click **Save Project**.
8. Replace `data/project.json` with the downloaded `project.json`.
9. Open `index.html` with Live Server.

### Important

Do not run `generate_project.py` after you have placed views unless you intentionally want to reset the project to zero views. The editor's **Save Project** file is the source of truth for view positions and panorama assignments.

`generate_scenes.py` can be run whenever panorama filenames are added, removed, or changed.
