# Visual Identity

Source: Caleb Lamproe's original brief ("App Detail (Caleb Lamproe)"), page 1, "Visual Aid" section. Confirmed with Patrick on 2026-08-31.

## What the brief said

> I'd like for the homepage to be red and white for the company colors. You can sprinkle in a hint of navy blue if you would like. And these colors (our signature sauces) can be used for the design of different features if possible.

The brief included the seven Chick-fil-A signature sauce packet designs as the source image for that second sentence. Nothing else in the brief specifies typography, spacing, or iconography — those stayed at the MVP-appropriate system-font defaults called out in the original build scope.

## How the colors were derived

The sauce packet graphic in the brief was rendered from the source PDF at 300 DPI and sampled pixel-by-pixel (not eyeballed) to get exact ink colors, avoiding compression artifacts from a lower-resolution read. Two swatches — **BBQ** (`Rich & Bold`) and **The Original CFA Sauce** (white card, red outline/wordmark) — sampled to the same red family, which is why the brief's "red and white" instruction and the sauce imagery agree: that shared red is the core brand red.

| Sauce | Packet tagline | Sampled hex | UI hex (contrast-adjusted) |
|---|---|---|---|
| BBQ / Original CFA | "Rich & Bold" / "The Original" | `#CB0B26` / `#C50E27` | `#C10827` — **core brand red** |
| Buffalo | "Bold, Zesty" | `#EA520C` | `#D6480F` |
| Ranch | "Garden Herb" | `#36AFC7` | `#2E9FB8` |
| Sriracha | "Sweet and Spicy" | `#1A9A6D` | `#1A9A6D` |
| Honey Mustard | "Sweet as Honey, it's Savory too!" | `#FFB451` | `#E8A23C` |
| Polynesian | "Sweet & Sour" | `#9C4776` | `#8B3E6B` |

The "UI hex" column darkens a few of the lighter sampled colors (Buffalo, Honey Mustard, Polynesian) so white text stays legible on top of them at the sizes used in category cards and badges — the packet art doesn't need to carry text, the app does.

Navy wasn't sourced from an image — the brief left it as an optional accent ("if you would like"), so `#1B2A4A` was chosen as a complementary dark neutral for the nav bar and headings, giving the red something to sit against besides white.

## Final tokens (`src/app/globals.css`)

| Token | Hex | Role |
|---|---|---|
| `--color-brand-red` | `#C10827` | Nav accents, primary buttons, links |
| `--color-brand-red-dark` | `#970620` | Hover state for red buttons |
| `--color-brand-navy` | `#1B2A4A` | Nav bar background, headings |
| `--color-brand-navy-dark` | `#121D33` | Hover state for navy elements |
| `--color-brand-cream` | `#FBF6EF` | Page background |
| `--color-category-financial` | `#2E9FB8` | Financial category (Ranch) |
| `--color-category-self-help` | `#E8A23C` | Self Help category (Honey Mustard) |
| `--color-category-relational` | `#8B3E6B` | Relational category (Polynesian) |
| `--color-category-leadership-development` | `#D6480F` | Leadership Development category (Buffalo) |

## Category → sauce mapping

The four fixed MVP categories only need four accent colors, but the brief supplied five non-red sauces (Buffalo, Ranch, Sriracha, Honey Mustard, Polynesian). The mapping below was a deliberate pick, not an arbitrary one:

- **Financial → Ranch (blue)** — blue reads as calm and trustworthy, which fits budgeting/financial content better than a "louder" sauce would.
- **Self Help → Honey Mustard (gold)** — warm and optimistic, fitting personal growth and self-improvement.
- **Relational → Polynesian (magenta/berry)** — the warmest, most social-feeling color in the set, for communication/relationship content.
- **Leadership Development → Buffalo (orange)** — bold and energetic without duplicating the core brand red used everywhere else in the chrome.

**Sriracha green is intentionally unused** by a category — it's held in reserve for later feature work (e.g. a "new" badge, a save-confirmation state, an admin accent) rather than forced onto a category it doesn't suit. If a future phase adds a fifth category or a feature that wants a distinct accent color, reach for Sriracha first before introducing a new hue.

## What's still system-default

Per the original MVP scope, typography stays on the system font stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` — see `body` in `globals.css`) and there's no custom iconography. This document only covers color; revisit if the client supplies type/logo assets in a later phase.
