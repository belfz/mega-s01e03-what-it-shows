<script lang="ts">
  import update from '#lib/data/engineering-update.json';
</script>

<h2>Engineering update · {update.closedOn}</h2>
<p>The <a href={update.source}>course's engineering update</a>, observed on {update.observedOn}, reports that #{update.ticket} closed on {update.closedOn}. This update is newer than the 4 October export.</p>
<table>
  <thead><tr><th>Problem</th><th>Engineering outcome</th><th>Evidence</th><th>GitHub closure reason</th></tr></thead>
  <tbody>
    {#each Object.entries(update.outcomes) as [cause, outcome] (cause)}
      <tr><td>{cause}</td><td>{outcome.status}</td><td>{outcome.detail}</td><td>{outcome.closureReason}</td></tr>
    {/each}
  </tbody>
</table>
<p>These outcomes are different. Engineering fixed the parser; it did not fix the hint. The hint ticket closes as not planned because the affected form was retired. Neither closure proves that the five anomalous report bodies have been independently explained. The historical report counts below do not change when a ticket closes.</p>
