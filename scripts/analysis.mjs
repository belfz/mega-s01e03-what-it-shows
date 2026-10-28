import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { groupByCause, uniqueById } from '../src/lib/kb/causes.ts';

const dataDirectory = fileURLToPath(new URL('../src/lib/data/', import.meta.url));
export const raw = JSON.parse(fs.readFileSync(`${dataDirectory}/reports-4471.json`, 'utf8'));
export const tenants = new Map(fs.readdirSync(`${dataDirectory}/tenants`).map(filename => {
  const tenant = JSON.parse(fs.readFileSync(`${dataDirectory}/tenants/${filename}`, 'utf8'));
  return [tenant.handle, tenant];
}));
export const reports = uniqueById(raw).filter(report => report.mergedInto === 4471);
export const groups = groupByCause(reports, report => tenants.get(report.tenant));
export const notes = JSON.parse(fs.readFileSync(`${dataDirectory}/desk-notes.json`, 'utf8'));
