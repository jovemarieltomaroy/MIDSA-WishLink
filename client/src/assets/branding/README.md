# MIDSAkatuparan branding

Source: the supplied `midsakatuparan.pdf`.

Updated source: `Copy of midsakatuparan.pdf`.

Current header logo: `campaign-logo-transparent.png`, imported from the supplied `Copy of midsakatuparan.png`. Only transparent outer padding was trimmed; the original artwork, white outlines, and alpha channel are retained. Used in the landing/public headers and officer sidebar. It replaces the earlier PDF-derived wordmark in those locations.

- `campaign-wordmark.png`: the standalone first logo from page 4, used for headers and the officer sidebar. The public footer uses the original oval logo.
- The six `tag-*.png` assets are the individual designs on pages 6–8. The preprinted recipient text and greetings were replaced with adjacent blank paper/red areas so live wish details never overlap them. Outside white margins were made transparent while preserving enclosed decorative white loops.
- `utils/tagDesigns.js` selects one of these six designs or the blank striped tag using a stable hash of the normalized ornament code. Public pages, reservation summaries, officer QR previews, and downloads all use the same selection. Designs may repeat across wishes; keep the design list order stable.

- `campaign-background.jpg`: the complete drawing background from page 9, without embedded logos or text.
- `campaign-tag.png`: the left blank tag from page 13, exported at higher resolution. The cropped outer corners and punch hole are transparent; the original fabric, green border, and paper are retained. It replaces the earlier PDF crop in public wish tags, the landing page, reservation summaries, and officer QR tags.
- QR downloads embed the artwork and QR into a self-contained SVG before exporting a 1412-pixel-wide PNG with a height proportional to its selected design, matching the officer preview with a four-module white QR margin.

- `midsakatuparan-logo.png`: the oval logo from page 1, cropped with a transparent exterior. The supplied lettering and tree artwork are retained.
- `notebook-paper.jpg`: paper texture from the open center of page 4.
- `tree-drawing.jpg`, `children-drawing.jpg`, `bird-drawing.jpg`: the original crayon artwork and bird/emblem from page 4, used as decorative page borders.
- `striped-tag.png`: the blank striped tag from page 5. Live wish details are rendered as accessible HTML over the tag.

The original `assets/logo.png` is retained. App screens use this campaign logo instead.

The landing page at `/` deliberately uses labeled placeholders for the introduction, participation details, beneficiary stories, schedule, and photos. Replace these in `pages/LandingPage.jsx` when approved content is ready. Placeholder content is not connected to campaign records.
