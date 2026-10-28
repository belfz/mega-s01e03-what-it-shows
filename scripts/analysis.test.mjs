import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { causeOf, dayFirst, sameCause } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';
import { groups, notes, raw, reports, tenants } from './analysis.mjs';

test('snapshot contains 412 distinct reports, with 15 repeated rows', () => {
  assert.equal(raw.length, 427);
  assert.equal(reports.length, 412);
  assert.equal(new Set(reports.map(report => report.id)).size, 412);
  assert.equal(groups.reduce((total, group) => total + group.reports.length, 0), reports.length);
});

test('tenant and channel identify the two causes, not intake tags', () => {
  assert.deepEqual(groups.map(group => [group.cause, group.reports.length]), [['parser', 379], ['hint', 33]]);
  assert.equal(groups.find(group => group.cause === 'parser').taggedAs.hint, 23);
  assert.equal(groups.find(group => group.cause === 'hint').taggedAs.parser, 15);
  assert.ok([...tenants.values()].every(tenant => dayFirst(tenant.locale)));
  assert.equal(causeOf({ channel: 'form' }, tenants.get('alder.physio')), 'hint');
  assert.equal(causeOf({ channel: 'app' }, tenants.get('alder.physio')), 'parser');
  assert.equal(causeOf({ channel: 'form' }, tenants.get('kettle.books')), 'parser');
  assert.equal(causeOf({ channel: 'email' }, undefined), null);
});

test('subjects do not define duplicates and unresolved symptoms remain visible', () => {
  assert.equal(sameCause({ channel: 'form' }, tenants.get('alder.physio'), { channel: 'app' }, tenants.get('alder.physio')), false);
  assert.equal(sameCause({ channel: 'app' }, tenants.get('kettle.books'), { channel: 'email' }, tenants.get('kettle.books')), true);
  assert.equal(notes.oneDayMove.length, 5);
  for (const id of notes.oneDayMove) {
    const report = reports.find(candidate => candidate.id === id);
    assert.ok(report);
    assert.equal(causeOf(report, tenants.get(report.tenant)), 'parser');
  }
});

test('desk ref is derived deterministically from a signature', () => {
  assert.match(deskRef('test signature'), /^DR-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  assert.equal(deskRef(' test signature '), deskRef('test signature'));
});

test('engineering outcomes retain distinct GitHub closure reasons', () => {
  const update = JSON.parse(fs.readFileSync(new URL('../src/lib/data/engineering-update.json', import.meta.url), 'utf8'));
  assert.equal(update.closedOn, '2026-10-05');
  assert.equal(update.outcomes.parser.status, 'fixed');
  assert.equal(update.outcomes.parser.closureReason, 'completed');
  assert.equal(update.outcomes.hint.status, "won't fix");
  assert.equal(update.outcomes.hint.closureReason, 'not planned');
  assert.equal(update.outcomes.hint.detail, 'booking-v3 form retired');
});
