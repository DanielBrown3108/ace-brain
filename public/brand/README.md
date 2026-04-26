# Brand image assets

Drop the three brand images into this folder with these exact filenames so
the site picks them up:

- `logo.png` — the ACE Brain circular logo (the one with A, E, C around the
  brain). Used in the site header and the book CTA.
- `peter.jpg` — Dr. Peter Quarshie's headshot. Used in the "Meet your
  instructor" section on the home page.
- `book-cover.jpg` — the *Illustrated Mind Mapping for Anatomy & Physiology*
  cover. Used on the home page hero and the /book page.

PNG/JPG/WebP are all fine — Next.js's `<Image>` will serve the right
format. Any size works; aim for ≥800px on the longest edge for sharpness
on retina displays. The site doesn't render anything special if a file
is missing — the browser just shows a broken image icon.
