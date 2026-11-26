# Credits and licences

Third-party design assets bundled with Life OS. All of them allow commercial use.

## Fluent Emoji 3D (images that replace emoji)

- **What:** 138 emoji images in `public/emoji/*.webp`, shown wherever the app used to print an emoji character (quest cards, Forge trackers, trophies, moods, popups, onboarding and so on).
- **Source:** Microsoft Fluent Emoji, **3D** style, https://github.com/microsoft/fluentui-emoji. Only the PNGs the app uses were downloaded (`assets/<Name>/3D/<name>_3d.png`, the default skin tone where there's a choice).
- **Licence:** MIT, © Microsoft Corporation. https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE
- **Changes:** each 256×256 PNG is resized to 192×192 and saved as WebP (quality 0.82). Total size is about 590 KB; each image loads only when it is shown.
- **Mapping:** `src/data/emojiImages.js` maps each emoji character to its image file. `src/components/shared/Emoji.jsx` renders the images. An emoji with no image falls back to the plain character.

### Adding an image (only when a new emoji is added to the code)

1. Add the emoji and its Fluent folder name in kebab-case to `src/data/emojiImages.js`, for example `"🔥": "fire"` for `assets/Fire/`.
2. Download `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Folder>/3D/<folder>_3d.png` into a scratch folder as `<name>.png`.
3. Run `node scripts/rasterize-emoji.cjs <path-to-puppeteer-core> <scratch-folder> public/emoji 192`.

## Nunito (font)

- **What:** the app's only typeface. Weights 500–900 are self-hosted, so no request goes to Google Fonts.
- **Source:** `@fontsource/nunito` 5.3.0, from https://github.com/googlefonts/nunito
- **Licence:** SIL Open Font License 1.1. https://openfontlicense.org

## Lucide (UI icons)

- **What:** small interface icons such as the tab bar, arrows and close buttons, via `lucide-react`.
- **Licence:** ISC. https://lucide.dev/license
