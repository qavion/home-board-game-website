import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Avatar, Fade, Fab } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';

interface Props {
  children?: React.ReactElement<any>;
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

const Header: React.FC = (props: Props) => {
  const navigate = useNavigate();
  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar position="sticky" elevation={10}>
          <Toolbar>
            <IconButton aria-label="home" onClick={handleLogoClick}>
              <Avatar alt="サイトロゴ" src={`${cloudfrontDomain}/images/favicon_512x512.png`} />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton aria-label="menu">
              <MenuIcon />
            </IconButton>
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