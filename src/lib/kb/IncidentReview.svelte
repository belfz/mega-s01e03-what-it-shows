<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const merged = uniqueById(reports as Report[]).filter(report => report.mergedInto === 4471);
  const groups = groupByCause(merged, tenantOf);
  const unresolved = merged.filter(report => notes.oneDayMove.includes(report.id));
  const julyBacklog = merged.filter(report => report.mergedAt?.slice(0, 10) === '2026-07-02');
  const earlier = julyBacklog.filter(report => report.receivedAt.slice(0, 10) < '2026-07-02');
  const latest = merged.map(report => report.receivedAt.slice(0, 10)).sort().at(-1);
</script>

<p>The export has <strong>{reports.length}</strong> rows and <strong>{merged.length}</strong> unique reports for #4471. Remove repeated IDs before counting: <strong>{reports.length - merged.length}</strong> rows repeat an existing report. The latest received report in this export is dated <strong>{latest}</strong>.</p>

<table>
  <thead><tr><th>Problem</th><th>Reports</th><th>GitHub ticket</th><th>Required correction</th></tr></thead>
  <tbody>
    {#each groups as group (group.cause)}
      <tr>
        <td>{group.cause === 'parser' ? 'Shared parser assumes month first' : group.cause === 'hint' ? 'booking-v3 shows a month-first hint' : 'Unplaced: investigate'}</td>
        <td>{group.reports.length}</td>
        <td><a href={`https://github.com/belfz/mega-s01e03-what-it-shows/issues/${group.cause === 'parser' ? 1 : 2}`}>{group.cause}</a></td>
        <td>{group.cause === 'parser' ? 'Use the tenant date order, or an unambiguous date format.' : 'Make the displayed hint agree with the tenant-aware form parser.'}</td>
      </tr>
    {/each}
  </tbody>
</table>

<h2>Do not mistake the July merge for a July outbreak</h2>
<p>On 2 July, the desk merged <strong>{julyBacklog.length}</strong> reports; <strong>{earlier.length}</strong> had arrived before that day. The chart counts receivedAt and mergedAt separately. Reports started in April, not at the July merge spike. This is an accumulated queue being merged, not evidence of a new failure that day.</p>

<h2>Unresolved symptoms: keep them visible</h2>
<p>The desk notes flag <strong>{unresolved.length}</strong> reports as a one-day move. The supplied classifier files them under parser by tenant and channel. Their text does not establish the parser as their root cause. They remain included in that computed count, not counted again as a proven third bug. Verify timestamps, time zones, original input and reproduction before changing their classification.</p>
<ul>
  {#each unresolved as report (report.id)}
    <li><strong>{report.id}</strong> — {report.tenant}, {report.channel}: “{report.body}”</li>
  {/each}
</ul>

<h2>Counting method and limits</h2>
<p>Use uniqueById, filter mergedInto === 4471, resolve the tenant directory, then run groupByCause. The platform's Intl date order and the tenant's booking form determine causeOf. Browser locale, subject and intakeTag do not determine the cause. This rule is the exported desk model, not an independent reproduction of every report.</p>
<p>All counts on this page are computed at render time from the supplied export. Rebuild when the desk supplies new reports or changes tenant configuration. This export does not establish the current live queue or prove that either fix has shipped.</p>

<style>
  td { vertical-align: top; }
  li { margin-bottom: 0.65rem; }
</style>
