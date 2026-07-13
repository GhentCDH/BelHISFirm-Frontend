import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { stateToUrl } from '@sampo-ui/helpers'
import { getStaticFileUrl } from '@sampo-ui/configsStore'

// CSV export for the securities perspective.
//
// The securitiesExportQuery returns ALL name / corporation-name candidates (with their validity dates)
// rather than year-matching them in SPARQL — that keeps the query cheap on the Ontop/Oracle VKG. The
// year-valid value is picked here in the browser, mirroring the server-side corporationNameForYear
// mapper (mappers.js). Because sampo-ui's CSV endpoint returns the raw SPARQL CSV with no JS mapping
// (SparqlApi.js), we instead fetch resultFormat=json (which DOES run makeObjectList, grouping each
// stock's candidates into arrays) and build the CSV ourselves.
//
// The button is gated behind a selected year: with no year the query binds no ?id and returns nothing.

// Copy of pickForYear from sampo/configs/sampo/mappers.js (that server file can't be imported into this
// browser bundle). Pick the single dated candidate valid at `yearEnd` (YYYY-12-31): the one whose
// [startDate, endDate] interval covers it; else the most recent one already started by then; else the
// first candidate.
const pickForYear = (value, yearEnd) => {
  const candidates = Array.isArray(value) ? value : [value]
  const started = c => c == null || c.startDate == null || String(c.startDate) <= yearEnd
  const notEnded = c => c == null || c.endDate == null || String(c.endDate) >= yearEnd
  const covering = candidates.find(c => started(c) && notEnded(c))
  if (covering) return covering
  const before = candidates
    .filter(started)
    .sort((a, b) => String(a?.startDate || '').localeCompare(String(b?.startDate || '')))
  return before[before.length - 1] || candidates[0]
}

// Flatten a mapped value (scalar, { prefLabel/id }, or an array of those) to a display string.
const label = v => {
  if (v == null) return ''
  if (Array.isArray(v)) return v.map(label).filter(Boolean).join('; ')
  if (typeof v === 'object') return v.prefLabel ?? v.id ?? ''
  return String(v)
}

const CSV_COLUMNS = [
  'scobID', 'name', 'openValue', 'stockExchange',
  'stocktype', 'sectorName', 'sharetype', 'corporationName'
]

// RFC 4180 field quoting.
const csvField = value => `"${String(value ?? '').replaceAll('"', '""')}"`

// The API base is baked into the client build as process.env.API_URL, which is not available in this
// separately-built custom-component bundle. Derive it from configsStore instead: getStaticFileUrl
// returns `${apiUrl}/configs/<portalID>/assets/<file>`, so everything before "/configs/" is the base.
const getApiBase = () => getStaticFileUrl('').split('/configs/')[0]

// Build the POST request for the export. We POST (not GET) because the sampo server's GET /all endpoint
// is CSV-only: its OpenAPI 200 response documents text/plain only, so with response validation on the
// JSON body would be rejected ("no schema defined for status code '200'"). The POST /all endpoint always
// returns JSON ({ data, sparqlQuery }) and its 200 declares application/json. Constraints go in the JSON
// body as a real array from stateToUrl — no query-string encoding/escaping needed.
const buildRequest = ({ apiBase, resultClass, facetClass, facets }) => {
  const params = stateToUrl({ facetClass, facets })
  return {
    url: `${apiBase}/faceted-search/${resultClass}/all`,
    body: { facetClass, constraints: params.constraints || null }
  }
}

const rowToCsvValues = (row, yearEnd) => {
  const name = pickForYear(row.name, yearEnd)
  const corporationName = pickForYear(row.corporationName, yearEnd)
  return {
    scobID: label(row.scobID),
    name: name ? label(name) : '',
    openValue: label(row.openValue),
    stockExchange: label(row.stockExchange),
    stocktype: label(row.stocktype),
    sectorName: label(row.sectorName),
    sharetype: label(row.sharetype),
    corporationName: corporationName ? label(corporationName) : ''
  }
}

const buildCsv = (rows, year) => {
  const yearEnd = `${year}-12-31`
  const sorted = [...rows].sort((a, b) => Number(label(a.scobID)) - Number(label(b.scobID)))
  const lines = [CSV_COLUMNS.join(',')]
  for (const row of sorted) {
    const values = rowToCsvValues(row, yearEnd)
    lines.push(CSV_COLUMNS.map(col => csvField(values[col])).join(','))
  }
  return lines.join('\n')
}

const triggerDownload = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const centered = { p: 4, display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }

class GatedExportCSV extends React.Component {
  state = { loading: false, error: null }

  handleExport = async () => {
    const { resultClass, facetClass, facetState } = this.props
    const year = facetState?.facets?.year?.customFilter
    this.setState({ loading: true, error: null })
    try {
      const { url, body } = buildRequest({
        apiBase: getApiBase(),
        resultClass,
        facetClass,
        facets: facetState.facets
      })
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!response.ok) throw new Error(`Export request failed (${response.status})`)
      const json = await response.json()
      const csv = buildCsv(json.data || [], year)
      triggerDownload(csv, `securities-${year}.csv`)
      this.setState({ loading: false })
    } catch (error) {
      this.setState({ loading: false, error: error.message })
    }
  }

  render () {
    const year = this.props.facetState?.facets?.year?.customFilter
    if (year == null || year === '') {
      return (
        <Box sx={centered}>
          <Typography variant='h6' color='textSecondary'>
            Select a year to export.
          </Typography>
        </Box>
      )
    }
    const { loading, error } = this.state
    return (
      <Box sx={{ ...centered, flexDirection: 'column', gap: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={this.handleExport}
          disabled={loading}
        >
          {loading ? 'Preparing…' : 'Export CSV'}
        </Button>
        {error && (
          <Typography variant='body2' color='error'>
            {error}
          </Typography>
        )}
      </Box>
    )
  }
}

export default GatedExportCSV

GatedExportCSV.propTypes = {
  facetState: PropTypes.object,
  resultClass: PropTypes.string,
  facetClass: PropTypes.string
}
