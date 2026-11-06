# assets-src: your original images

Drop original images here (any folder layout, png / jpg / webp / avif), then run:

```bash
npm run images
```

Optimised WebP copies appear in `public/images/` with the same relative path, ready to reference
from `src/content/`. For example `assets-src/projects/skillsmatch/cover.png` becomes
`/images/projects/skillsmatch/cover.webp`.

This folder's contents are not committed to git (only this note is); keep your originals backed up.
