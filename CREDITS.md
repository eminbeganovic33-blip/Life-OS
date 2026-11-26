# Credits and licences

Third-party design assets bundled with Life OS. All of them allow commercial use.

## Fluent Emoji (images that replace emoji)

- **What:** 136 emoji images in `public/emoji/*.webp`, shown wherever the app used to print an emoji character (quest icons, Forge trackers, trophies, moods and so on).
- **Source:** Microsoft Fluent Emoji, "Color" style, https://github.com/microsoft/fluentui-emoji. Taken from the Iconify package `@iconify-json/fluent-emoji` 1.2.7.
- **Licence:** MIT, © Microsoft Corporation. https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE
- **Changes:** each SVG is rasterised to a 128×128 WebP (quality 0.86) so it stays small. Total size is about 380 KB, and the images are lazy-loaded.
- **Mapping:** `src/data/emojiImages.js` maps each emoji character to its image file. `src/components/shared/Emoji.jsx` renders the images. An emoji with no image falls back to the plain character.

### Regenerating the images (only when a new emoji is added to the code)

1. In a scratch folder outside the repo, run `npm install @iconify-json/fluent-emoji`.
2. Add the new emoji and its Fluent name (for example `"🔥": "fire"`) to `src/data/emojiImages.js`. Fluent names are the Unicode CLDR short names in kebab-case.
3. Build a JSON file shaped like `{ "fire": "<svg …>" }` from the package's `icons.json`, then run:
   `node scripts/rasterize-emoji.cjs <path-to-puppeteer-core> <svgs.json> public/emoji`

## Nunito (font)

- **What:** the app's only typeface. Weights 500–900 are self-hosted, so no request goes to Google Fonts.
- **Source:** `@fontsource/nunito` 5.3.0, from https://github.com/googlefonts/nunito
- **Licence:** SIL Open Font License 1.1. https://openfontlicense.org

## Lucide (UI icons)

- **What:** small interface icons such as the tab bar, arrows and close buttons, via `lucide-react`.
- **Licence:** ISC. https://lucide.dev/license
