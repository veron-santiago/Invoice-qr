import { TextField, Button, Box, Typography, Link, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useState } from 'react'

const SignupForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const API_URL = import.meta.env.VITE_API_URL;

        const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await fetch(`${API_URL}/auth/sign-up`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName: username || null, email: email || null, password: password || null })
            })
            const data = await response.json()
            if (response.ok && data.status) {
                setUsername('')
                setPassword('')
                setEmail('')
                setError('')
                let mensaje = data.message || 'Registro exitoso';
                setSuccess(mensaje)
                setTimeout(() => setSuccess(''), 3000)
                console.log('Registro exitoso', data)
            } else {
                let mensaje = data.message || data.companyName || data.email || data.password || 'Error en el registro'
                if (data.errors && Array.isArray(data.errors)) {
                    mensaje = data.errors.join(', ')
                }
                setError(mensaje)
                setTimeout(() => setError(''), 3000)
            }
        } catch (err) {
            setError('Ha ocurrido un error')
            setTimeout(() => setError(''), 3000)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h4" component="h1" align="center" sx={{ mb: 3, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Registro
            </Typography>
            <TextField
                label="Nombre de la compañia"
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
                label="Correo electrónico"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 2 }}>
                                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
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
                    Registrarse
                </Button>
            </Box>
            <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                <Link href="/login" sx={{ color: 'var(--color-primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    ¿Compañia ya registrada? Ingresar
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

export default SignupForm
