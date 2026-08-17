import { useEffect, useState } from 'react'
import { List, ListItem, ListItemButton, ListItemText, Box, Typography, IconButton, Drawer, Divider } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import ReceiptIcon from '@mui/icons-material/Receipt'
import InventoryIcon from '@mui/icons-material/Inventory'
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

export default function SidebarMenu({ isMobile, mobileOpen, onDrawerToggle }) {
  const location = useLocation()
  const [showMPButton, setShowMPButton] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/companies`, { 
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      } 
    })
      .then(res => res.json())
      .then(data => {
        if (!data.accessTokenIsPresent) setShowMPButton(true)
        if (data.companyName) setCompanyName(data.companyName)
      })
  }, [])

  const menuItems = [
    { label: 'Facturas', path: '/bills', icon: ReceiptIcon },
    { label: 'Productos', path: '/products', icon: InventoryIcon },
    { label: 'Clientes', path: '/customers', icon: PeopleIcon },
    { label: 'Mi Compañía', path: '/company', icon: BusinessIcon }
  ]

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 2, 
            bgcolor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BusinessIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {companyName || 'Facturación'}
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={onDrawerToggle} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ p: 2, flex: 1 }}>
        {menuItems.map(({ label, path, icon: Icon }) => (
          <ListItem key={path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to={path}
              onClick={isMobile ? onDrawerToggle : undefined}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                bgcolor: location.pathname === path ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                color: location.pathname === path ? 'white' : 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  bgcolor: location.pathname === path ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: 'white'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Icon sx={{ mr: 2, fontSize: 20 }} />
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === path ? 600 : 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'block' }}>
          
        </Typography>
      </Box>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'var(--background-sidebar)',
            borderRight: 'none'
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    )
  }

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        bgcolor: 'var(--background-sidebar)',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: '#374151',
          borderRadius: '3px'
        }
      }}
    >
      {sidebarContent}
    </Box>
  )
}
