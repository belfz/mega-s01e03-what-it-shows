import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, preprocess } from 'svelte/compiler';
import { mdsvex } from 'mdsvex';
import { createServer } from 'vite';
import { groups, notes, raw, reports } from './analysis.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const markdown = mdsvex({ extensions: ['.svx'], layout: { runbook: path.join(root, 'src/lib/layouts/runbook.svelte') } });
const server = await createServer({
  root,
  configFile: false,
  resolve: { alias: { '#lib': path.join(root, 'src/lib') } },
  server: { middlewareMode: true },
  plugins: [{
    name: 'kb-server-components',
    async transform(source, filename) {
      if (!/\.(svelte|svx)$/.test(filename)) return;
      const processed = filename.endsWith('.svx') ? await preprocess(source, markdown, { filename }) : { code: source };
      return compile(processed.code, { filename, generate: 'server', css: 'injected' }).js.code;
    },
  }],
});

try {
  const { render } = await server.ssrLoadModule('svelte/server');
  const routeRoot = path.join(root, 'src/routes');
  const filenames = await fs.readdir(path.join(routeRoot, 'kb'), { recursive: true });
  const rendered = [];
  for (const filename of filenames.filter(filename => filename.endsWith('+page.svx'))) {
    const source = `/src/routes/kb/${filename}`;
    const module = await server.ssrLoadModule(source);
    const output = render(module.default);
    const route = `/kb/${path.dirname(filename) === '.' ? '' : `${path.dirname(filename)}/`}`;
    const target = path.join(root, 'rendered', route, 'index.html');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${output.head}</head><body>${output.body}</body></html>`;
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, html);
    rendered.push(route);
    console.log(`Rendered ${route}`);
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    sourceRows: raw.length,
    uniqueReports: reports.length,
    repeatedRows: raw.length - reports.length,
    groups: groups.map(({ reports, ...group }) => ({ ...group, count: reports.length, reportIds: reports.map(report => report.id) })),
    unresolvedReportIds: notes.oneDayMove,
    renderedRoutes: rendered,
  };
  await fs.mkdir(path.join(root, 'evidence'), { recursive: true });
  await fs.writeFile(path.join(root, 'evidence/analysis.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await fs.mkdir(path.join(root, 'issues'), { recursive: true });
  for (const group of groups) {
    const parser = group.cause === 'parser';
    const detail = parser
      ? 'The shared parser assumes MM/DD for dates supplied by day-first tenants. For example, 07/04 intended as 7 April becomes 4 July. The tenant-aware form hint is a separate fault and needs a separate correction.'
      : 'booking-v3 prints MM/DD/YYYY under the input for day-first tenants, but the form reads their input in tenant date order. For example, a person following the hint types 01/06 for 6 January and the form reads 1 June. A shared-parser fix alone does not fix this hint.';
    const body = `# ${parser ? 'Shared parser reads day-first tenant dates month first' : 'booking-v3 date hint contradicts tenant date order'}\n\nReports: ${group.reports.length} unique reports from #4471.\n\n## Evidence and scope\n\n${detail}\n\nSeen ${group.firstSeen} through ${group.lastSeen}; ${group.tenants} tenants. These counts apply to the 2026-10-04 export, not the current live desk.\n\n## Method\n\nDeduplicate reports by ID, select mergedInto === 4471, look up tenant locale and booking form, and call causeOf/groupByCause from src/lib/kb/causes.ts. Do not classify by subject, browserLocale, or intakeTag. Export rows overlap: 427 rows contain 412 unique reports.\n\nIntake labels within this cause: ${JSON.stringify(group.taggedAs)}.\n\n## Representative reports\n\n${group.reports.slice(0, 2).map(report => `- ${report.id}, ${report.tenant}, ${report.channel}: ${report.body}`).join('\n')}\n\n## Expected correction and verification\n\n${parser ? 'Respect tenant date order or use an unambiguous date representation. Test app, email and booking-v2 form paths with day/month values that can be swapped. Test non-ambiguous days and supported locale orders. Keep the booking-v3 hint correction separate.' : 'Make the date hint match the tenant-aware form parser. Test booking-v3 form submissions for alder.physio (de-DE), copper.studio (es-ES), and pale.harbour (pt-PT). Verify both ambiguous and non-ambiguous dates, and check that app/email paths are not classified as this hint fault.'}\n\n${parser ? '## Unresolved symptoms\n\nFive reports remain included in this computed parser count: R-41202, R-41209, R-41236, R-41344, R-41620. They describe one-day, timezone, or ordering anomalies. Tenant/channel classification is not proof that a month-first parser caused these symptoms. Investigate original input, stored date, timezone and timestamps; do not claim a verified third cause or silently discard/double-count them.\n\n' : ''}## Cross references\n\n- Source incident: #4471 in the exported support desk, not an issue in this repository.\n- [Review source](../blob/main/src/routes/kb/incidents/4471-review/+page.svx)\n- [Rendered review](../blob/main/rendered/kb/incidents/4471-review/index.html)\n- [Computed counts and membership](../blob/main/evidence/analysis.json)\n\n## Report IDs (${group.reports.length})\n\n${group.reports.map(report => report.id).join(', ')}\n`;
    await fs.writeFile(path.join(root, `issues/${group.cause}.md`), body);
  }
} finally {
  await server.close();
}
