import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom'
import AuthUserContext from '../contexts/AuthUserContext'

import { routes, NO_USER, AUTHENTICATED_USER, ADMIN_USER } from '../routes/routes'

export default function MainMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { authUser } = React.useContext(AuthUserContext)

  // Determina o nível do usuário atualmente autenticado
  let currentUserLevel
  if(!authUser) currentUserLevel = NO_USER
  else if(authUser?.is_admin) currentUserLevel = ADMIN_USER
  else currentUserLevel = AUTHENTICATED_USER

  /*
    Filtra as rotas que se tornarão itens de menu, excluindo:
    * rotas com omitFromMainMenu === true
    * rotas com userLevel > currentUserLevel
  */
  const menuRoutes = routes.filter(route => 
    !(route?.omitFromMainMenu) && route.userLevel <= currentUserLevel
  )
  
  return (
    <div>
      <IconButton 
        edge="start" 
        color="inherit" 
        aria-label="menu" 
        sx={{ mr: 2 }}
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {
          menuRoutes.map(route => (
            <MenuItem
              key={route.path}
              onClick={handleClose}
              component={Link}
              to={route.path}
              divider={route?.divider}
            >
              { route.description }
            </MenuItem>
          ))
        }
      </Menu>
    </div>
  );
}

