import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ResultTable } from '@sampo-ui/components'

// Result table that only renders (and therefore only fetches count + paginated results) once a
// year has been chosen in the YearSelectFacet. This keeps the unbounded, timeout-prone form of
// the yearEndPrices query from ever running: no year => no BIND(?year) => no query.
const GatedResultTable = (props) => {
  const year = props.facetState?.facets?.year?.customFilter

  if (year == null || year === '') {
    return (
      <Box sx={{ p: 4, display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant='h6' color='textSecondary'>
          Select a year to see year-end prices.
        </Typography>
      </Box>
    )
  }

  // Mounting ResultTable triggers the (now year-bounded) result + count fetches.
  return <ResultTable {...props} />
}

export default GatedResultTable

GatedResultTable.propTypes = {
  facetState: PropTypes.object
}
