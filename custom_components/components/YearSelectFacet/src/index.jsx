import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Static-range year picker. The chosen year is stored as the facet's `customFilter` value;
// the server-side `yearBind` custom filter (configs/sampo/filters.js) turns it into
// `BIND(<year> AS ?year)` inside the inner sub-SELECT of the yearEndPrices result query.
const YearSelectFacet = (props) => {
  const { facet, facetID, facetClass, updateFacetOption } = props
  const minYear = Number.isInteger(facet?.minYear) ? facet.minYear : 1830
  const maxYear = Number.isInteger(facet?.maxYear) ? facet.maxYear : 2000

  // Current selection (null/undefined when nothing chosen yet).
  const current = facet?.customFilter
  const value = current == null ? '' : String(current)

  const years = []
  for (let y = maxYear; y >= minYear; y--) years.push(y)

  const handleChange = event => {
    const raw = event.target.value
    updateFacetOption({
      facetClass,
      facetID,
      option: 'customFilter',
      value: raw === '' ? null : parseInt(raw, 10)
    })
  }

  return (
    <Box sx={{ p: 2 }}>
      <FormControl fullWidth size='small'>
        <InputLabel id={`${facetID}-year-label`}>Year</InputLabel>
        <Select
          labelId={`${facetID}-year-label`}
          id={`${facetID}-year-select`}
          value={value}
          label='Year'
          onChange={handleChange}
          MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
        >
          <MenuItem value=''><em>None</em></MenuItem>
          {years.map(y => (
            <MenuItem key={y} value={String(y)}>{y}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default YearSelectFacet

YearSelectFacet.propTypes = {
  facetID: PropTypes.string.isRequired,
  facetClass: PropTypes.string.isRequired,
  facet: PropTypes.object.isRequired,
  facetUpdateID: PropTypes.number,
  updateFacetOption: PropTypes.func.isRequired
}
