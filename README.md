# Sparky animation preview

Review all **50 animations and 10 poses** with the latest Sparky character. The root page opens the studio shown in the review; use Animation library to browse all clips.

## Run

```sh
python3 -m http.server 8082
```

Open http://localhost:8082/. This is a static app: no install, API key or CDN required.

## Review and download

Choose an action, play/pause, scrub the timeline, use slow motion, change the background, or save a transparent frame PNG. **Download animation ZIP** exports the selected action with the shared Spine `.skel` skeleton, `.atlas` files, PNG texture sheets, painted character assets, clip metadata, standalone preview, player and runtime license. Gallery selection can export multiple actions.

The exported skeleton contains the source animation set shared by Sparky; the selected manifest lists your chosen actions. This is the rig-based package used by the preview, rather than a newly baked frame sprite sheet or editable `.spine` project. Keep the entire directory structure.

## Hosting

Publish the `main` branch, repository root with GitHub Pages. All paths are relative and support the `/animat/` repository subpath. `.nojekyll` is included.

Repository: https://github.com/Roky777/animat

## Checks

```sh
node scripts/check-animation-export.mjs
node scripts/check-hand-fit.mjs
```

See [integration notes](animation-library/sparky/README.md). Bundled Spine license: `animation-library/sparky/runtime/vendor/SPINE-LICENSE.txt`.
