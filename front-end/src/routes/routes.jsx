/*
  Define as rotas e suas informações, servido como fonte única de
  verdade para AppRoutes.jsx e MainMenu.jsx
*/
import Homepage from '../pages/Homepage'

import CarForm from '../pages/car/CarForm'
import CarList from '../pages/car/CarList'

import CustomerForm from '../pages/customer/CustomerForm'
import CustomerList from '../pages/customer/CustomerList'

import UserList from '../pages/user/UserList'
import UserForm from '../pages/user/UserForm'

import Login from '../pages/Login'

import BruteForce from '../pages/BruteForce'

// Constantes que definem o nível de acesso do usuário
const NO_USER = 0             // Não há necessidade de usuário autenticado
const AUTHENTICATED_USER = 1  // Somente usuários autenticados
const ADMIN_USER = 2          // Somente usuários administradores

const routes = [
  {
    path: '/',
    description: 'Início',
    element: <Homepage />,
    userLevel: NO_USER,
    divider: true           // Mostra uma divisória no menu
  },
  {
    path: '/login',
    description: 'Entrar',
    element: <Login />,
    userLevel: NO_USER,
    omitFromMainMenu: true  // Não aparece no menu principal
  },
  {
    path: '/customers',
    description: 'Listagem de clientes',
    element: <CustomerList />,
    userLevel: AUTHENTICATED_USER
  },
  {
    path: '/customers/new',
    description: 'Cadastro de clientes',
    element: <CustomerForm />,
    userLevel: AUTHENTICATED_USER,
    divider: true
  },
  {
    path: '/customers/:id',
    description: 'Alterar cliente',
    element: <CustomerForm />,
    userLevel: AUTHENTICATED_USER,
    omitFromMainMenu: true
  },
  {
    path: '/cars',
    description: 'Listagem de veículos',
    element: <CarList />,
    userLevel: AUTHENTICATED_USER
  },
  {
    path: '/cars/new',
    description: 'Cadastro de veículos',
    element: <CarForm />,
    userLevel: AUTHENTICATED_USER,
    divider: true
  },
  {
    path: '/cars/:id',
    description: 'Alterar veículo',
    element: <CarForm />,
    userLevel: AUTHENTICATED_USER,
    omitFromMainMenu: true
  },
  {
    path: '/users',
    description: 'Listagem de usuários',
    element: <UserList />,
    userLevel: ADMIN_USER
  },
  {
    path: '/users/new',
    description: 'Cadastro de usuários',
    element: <UserForm />,
    userLevel: ADMIN_USER,
    divider: true
  },
  {
    path: '/users/:id',
    description: 'Alterar usuário',
    element: <UserForm />,
    userLevel: ADMIN_USER,
    omitFromMainMenu: true
  },
  {
    path: '/brute-force',
    description: 'Ataque de força bruta',
    element: <BruteForce />,
    userLevel: ADMIN_USER,
    divider: true
  }
]

export { routes, NO_USER, AUTHENTICATED_USER, ADMIN_USER }