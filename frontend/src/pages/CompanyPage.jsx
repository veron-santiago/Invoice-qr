import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import Layout from '../components/Layout'
import CompanyInfo from '../components/CompanyInfo'

function CompanyPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [companyData, setCompanyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    fetch(`${API_URL}/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener datos de la empresa')
        return res.json()
      })
      .then(data => {
        console.log('Company data received:', data)
        setCompanyData(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching company data:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography color="error">Error: {error}</Typography>
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <CompanyInfo 
        companyName={companyData?.companyName} 
        email={companyData?.email}
        address={companyData?.address}
        logoPath={companyData?.logoPath}
      />
    </Layout>
  )
}

export default CompanyPage
