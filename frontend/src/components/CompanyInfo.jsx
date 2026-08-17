import { useState } from 'react'
import { Box, Typography, Button, TextField, IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Paper } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import ProfileAvatar from './ProfileAvatar'
import { useNavigate } from 'react-router-dom'
import MercadoPagoConnectButton from './MercadoPagoConnectButton'

const CompanyInfo = ({ companyName, email, address, logoPath }) => {
  const [hover, setHover] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState(email || '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameForm, setNameForm] = useState(companyName || '')
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState(address || '')
  const [addressError, setAddressError] = useState('')
  const [addressSuccess, setAddressSuccess] = useState('')
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [actualPassword, setActualPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [mpMessage, setMpMessage] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCountdownActive, setIsCountdownActive] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [deletingCompany, setDeletingCompany] = useState(false)
  const [countdownTimer, setCountdownTimer] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate()

  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [filePath, setFilePath] = useState('')

  const handleDeleteCompany = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
    
    setIsCountdownActive(true)
    setCountdown(10)
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCountdownTimer(null)
          executeDelete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    setCountdownTimer(timer)
  }

  const handleCancelDelete = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      setCountdownTimer(null)
    }
    
    setIsDeleteDialogOpen(false)
    setIsCountdownActive(false)
    setCountdown(10)
  }

  const executeDelete = async () => {
    setDeletingCompany(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/companies`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        console.error('Error deleting company')
        setIsDeleteDialogOpen(false)
        setIsCountdownActive(false)
        setCountdown(10)
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      setIsDeleteDialogOpen(false)
      setIsCountdownActive(false)
      setCountdown(10)
    } finally {
      setDeletingCompany(false)
    }
  }



  const handleLogout = () => {
    const confirmLogout = window.confirm('¿Está seguro de que desea cerrar sesión?')
    if (confirmLogout) {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const handleEditEmail = () => {
    setIsEditingEmail(true)
    setEmailForm(email || '')
    setEmailError('')
    setEmailSuccess('')
  }

  const handleEditName = () => {
    setIsEditingName(true)
    setNameForm(companyName || '')
    setNameError('')
    setNameSuccess('')
  }

  const handleCancelEditName = () => {
    setIsEditingName(false)
    setNameForm(companyName || '')
    setNameError('')
  }

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false)
    setEmailForm(email || '')
    setEmailError('')
  }

  const handleSaveName = () => {
    const token = localStorage.getItem('token')
    const updateData = { name: nameForm.trim() === '' ? null : nameForm.trim() }

    fetch(`${API_URL}/companies/name`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
      .then(res => {
        console.log(res)
        if (!res.ok) {
          return res.json().then(err => {
            if (err.errors && Array.isArray(err.errors)) {
              throw new Error(err.errors.join(', '))
            }
            throw new Error(err.name || err.message || 'Error al actualizar nombre')
          })
        }
        return res
      })
      .then(() => {
        setIsEditingName(false)
        setNameError('')
        setNameSuccess('Nombre actualizado con éxito.')
        setTimeout(() => window.location.reload(), 2000)
      })
      .catch(err => {
        setNameError(err.message)
      })
  }

  const handleSaveEmail = () => {
    const token = localStorage.getItem('token')
    const updateData = { email: emailForm.trim() === '' ? null : emailForm.trim() }

    fetch(`${API_URL}/companies/email`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
      .then(res => {
        console.log(res)
        if (!res.ok) {
          return res.json().then(err => {
            if (err.errors && Array.isArray(err.errors)) {
              throw new Error(err.errors.join(', '))
            }
            throw new Error(err.email || err.message || 'Error al actualizar email')
          })
        }
        return res
      })
      .then(() => {
        setIsEditingEmail(false)
        setEmailError('')
        setEmailSuccess('Email actualizado con éxito. Se ha enviado una notificación al email anterior.')
        setTimeout(() => window.location.reload(), 2000)
      })
      .catch(err => {
        setEmailError(err.message)
      })
  }

  const handleEditAddress = () => {
    setIsEditingAddress(true)
    setAddressForm(address || '')
    setAddressError('')
    setAddressSuccess('')
  }

  const handleCancelEditAddress = () => {
    setIsEditingAddress(false)
    setAddressForm(address || '')
    setAddressError('')
  }

  const handleSaveAddress = () => {
    const token = localStorage.getItem('token')
    const updateData = { address: addressForm.trim() === '' ? null : addressForm.trim() }

    fetch(`${API_URL}/companies/address`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            if (err.errors && Array.isArray(err.errors)) {
              throw new Error(err.errors.join(', '))
            }
            throw new Error(err.message || 'Error al actualizar dirección')
          })
        }
        return res
      })
      .then(() => {
        setIsEditingAddress(false)
        setAddressError('')
        setAddressSuccess('Dirección actualizada con éxito.')
        setTimeout(() => window.location.reload(), 2000)
      })
      .catch(err => {
        setAddressError(err.message)
      })
  }

  const openPasswordDialog = () => {
    setIsPasswordDialogOpen(true)
    setActualPassword('')
    setNewPassword('')
    setPasswordError('')
  }

  const closePasswordDialog = () => {
    setIsPasswordDialogOpen(false)
    setPasswordError('')
  }

  const handleSavePassword = () => {
    setSavingPassword(true)
    setPasswordError('')
    const token = localStorage.getItem('token')
    const data = { actualPassword, newPassword }

    fetch(`${API_URL}/companies/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            const msg =
              err.newPassword ||
              err.actualPassword ||
              err.message ||
              'Error al cambiar contraseña'
            throw new Error(msg)
          })
        }
        return res
      })    
      .then(() => {
        closePasswordDialog()
      })
      .catch(err => {
        setPasswordError(err.message)
      })
      .finally(() => setSavingPassword(false))
  }

  const openLogoDialog = () => {
    setIsLogoDialogOpen(true)
    setSelectedFile(null)
    setPreviewUrl('')
    setFilePath('')
  }

  const closeLogoDialog = () => {
    setIsLogoDialogOpen(false)
    setSelectedFile(null)
    setPreviewUrl('')
    setFilePath('')
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setFilePath(file.name)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setFilePath(file.name)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUploadLogo = () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    const token = localStorage.getItem('token')

    fetch(`${API_URL}/companies/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al subir el logo')
        }
        closeLogoDialog()
        window.location.reload()
      })
      .catch(err => {
        console.error('Error uploading logo:', err)
        alert('Error al subir el logo: ' + err.message)
      })
  }

  

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, mb: 4 }}>
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          p: 6
        }}
      >
        <Box mb={6}>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            CONFIGURACIÓN
          </Typography>
          <Typography variant="body1" color="text.secondary">
          </Typography>
        </Box>

        <Divider sx={{ mb: 6 }} />

        <Box mb={6} display="flex" gap={4}>
          {/* Información de la empresa - 70-75% */}
          <Box flex={0.72}>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Información de la empresa
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={3} mt={5}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight="500" color="text.primary" sx={{ minWidth: 120 }}>
                  Nombre:
                </Typography>
                {isEditingName ? (
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <TextField
                      size="small"
                      type="text"
                      value={nameForm}
                      onChange={(e) => setNameForm(e.target.value)}
                      placeholder="Nombre de la compañía"
                      inputProps={{ maxLength: 100 }}
                      fullWidth
                    />
                    <IconButton size="small" onClick={handleSaveName} color="primary" sx={{ '&:focus': { outline: 'none' } }}>
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEditName} color="secondary" sx={{ '&:focus': { outline: 'none' } }}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <Typography color="text.secondary">{companyName || '-'}</Typography>
                    <IconButton size="small" onClick={handleEditName} sx={{ '&:focus': { outline: 'none' }, opacity: 0.6, '&:hover': { opacity: 1 } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight="500" color="text.primary" sx={{ minWidth: 120 }}>
                  Email:
                </Typography>
                {isEditingEmail ? (
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <TextField
                      size="small"
                      type="email"
                      value={emailForm}
                      onChange={(e) => setEmailForm(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      inputProps={{ maxLength: 100 }}
                      fullWidth
                    />
                    <IconButton size="small" onClick={handleSaveEmail} color="primary" sx={{ '&:focus': { outline: 'none' } }}>
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEditEmail} color="secondary" sx={{ '&:focus': { outline: 'none' } }}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <Typography color="text.secondary">{email || '-'}</Typography>
                    <IconButton size="small" onClick={handleEditEmail} sx={{ '&:focus': { outline: 'none' }, opacity: 0.6, '&:hover': { opacity: 1 } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight="500" color="text.primary" sx={{ minWidth: 120 }}>
                  Dirección:
                </Typography>
                {isEditingAddress ? (
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <TextField
                      size="small"
                      type="text"
                      value={addressForm}
                      onChange={(e) => setAddressForm(e.target.value)}
                      placeholder="Dirección"
                      inputProps={{ maxLength: 200 }}
                      fullWidth
                    />
                    <IconButton size="small" onClick={handleSaveAddress} color="primary" sx={{ '&:focus': { outline: 'none' } }}>
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEditAddress} color="secondary" sx={{ '&:focus': { outline: 'none' } }}>
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1} flex={1}>
                    <Typography color="text.secondary">{address || '-'}</Typography>
                    <IconButton size="small" onClick={handleEditAddress} sx={{ '&:focus': { outline: 'none' }, opacity: 0.6, '&:hover': { opacity: 1 } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Logo - 25-30% */}
          <Box flex={0.28}>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Logo
            </Typography>
            
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight={200}
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300',
                p: 4,
                mt: 4
              }}
            >
              {logoPath ? (
                <Box
                  component="img"
                  src={logoPath}
                  alt="Logo de la empresa"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 180,
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  No hay un logo cargado
                </Typography>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              El logo aparecerá automáticamente en las facturas generadas.
            </Typography>

            <Button
              variant="outlined"
              onClick={openLogoDialog}
              sx={{ mt: 3 }}
              fullWidth
            >
              Cambiar logo
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 6 }} />

        {/* Seguridad */}
        <Box mb={6}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Seguridad
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          </Typography>

          <Button
            variant="outlined"
            onClick={openPasswordDialog}
          >
            Cambiar contraseña
          </Button>
        </Box>

        <Divider sx={{ mb: 6 }} />

        {/* Integraciones */}
        <Box mb={6}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Integraciones
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Conectá con Mercado Pago para generar códigos QR de pago en tus facturas.
          </Typography>

          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <MercadoPagoConnectButton value="Vincular con Mercado Pago" onConnectionSuccess={() => setMpMessage('Cuenta vinculada correctamente')} />
            {mpMessage && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  mt: 1,
                  zIndex: 1000,
                  width: '400px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Alert 
                  severity={mpMessage.startsWith('Error') ? 'error' : 'success'} 
                  onClose={() => setMpMessage('')} 
                  sx={{ maxWidth: 600 }}
                >
                  {mpMessage}
                </Alert>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 6 }} />

        {/* Cuenta */}
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Cuenta
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
            <Button
              variant="outlined"
              onClick={handleDeleteCompany}
              sx={{
                color: 'error.main',
                borderColor: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  bgcolor: 'error.light',
                  color: 'error.dark'
                }
              }}
            >
              Eliminar cuenta
            </Button>
          </Box>
        </Box>

        {/* Error and Success Alerts */}
        {emailError && (
          <Box mt={2}>
            <Alert severity="error" onClose={() => setEmailError('')} sx={{ borderRadius: 1 }}>
              {emailError}
            </Alert>
          </Box>
        )}
        {addressError && (
          <Box mt={2}>
            <Alert severity="error" onClose={() => setAddressError('')} sx={{ borderRadius: 1 }}>
              {addressError}
            </Alert>
          </Box>
        )}
        {nameError && (
          <Box mt={2}>
            <Alert severity="error" onClose={() => setNameError('')} sx={{ borderRadius: 1 }}>
              {nameError}
            </Alert>
          </Box>
        )}
        {emailSuccess && (
          <Box mt={2}>
            <Alert severity="success" onClose={() => setEmailSuccess('')} sx={{ borderRadius: 1 }}>
              {emailSuccess}
            </Alert>
          </Box>
        )}
        {addressSuccess && (
          <Box mt={2}>
            <Alert severity="success" onClose={() => setAddressSuccess('')} sx={{ borderRadius: 1 }}>
              {addressSuccess}
            </Alert>
          </Box>
        )}
        {nameSuccess && (
          <Box mt={2}>
            <Alert severity="success" onClose={() => setNameSuccess('')} sx={{ borderRadius: 1 }}>
              {nameSuccess}
            </Alert>
          </Box>
        )}
      </Paper>

      <Dialog open={isPasswordDialogOpen} onClose={closePasswordDialog}>
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Contraseña actual"
            type="password"
            fullWidth
            value={actualPassword}
            onChange={e => setActualPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Nueva contraseña"
            type="password"
            fullWidth
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          {passwordError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {passwordError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordDialog} disabled={savingPassword}>Cancelar</Button>
          <Button onClick={handleSavePassword} disabled={savingPassword}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isLogoDialogOpen}
        onClose={closeLogoDialog}
        PaperProps={{
          sx: {
            width: 400,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '8px 0' }}>
          <Box sx={{ flex: '1 1 auto' }}>
            <TextField
              value={filePath}
              InputProps={{
                readOnly: true
              }}
              size="small"
              sx={{ width: 'calc(100% - 30px)', mr: 1 }}
            />
          </Box>
          <Button
            variant="outlined"
            component="label"
            sx={{ minWidth: 100, p: 0, height: 32, fontSize: 12 }}
          >
            Explorar
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </DialogTitle>
        <DialogContent
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            flexGrow: 1,
            border: '2px dashed #ccc',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            bgcolor: '#fafafa',
            userSelect: 'none',
            px: 1,
            overflow: 'hidden'
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Logo preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <Typography
              color="text.secondary"
              textAlign="center"
              sx={{ userSelect: 'none' }}
            >
              Arrastra o agrega una imagen
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 1 }}>
          <Typography
            sx={{ fontSize: 12, color: 'text.secondary', userSelect: 'none', pl: 1 }}
          >
            La imagen se agregará a las facturas generadas
          </Typography>
          <Button
            variant="contained"
            onClick={handleUploadLogo}
            disabled={!selectedFile}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={!isCountdownActive ? handleCancelDelete : undefined}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
          {isCountdownActive ? 'Eliminando cuenta...' : '¿Eliminar cuenta?'}
        </DialogTitle>
        <DialogContent>
          {!isCountdownActive ? (
            <Typography>
              Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. 
              Esta acción no se puede deshacer.
            </Typography>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ color: '#d32f2f', mb: 2 }}>
                La cuenta se eliminará en:
              </Typography>
              <Typography variant="h2" sx={{ color: '#d32f2f', fontWeight: 'bold', mb: 2 }}>
                {countdown}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Puedes cancelar esta acción presionando el botón de cancelar
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!isCountdownActive ? (
            <>
              <Button onClick={handleCancelDelete}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                sx={{ 
                  backgroundColor: '#d32f2f', 
                  color: 'white',
                  '&:hover': { backgroundColor: '#b71c1c' }
                }}
              >
                Sí, eliminar cuenta
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleCancelDelete}
              variant="contained"
              sx={{ 
                backgroundColor: '#4caf50', 
                color: 'white',
                '&:hover': { backgroundColor: '#388e3c' }
              }}
              disabled={deletingCompany}
            >
              Cancelar eliminación
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CompanyInfo
