import { TextField, Button, Box, Checkbox, FormControlLabel, Alert, Typography, Link, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [stayLogged, setStayLogged] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    const verified = searchParams.get('verified')
    
    if (message && verified !== null) {
      const decodedMessage = decodeURIComponent(message)
      
      if (verified === 'true') {
        setSuccess(decodedMessage)
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(decodedMessage)
        setTimeout(() => setError(''), 5000)
      }
      
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('message')
      newSearchParams.delete('verified')
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

    const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/auth/log-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: username || null, password: password || null, stayLogged }),
      })
      const data = await response.json()

      if (response.ok && data.status) {
        setUsername('')
        setPassword('')
        setStayLogged(false)
        let mensaje = data.message || 'Sesión iniciada';
        setSuccess(mensaje)
        setTimeout(() => setSuccess(''), 3000)
        setError('')
        localStorage.setItem('token', data.jwt)
        navigate('/bills')
      } else {
        setError(data.message || data.companyName || data.password || 'Credenciales inválidas')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Ha ocurrido un error')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 3, fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Inicio de Sesión
      </Typography>
      <TextField
        label="Nombre de la compañía o Email"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
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
      <TextField
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                sx={{ color: 'var(--color-text-secondary)' }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
          mb: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={stayLogged}
              onChange={(e) => setStayLogged(e.target.checked)}
              name="stayLogged"
              sx={{ color: 'var(--color-primary)', '&.Mui-checked': { color: 'var(--color-primary)' } }}
            />
          }
          label="Recuérdame"
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={isSubmitting}
          sx={{
            bgcolor: 'var(--color-primary)',
            '&:hover': { bgcolor: 'var(--color-primary-hover)' },
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 2
          }}
        >
          Iniciar Sesión
        </Button>
      </Box>

      <Typography variant="body1" align="center" sx={{ mt: 3 }}>
        <Link href="/signup" sx={{ color: 'var(--color-primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          ¿Compañía no registrada? Registrarla
        </Link>
      </Typography>

      <Box height="48px" mt={2}>
        {error && (
          <Alert severity="error" variant="standard">
            {error}
          </Alert>
        )}
      </Box>
      <Box height="48px" mt={2}>
        {success && (
          <Alert severity="success" variant="standard">
            {success}
          </Alert>
        )}
      </Box>
    </Box>
  )
}

export default LoginForm
