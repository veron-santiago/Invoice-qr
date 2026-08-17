import { TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

const SearchInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value.toLowerCase().trim())
  }

  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder="Buscar..."
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'var(--color-text-secondary)' }} />
          </InputAdornment>
        )
      }}
      sx={{ 
        minWidth: 300,
        '& .MuiOutlinedInput-root': {
          bgcolor: 'var(--background-panel)',
          borderRadius: 2,
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)'
            }
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)'
            }
          }
        }
      }}
    />
  )
}

export default SearchInput
