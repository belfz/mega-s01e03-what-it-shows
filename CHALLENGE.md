# S01E03 · what it shows

This repository preserves the supplied support knowledge-base export and adds
a signed review of incident #4471. It contains no production fix.

## Deliverables

- [Signed review source](src/routes/kb/incidents/4471-review/+page.svx)
- [Rendered review](rendered/kb/incidents/4471-review/index.html)
- [Full-page screenshot](evidence/4471-review.png)
- [Computed counts and complete report memberships](evidence/analysis.json)
- [Parser issue](https://github.com/belfz/mega-s01e03-what-it-shows/issues/1)
- [Hint issue](https://github.com/belfz/mega-s01e03-what-it-shows/issues/2)
- [Proposed decision 0002](src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx)

The accepted decision 0001 and the exported incident, triage pages, data and
components remain unchanged. The new decision is proposed, not accepted on
the desk's behalf. The review appears automatically in the computed KB index.

## Reproduce

Use Node.js 24 or newer. If a shell selects an older Node, select an already
installed Node 24 with your version manager before running these commands.

```sh
npm ci
npm test
npm run build
```

The build runs mdsvex, the actual Svelte components, and the shared runbook
layout. It writes static HTML snapshots for every KB route to `rendered/`.
It also rebuilds `evidence/analysis.json` and the draft issue bodies in `issues/`.
It does not create or update GitHub issues. The exported component logic,
not intake tags, supplies the counts.

Open the review HTML in a browser, or serve `rendered/` with a local static
HTTP server and visit `/kb/incidents/4471-review/`. The files include their CSS.
These are server-rendered snapshots, not a hydrated application: the default
dedupe controls and examples are visible, but changing a control does not
recompute its answer. Rebuild from a new export to refresh counts and dates.

The screenshot records the rendered page at review time. It is not a live view.
The signed page's visible desk ref is derived by the unchanged RenderStamp
component from its exact course-issued frontmatter signature.

## Limits

The export is dated 4 October 2026. The course later disclosed an engineering
update: #4471 closed on 5 October. The parser was fixed; the hint was not fixed
because booking-v3 was retired. Issue #1 closes as completed and issue #2 as
not planned. The signed review records both outcomes separately from the
historical counts. The exact reported outcomes are preserved in
`src/lib/data/engineering-update.json`; this is not a claim of independent
production verification.

Five anomalous report bodies are retained and explicitly unresolved; their
tenant/channel classification alone does not establish a reproduced cause.
The July merge spike is distinguished from the earlier report arrivals.
