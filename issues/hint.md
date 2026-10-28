# booking-v3 date hint contradicts tenant date order

Reports: 33 unique reports from #4471.

## Evidence and scope

booking-v3 prints MM/DD/YYYY under the input for day-first tenants, but the form reads their input in tenant date order. For example, a person following the hint types 01/06 for 6 January and the form reads 1 June. A shared-parser fix alone does not fix this hint.

Seen 2026-04-17 through 2026-09-22; 3 tenants. These counts apply to the 2026-10-04 export, not the current live desk.

## Method

Deduplicate reports by ID, select mergedInto === 4471, look up tenant locale and booking form, and call causeOf/groupByCause from src/lib/kb/causes.ts. Do not classify by subject, browserLocale, or intakeTag. Export rows overlap: 427 rows contain 412 unique reports.

Intake labels within this cause: {"parser":15,"hint":18}.

## Representative reports

- R-41230, copper.studio, form: My client came on 1 June instead of 6 January. We sorted it out.
- R-41241, alder.physio, form: We had two people show up on 8 June. They were booked for 6 August.

## Expected correction and verification

Make the date hint match the tenant-aware form parser. Test booking-v3 form submissions for alder.physio (de-DE), copper.studio (es-ES), and pale.harbour (pt-PT). Verify both ambiguous and non-ambiguous dates, and check that app/email paths are not classified as this hint fault.

## Cross references

- Source incident: #4471 in the exported support desk, not an issue in this repository.
- [Review source](../blob/main/src/routes/kb/incidents/4471-review/+page.svx)
- [Rendered review](../blob/main/rendered/kb/incidents/4471-review/index.html)
- [Computed counts and membership](../blob/main/evidence/analysis.json)

## Report IDs (33)

R-41230, R-41241, R-41251, R-41259, R-41262, R-41275, R-41294, R-41305, R-41308, R-41366, R-41372, R-41384, R-41387, R-41396, R-41400, R-41406, R-41415, R-41416, R-41418, R-41428, R-41439, R-41441, R-41449, R-41453, R-41456, R-41460, R-41472, R-41485, R-41493, R-41539, R-41572, R-41582, R-41584
