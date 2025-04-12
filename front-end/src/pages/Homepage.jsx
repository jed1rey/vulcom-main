import React from 'react'
import Typography from '@mui/material/Typography'

const array = []

for(let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  const value = localStorage.getItem(key)
  array.push(`${key} => ${value}`)
}

export default function Homepage() {

  return(
    <>
      <Typography variant="h1" gutterBottom>
        Projeto VULCOM
      </Typography>
      
      <Typography>
        Sistema para análise e estudo de vulnerabilidades comuns  
      </Typography>

      <h3>Valores armazenados no localStorage:</h3>3
      <pre>
        {
          array.map((val, idx) => (
            <p key={idx}>{val}</p>
          ))
        }
      </pre>

      <h3>Cookies encontrados:</h3>
      <pre>{document.cookie}</pre>

    </>
  )
}