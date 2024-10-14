import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Container } from '@mui/material';
import { CssBaseline } from '@mui/material';

import BoardGameList from './components/BoardGameList';
import BoardGameDetail from './components/BoardGameDetail';
import Header from './components/Header';
import { darkTheme, lightTheme } from './theme';
import { BoardGameProvider } from './contexts/BoardGameContext';

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
        <BoardGameProvider>
          <Container maxWidth="lg">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Header
                      toggleTheme={toggleTheme}
                      label={'ボードゲーム一覧'}
                    />
                    <BoardGameList />
                  </>
                }
              />
              <Route
                path="/boardgames/:id"
                element={
                  <>
                    <Header
                      toggleTheme={toggleTheme}
                      label={'ボードゲーム詳細'}
                    />
                    <BoardGameDetail />
                  </>
                }
              />
            </Routes>
          </Container>
        </BoardGameProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
