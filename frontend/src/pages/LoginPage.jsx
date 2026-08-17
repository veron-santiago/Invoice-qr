import LoginForm from '../components/forms/LoginForm'
import { Box, Typography, Button, Paper, Divider } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

const LoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          maxWidth: 1000,
          width: '100%',
          minHeight: 600,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            flex: 1,
            bgcolor: 'var(--background-sidebar)',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" fontWeight="600" gutterBottom sx={{ color: 'white' }}>
            ¡Bienvenido!
          </Typography>
          <Typography variant="body1" sx={{ mb: 6, maxWidth: 300, color: 'rgba(255,255,255,0.7)' }}>
            Iniciá sesión o creá una cuenta para comenzar a gestionar tus facturas.
          </Typography>
          
          <Box display="flex" gap={3} flexWrap="wrap" justifyContent="center">
            <Button
              variant="contained"
              startIcon={<GitHubIcon />}
              href="https://github.com/veron-santiago"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                bgcolor: '#24292e',
                color: 'white',
                '&:hover': { bgcolor: '#1a1e22' }
              }}
            >
              GitHub
            </Button>
            <Button
              variant="contained"
              startIcon={<LinkedInIcon />}
              href="https://www.linkedin.com/in/veron-santiago/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                bgcolor: '#0077b5',
                color: 'white',
                '&:hover': { bgcolor: '#005885' }
              }}
            >
              LinkedIn
            </Button>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        <Box
          sx={{
            flex: 1,
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <LoginForm />
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage
