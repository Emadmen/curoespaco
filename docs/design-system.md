# Design system

The whole site, public pages and admin, uses this one system. Tokens live in `src/app/globals.css`; components live in `src/components/ui` and `src/components/shared`. If something you need is missing, add it here rather than styling a one-off.

## Principles

- Flat colour bands, with no gradients, shadows or blur.
- Every band fills the height of the screen, with its content centred. If a section does not fit one screen, simplify it before shrinking it.
- Calm first: generous whitespace, tight display type, one or two actions per section.
- One typeface (Libre Franklin). Hierarchy comes from size, not from weight or a second font.
- Structure comes from hairline rules and whitespace, not from boxed cards.
- One ink colour, forest green. Status colours appear only for status.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `sage-300` | `#b2c1ba` | Hero and closing bands |
| `sand-200` | `#e2dacd` | Statement and gallery bands |
| `sand-100` | `#f4f0e9` | Quiet bands and tinted blocks, admin background |
| `forest-700` | `#00401c` | Text, primary buttons, dark bands |
| `warning-*`, `danger-*` | | Status only |

Use semantic classes in components (`text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`). The raw scales are for choosing a band or a tint.

`tone-forest` turns any element into a dark band by re-pointing the semantic tokens, so buttons, links and hairlines inside it invert on their own. Don't add "inverted" props.

## Type

| Class | Use |
| --- | --- |
| `type-display-xl` | Home page `h1` |
| `type-display-lg` | Page and section headings |
| `type-display-md` | Sub-headings, admin page titles |
| `type-display-sm` | Row titles, card titles, statements |
| `eyebrow` | Small section labels |
| `label-caps` | Small uppercase labels for data |

The type scale is deliberately not named `text-*`: the `cn` class merger reads an unknown `text-*` as a colour and drops the size when a real colour is next to it.

## Layout

- `Section` is a full-bleed band, one screen tall by default. `tone`: `white`, `sage`, `sand`, `paper`, `forest`. `space`: `none`, `md`, `lg`. Use `fill={false}` only where content must not be centred or pushed down, such as the booking form and legal text.
- `grid-split` is the page grid: a narrow label column and a wide content column (1:3 from `lg`, 1:2.2 from `xl`). `SectionHeading`, `PageHero` and the site header all align to it.
- `grid-side` puts a heading beside its content (5:7 from `lg`), which is how long sections stay within one screen.
- `RowList` is the ruled title and description list. Prefer it to a row of cards. Pass `stacked` in a narrow column. Wrap it in `LabelledRows` to add a label in the narrow column.
- `PageHero` opens every inner page. Pass `compact` when the page must start working straight away.
- `surface` is a white block with a hairline, `surface-tint` a sand block. Use them for forms and admin panels.
- `Contours` draws the logo's shapes as outlines behind sage bands, centred on the page.
- `grid-hero` is the home hero's layout: the logo on the left and the left-aligned text block on the right.

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
| `cta` | The signature link: uppercase, with a rising arrow. Use it for the main action on a coloured band. |
| `inline` | Links in running text |
| `quiet` | Navigation and link lists; pass `arrow` for the rising arrow |

`BookLink` and `WhatsAppLink` take `cta` for the signature link, `quiet` for a plain text link in lists and cards, or `Button` props otherwise. Use them for every booking and WhatsApp action, because they carry the prefilled data.

## Motion

Motion is slow and quiet: long durations, soft easing, small distances. GSAP handles it, with Lenis for smooth scrolling on the public site. Both are set up in `src/lib/gsap.ts` and `SmoothScroll`.

- `Reveal` fades content in when it scrolls into view. Pass `immediate` for the top of a page, `variant="image"` for images, `variant="bleed"` for edge-to-edge images, `stagger` for lists (`RowList` uses it to draw its rules).
- `SplitTitle` raises a heading line by line. `SectionHeading` and `PageHero` already use it.
- `ScrubText` lights up a statement word by word with the scroll.
- `Parallax` drifts content slightly as its section passes.
- `Contours` draw themselves and drift on their own.

Everything runs inside `MOTION_OK`, so visitors who ask for reduced motion get a still page with native scrolling. New entrances need a hidden starting state in the media query in `globals.css`, using opacity rather than visibility. The booking wizard keeps Motion for its step transitions.

## Feedback and forms

- `Badge`: `neutral`, `sage`, `warning`, `danger`, `outline`.
- `Notice`: `info`, `success`, `error`.
- `Input`, `Textarea`, `Label`, `Accordion`, `Sheet` come from `src/components/ui`.

Focus is always a solid 2px ring in the current ink.
