# Design system

The whole site, public pages and admin, uses this one system. Tokens live in `src/app/globals.css`; components live in `src/components/ui` and `src/components/shared`. If something you need is missing, add it here rather than styling a one-off.

## Principles

- Warm paper, coral and cocoa ink, and photographs lit like late afternoon. Pages open on a full-bleed photograph and settle into paper bands.
- Every band fills the height of the screen. If a section does not fit one screen, simplify it before shrinking it.
- Calm first: generous whitespace, large light display type, one or two actions per section.
- One typeface (Inter Tight). Headings are light (300) and tightly spaced; hierarchy comes from size, not from a second font.
- Gradients and blur belong only on photographs, through `scrim` and `glass`, on the `ember` texture for small shapes, and on the `glow` behind the closing band. No shadows.
- Only true claims. No invented figures, client faces or testimonials, however good they look in a layout. Testimonials show initials rather than faces, and marked samples appear in development only.
- Coral is the main colour: actions and small marks. One ink colour, cocoa brown. Status colours appear only for status.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `coral-500` | `#f8b9a2` | Main colour: `primary`, buttons, rings and marks. Always with dark text, and never as text on a light band |
| `sand-50` | `#fdf8f3` | Page background |
| `sand-100` | `#f9f0e7` | Quiet bands and tinted blocks, admin background |
| `sand-200` | `#f3e4d6` | Statement and gallery bands |
| `sage-300` | `#f8b9a2` | Peach bands, such as the inner page heroes |
| `forest-700` | `#33211a` | Text, dark bands |
| `forest-900` | `#1a100b` | Behind photographs, text on coral |
| `warning-*`, `danger-*` | | Status only |

The `sage` and `forest` scale names are kept from the first version, though they now hold peach and cocoa values.

Use semantic classes in components (`text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`). The raw scales are for choosing a band or a tint.

`tone-forest` turns any element into a dark band by re-pointing the semantic tokens, so buttons, links and hairlines inside it invert on their own. Don't add "inverted" props. Add it, with `text-foreground`, to anything that sits on a photograph.

## Type

| Class | Use |
| --- | --- |
| `type-display-xl` | Home page `h1` |
| `type-display-lg` | Page and section headings |
| `type-display-md` | Sub-headings, admin page titles |
| `type-display-sm` | Row titles, card titles, statements |
| `eyebrow` | Section labels: a small uppercase pill. Add `glass` on a photograph |
| `label-caps` | Small uppercase labels for data |

The type scale is deliberately not named `text-*`: the `cn` class merger reads an unknown `text-*` as a colour and drops the size when a real colour is next to it.

## Layout

- `Section` is a full-bleed band, one screen tall by default. `tone`: `white`, `sage`, `sand`, `paper`, `forest`. `space`: `none`, `md`, `lg`. Use `fill={false}` only where content must not be centred or pushed down, such as the booking form and legal text.
- `grid-split` is the page grid: a narrow label column and a wide content column (1:3 from `lg`, 1:2.2 from `xl`). `SectionHeading`, `PageHero` and the site header all align to it.
- `grid-side` puts a heading beside its content (5:7 from `lg`), which is how long sections stay within one screen.
- `RowList` is the ruled title and description list. Prefer it to a row of cards. Pass `stacked` in a narrow column. Wrap it in `LabelledRows` to add a label in the narrow column.
- `PageHero` opens every inner page. Pass `compact` when the page must start working straight away.
- `surface` is a white block with a hairline, `surface-tint` a sand block. Use them for forms and admin panels.
- `glass` is a frosted panel for use on photographs, and `scrim` the dark overlay that keeps text readable on them. Check any text on a photograph at both desktop and phone width.
- `Contours` draws the logo's shapes as outlines behind sage bands, centred on the page.
- `CtaBand` closes most pages. It carries the crisis notice, so keep that notice with it: check the numbers against SNS 24 before changing them.
- The home hero is a photographic band: the header sits on it inverted, the title and actions at the foot on the left, a `glass` card on the right, and the clinic's contacts in a ruled strip below.
- The home services band puts a photograph between two columns of cards, with a centred heading above. It shows the first four services by the admin's sort order and links to the full list from the photograph. From `lg` the card under the pointer or focus lifts and shows its "Saber mais" label; on smaller screens every card shows it.

## Actions

**`Button`** (and `buttonVariants` for links styled as buttons).

| Variant | Use |
| --- | --- |
| `default` | The main action in a form or panel |
| `outline` | Secondary action |
| `secondary` | Low-emphasis filled action |
| `ghost` | Toolbars and tertiary actions |
| `destructive` | Irreversible actions |
| `link` | A button that should read as text |

Sizes: `xs`, `sm`, `default`, `lg`, `xl`, plus `icon` variants.

**`TextLink`** (and `textLinkVariants` for `<a>` and buttons).

| Variant | Use |
| --- | --- |
| `cta` | The signature link: uppercase, with a rising arrow. Use it for a single action on a plain band, not on `Contours`, where the lines run through the text. |
| `inline` | Links in running text |
| `quiet` | Navigation and link lists; pass `arrow` for the rising arrow |

`BookLink` and `WhatsAppLink` take `cta` for the signature link, `quiet` for a plain text link in lists and cards, or `Button` props otherwise. Use them for every booking and WhatsApp action, because they carry the prefilled data. Where the two sit side by side on a coloured band, use `BookLink size="xl"` with `WhatsAppLink variant="secondary" size="xl"`. On a photograph, leave `WhatsAppLink` as `outline`; on the closing band it is `ghost`.

## Motion

Motion is slow and quiet: long durations, soft easing, small distances. GSAP handles it, with Lenis for smooth scrolling on the public site. Both are set up in `src/lib/gsap.ts` and `SmoothScroll`.

- `Reveal` fades content in when it scrolls into view. Pass `immediate` for the top of a page, `variant="image"` for images, `variant="bleed"` for edge-to-edge images, `stagger` for lists (`RowList` uses it to draw its rules).
- `SplitTitle` raises a heading line by line. `SectionHeading` and `PageHero` already use it.
- `ScrubText` lights up a statement word by word with the scroll.
- `Parallax` drifts content slightly as its section passes.
- `Contours` draw themselves and drift on their own.
- `Journey` holds on screen while the scroll moves through its three stages, and `Steps` does the same from `lg`. They stay in place with CSS `sticky` inside a tall track, not a GSAP pin, and the track only gets its height under `MOTION_OK`.
- Scroll should pick a state, and the change between states should then play through in time. Tie only continuous things to the scroll, such as a progress ring or a parallax drift: anything scrubbed can be left half-finished when the visitor stops.

Everything runs inside `MOTION_OK`, so visitors who ask for reduced motion get a still page with native scrolling. New entrances need a hidden starting state in the media query in `globals.css`, using opacity rather than visibility. The booking wizard keeps Motion for its step transitions.

## Feedback and forms

- `Badge`: `neutral`, `sage`, `warning`, `danger`, `outline`.
- `Notice`: `info`, `success`, `error`.
- `Input`, `Textarea`, `Label`, `Accordion`, `Sheet` come from `src/components/ui`.

Focus is always a solid 2px ring in the current ink.
