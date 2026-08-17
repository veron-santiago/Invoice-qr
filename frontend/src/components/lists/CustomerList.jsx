import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import ClearIcon from '@mui/icons-material/Clear'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import SearchInput from '../SearchInput'

const CustomerList = () => {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', address: '' })
  const [updateError, setUpdateError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', address: '' })
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener clientes')
        return res.json()
      })
      .then(data => {
        setCustomers(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const sortCustomers = (array) => {
    return [...array].sort((a, b) => {
      const aVal = a[orderBy] || ''
      const bVal = b[orderBy] || ''
      if (typeof aVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return order === 'asc' ? aVal - bVal : bVal - aVal
    })
  }

  const filterCustomers = (customers) => {
    const normalizedQuery = searchQuery.toLowerCase()
    return customers.filter((customer) => {
      const name = customer.name?.toLowerCase() || ''
      const email = customer.email?.toLowerCase() || ''
      const address = customer.address?.toLowerCase() || ''
      return name.includes(normalizedQuery) || email.includes(normalizedQuery) || address.includes(normalizedQuery)
    })
  }

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    const token = localStorage.getItem('token')
    fetch(`${API_URL}/customers/${customerToDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al eliminar cliente')
        setCustomers(customers.filter(c => c.id !== customerToDelete.id))
        setDeleteDialogOpen(false)
        setCustomerToDelete(null)
      })
      .catch(err => {
        console.error(err)
        setDeleteDialogOpen(false)
        setCustomerToDelete(null)
      })
  }

  const handleEditClick = (customer) => {
    setEditingCustomer(customer.id)
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      address: customer.address || ''
    })
    setUpdateError('')
  }

  const handleCancelEdit = () => {
    setEditingCustomer(null)
    setEditForm({ name: '', email: '', address: '' })
    setUpdateError('')
  }

  const handleSaveEdit = () => {
    const token = localStorage.getItem('token')
    
    const updateData = {
      name: editForm.name.trim() === '' ? '' : editForm.name.trim(), 
      email: editForm.email.trim() === '' ? null : editForm.email.trim(), 
      address: editForm.address.trim() === '' ? null : editForm.address.trim() 
    }
    
    console.log('Sending update data:', updateData)

    fetch(`${API_URL}/customers/${editingCustomer}`, {
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
            throw new Error(err.name || err.email || err.address || err.message || 'Error al actualizar cliente')
          })
        }
        return res.json()
      })
      .then(updatedCustomer => {
        console.log('Received updated customer:', updatedCustomer)
        setCustomers(customers.map(c => 
          c.id === editingCustomer ? updatedCustomer : c
        ))
        setEditingCustomer(null)
        setEditForm({ name: '', email: '', address: '' })
        setUpdateError('')
      })
      .catch(err => {
        console.error(err)
        setUpdateError(err.message)
      })
  }

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleClearField = (field) => {
    setEditForm(prev => ({ ...prev, [field]: '' }))
  }

  const handleShowCreateForm = () => {
    setShowCreateForm(true)
    setCreateForm({ name: '', email: '', address: '' })
    setCreateError('')
    setCreateSuccess('')
  }

  const handleCloseCreateForm = () => {
    setShowCreateForm(false)
    setCreateForm({ name: '', email: '', address: '' })
    setCreateError('')
    setCreateSuccess('')
  }

  const handleCreateFormChange = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }))
  }

  const handleClearCreateField = (field) => {
    setCreateForm(prev => ({ ...prev, [field]: '' }))
  }

  const handleCreateCustomer = () => {
    const token = localStorage.getItem('token')
    const createData = {
      name: createForm.name.trim(),
      email: createForm.email.trim() === '' ? null : createForm.email.trim(),
      address: createForm.address.trim() === '' ? null : createForm.address.trim()
    }

    if (!createData.name) {
      setCreateError('El nombre del cliente es obligatorio')
      return
    }

    fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createData)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            if (err.errors && Array.isArray(err.errors)) {
              throw new Error(err.errors.join(', '))
            }
            throw new Error(err.name || err.email || err.address || err.message || 'Error al crear cliente')
          })
        }
        return res.json()
      })
      .then(newCustomer => {
        setCustomers(prev => [...prev, newCustomer])
        setCreateForm({ name: '', email: '', address: '' })
        setCreateError('')
        setCreateSuccess('Cliente creado con éxito')
        setTimeout(() => setCreateSuccess(''), 3000)
      })
      .catch(err => {
        console.error(err)
        setCreateError(err.message)
        setCreateSuccess('')
        setTimeout(() => setCreateError(''), 5000)
      })
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Button
          onClick={handleShowCreateForm}
          variant="contained"
          sx={{
            bgcolor: 'var(--color-primary)',
            '&:hover': { bgcolor: 'var(--color-primary-hover)' },
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <NoteAddIcon />
          Nuevo Cliente
        </Button>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </Box>

      {showCreateForm && (
        <Box mb={4}>
          <Box sx={{ 
            bgcolor: 'var(--background-panel)', 
            borderRadius: 3, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            mb: 2
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--color-text-primary)', width: '33.33%' }}>
                      Cliente
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--color-text-primary)', width: '33.33%' }}>
                      Correo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--color-text-primary)', width: '33.33%' }}>
                      Dirección
                    </TableCell>
                    <TableCell align="center" sx={{ width: '10%' }}>
                      <IconButton
                        onClick={handleCloseCreateForm}
                        size="small"
                        sx={{ '&:focus': { outline: 'none' } }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <TextField
                        size="small"
                        value={createForm.name}
                        onChange={(e) => handleCreateFormChange('name', e.target.value)}
                        placeholder="Nombre del cliente *"
                        inputProps={{ maxLength: 100 }}
                        fullWidth
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <TextField
                          size="small"
                          type="email"
                          value={createForm.email}
                          onChange={(e) => handleCreateFormChange('email', e.target.value)}
                          placeholder="Correo (opcional)"
                          inputProps={{ maxLength: 100 }}
                          sx={{ flexGrow: 1 }}
                        />
                        {createForm.email && (
                          <IconButton
                            size="small"
                            onClick={() => handleClearCreateField('email')}
                            sx={{ ml: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <TextField
                          size="small"
                          value={createForm.address}
                          onChange={(e) => handleCreateFormChange('address', e.target.value)}
                          placeholder="Dirección (opcional)"
                          inputProps={{ maxLength: 200 }}
                          sx={{ flexGrow: 1 }}
                        />
                        {createForm.address && (
                          <IconButton
                            size="small"
                            onClick={() => handleClearCreateField('address')}
                            sx={{ ml: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={handleCreateCustomer}
                        sx={{ 
                          color: 'var(--color-primary)',
                          '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.1)' },
                          '&:focus': { outline: 'none' }
                        }}
                      >
                        <SaveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          {createError && (
            <Box mb={2}>
              <Alert severity="error" onClose={() => setCreateError('')}>
                {createError}
              </Alert>
            </Box>
          )}
          
          {createSuccess && (
            <Box mb={2}>
              <Alert severity="success" onClose={() => setCreateSuccess('')}>
                {createSuccess}
              </Alert>
            </Box>
          )}
        </Box>
      )}

      {!isLoading && (
        <Box sx={{ 
          bgcolor: 'var(--background-panel)', 
          borderRadius: 3, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer', width: '33.33%', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('name')}
                  >
                    Cliente <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', width: '33.33%', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('email')}
                  >
                    Correo <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'var(--color-text-primary)', width: '33.33%', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                    onClick={() => handleRequestSort('address')}
                  >
                    Dirección <ArrowDropDownIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                  </TableCell>
                  <TableCell align="center" sx={{ width: '10%', fontWeight: 600, color: 'var(--color-text-primary)' }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {sortCustomers(filterCustomers(customers))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
.map((customer) => (
                    <TableRow 
                      key={customer.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        transition: 'bgcolor 0.2s ease'
                      }}
                    >
                      <TableCell sx={{ color: 'var(--color-text-primary)' }}>
                        {editingCustomer === customer.id ? (
                          <TextField
                            size="small"
                            value={editForm.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                            placeholder="Nombre del cliente"
                            inputProps={{ maxLength: 100 }}
                            fullWidth
                            required
                          />
                        ) : (
                          customer.name
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'var(--color-text-primary)' }}>
                        {editingCustomer === customer.id ? (
                          <Box display="flex" alignItems="center">
                            <TextField
                              size="small"
                              type="email"
                              value={editForm.email}
                              onChange={(e) => handleFormChange('email', e.target.value)}
                              placeholder="Correo (opcional)"
                              inputProps={{ maxLength: 100 }}
                              sx={{ flexGrow: 1 }}
                            />
                            {editForm.email && (
                              <IconButton
                                size="small"
                                onClick={() => handleClearField('email')}
                                sx={{ ml: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        ) : (
                          customer.email || '-'
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'var(--color-text-primary)' }}>
                        {editingCustomer === customer.id ? (
                          <Box display="flex" alignItems="center">
                            <TextField
                              size="small"
                              value={editForm.address}
                              onChange={(e) => handleFormChange('address', e.target.value)}
                              placeholder="Dirección (opcional)"
                              inputProps={{ maxLength: 200 }}
                              sx={{ flexGrow: 1 }}
                            />
                            {editForm.address && (
                              <IconButton
                                size="small"
                                onClick={() => handleClearField('address')}
                                sx={{ ml: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        ) : (
                          customer.address || '-'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center">
                          {editingCustomer === customer.id ? (
                            <>
                              <IconButton 
                                onClick={handleSaveEdit}
                                sx={{ mr: 1, '&:focus': { outline: 'none' }, color: 'var(--color-primary)', '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.1)' } }}
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton
                                onClick={handleCancelEdit}
                                sx={{ '&:focus': { outline: 'none' }, color: 'var(--color-text-secondary)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <IconButton 
                                onClick={() => handleEditClick(customer)}
                                sx={{ mr: 1, '&:focus': { outline: 'none' }, color: 'var(--color-text-secondary)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteClick(customer)}
                                sx={{ '&:focus': { outline: 'none' }, color: 'var(--color-error)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filterCustomers(customers).length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            sx={{ borderTop: '1px solid var(--color-border)' }}
          />
        </Box>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress sx={{ color: 'var(--color-primary)' }} />
        </Box>
      )}

      {updateError && (
        <Box mt={2}>
          <Alert severity="error" onClose={() => setUpdateError('')}>
            {updateError}
          </Alert>
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar cliente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que quiere eliminar a <b>{customerToDelete?.name}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CustomerList
