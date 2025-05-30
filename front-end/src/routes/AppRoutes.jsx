import React from 'react'
import { Routes, Route } from 'react-router-dom'

import AuthGuard from './AuthGuard'

import { routes, NO_USER } from './routes'

export default function AppRoutes() {
  return <Routes>
    {
      routes.map(route => {
        let element
        if(route.userLevel > NO_USER) {
          element = <AuthGuard userLevel={route.userLevel}>
            { route.element }
          </AuthGuard>
        }
        else element = route.element

        return <Route
          key={route.path}
          path={route.path}
          element={element}
        />
      })
    }    
  </Routes>
}