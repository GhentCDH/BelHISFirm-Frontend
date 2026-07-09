// Custom result mappers / postprocessors for BelHISFirm perspectives.
//
// Loaded by the server from {portalID}/mappers.js (server/src/sparql/Utils.js) and merged over
// the core mappers; referenced by name via "resultMapper" or "postprocess.func" in a result
// class config. Postprocess signature: ({ data, config }) => data — runs after the default
// makeObjectList mapping, so `data` is already the array of grouped result objects.

// Pick the single dated candidate valid at `yearEnd` (YYYY-12-31): the one whose
// [startDate, endDate] interval covers it; else the most recent one that had already started by
// then; else the first candidate. Accepts a single object or an array, returns one object.
const pickForYear = (value, yearEnd) => {
  const candidates = Array.isArray(value) ? value : [value]
  const started = c => c.startDate == null || String(c.startDate) <= yearEnd
  const notEnded = c => c.endDate == null || String(c.endDate) >= yearEnd
  const covering = candidates.find(c => started(c) && notEnded(c))
  if (covering) return covering
  const before = candidates
    .filter(started)
    .sort((a, b) => String(a.startDate || '').localeCompare(String(b.startDate || '')))
  return before[before.length - 1] || candidates[0]
}

// securities perspective: each result row is a stock that has a year-end price in the selected
// year (carried through as `year`) plus one or more candidate corporation names AND security
// names, each with its validity dates (.startDate / .endDate). Reduce both `corporationName`
// and the security's own `name` to the single value valid at that year-end (Dec 31 of `year`).
export const corporationNameForYear = ({ data }) => {
  if (!Array.isArray(data)) return data
  return data.map(row => {
    if (row == null) return row
    const year = parseInt(row.year, 10)
    if (!Number.isInteger(year)) return row
    const yearEnd = `${year}-12-31`
    const next = { ...row }
    if (row.corporationName != null) next.corporationName = pickForYear(row.corporationName, yearEnd)
    if (row.name != null) next.name = pickForYear(row.name, yearEnd)
    return next
  })
}
