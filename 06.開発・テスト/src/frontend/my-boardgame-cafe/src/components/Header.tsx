import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slide from '@mui/material/Slide';
import Switch from '@mui/material/Switch';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useScrollTrigger from '@mui/material/useScrollTrigger';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface Props {
  children?: React.ReactElement<any>;
  label: string;
  toggleTheme: () => void;
}

function HideOnScroll(props: Props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    target: window,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}

function ScrollTop(props: Props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        zIndex={1200}
      >
        {children}
      </Box>
    </Fade>
  );
}

const Header: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('authHeader');
    navigate('/');
    handleMenuClose();
  };

  const { toggleTheme } = props;
  const { label } = props;
  const theme = useTheme();
  const isAdmin = localStorage.getItem('authHeader') !== null;

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar elevation={10}>
          <Toolbar>
            <IconButton aria-label="home" onClick={handleLogoClick}>
              <Avatar
                alt="サイトロゴ"
                src={theme.icons.logo}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Typography>
              {label} {isAdmin && ' <管理者>'}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Switch
              color="default"
              onChange={toggleTheme}
              checkedIcon={<Brightness4Icon sx={{ marginTop: -0.24 }} />}
              icon={<Brightness7Icon sx={{ marginTop: -0.24 }} />}
              aria-label="Toggle theme"
            />
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleMenuItemClick('/')}>
                ボードゲーム一覧
              </MenuItem>
              {isAdmin ? (
                <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
              ) : (
                <MenuItem onClick={() => handleMenuItemClick('/login')}>
                  ログイン
                </MenuItem>
              )}
            </Menu>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar id="back-to-top-anchor" />
      <ScrollTop {...props}>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  );
};

export default Header;
