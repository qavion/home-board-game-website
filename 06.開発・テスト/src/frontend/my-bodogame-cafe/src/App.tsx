import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Container } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import BoardGameList from './components/BoardGameList';
import Header from './components/Header';
import { darkTheme } from './theme';
import { lightTheme } from './theme';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Container maxWidth="lg">
          <Header toggleTheme={toggleTheme} label={"ボードゲーム一覧"} />
          <BoardGameList />
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;