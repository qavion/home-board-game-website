import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Container } from '@mui/material';
import { CssBaseline } from '@mui/material';

import BoardGameList from './components/BoardGameList';
import BoardGameDetail from './components/BoardGameDetail';
import Header from './components/Header';
import Login from './components/Login';
import BoardGameEdit from './components/BoardGameEdit';
import BoardGameAdd from './components/BoardGameAdd';
import { darkTheme, lightTheme } from './theme';
import { BoardGameProvider } from './contexts/BoardGameContext';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem('authHeader') !== null,
  );

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  const routes = [
    {
      path: '/',
      element: (
        <>
          <Header toggleTheme={toggleTheme} label={'ボードゲーム一覧'} />
          <BoardGameList isAdmin={isAdmin} />
        </>
      ),
    },
    {
      path: '/boardgames/:id',
      element: (
        <>
          <Header toggleTheme={toggleTheme} label={'ボードゲーム詳細'} />
          <BoardGameDetail isAdmin={isAdmin} />
        </>
      ),
    },
    {
      path: '/login',
      element: (
        <>
          <Header toggleTheme={toggleTheme} label={'管理者用ログイン'} />
          <Login setIsAdmin={setIsAdmin} />
        </>
      ),
    },
    {
      path: '/boardgames/:id/edit',
      element: isAdmin ? (
        <>
          <Header toggleTheme={toggleTheme} label={'ボードゲーム編集'} />
          <BoardGameEdit />
        </>
      ) : (
        <RequireAuth />
      ),
    },
    {
      path: '/boardgames/new',
      element: isAdmin ? (
        <>
          <Header toggleTheme={toggleTheme} label={'ボードゲーム追加'} />
          <BoardGameAdd />
        </>
      ) : (
        <RequireAuth />
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <BoardGameProvider>
          <Container maxWidth="lg">
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </Container>
        </BoardGameProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const RequireAuth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to="/login" state={{ from: `/boardgames/${id}/edit` }} />;
};

export default App;
