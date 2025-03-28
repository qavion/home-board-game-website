import React, { useState } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Container } from '@mui/material';
import { CssBaseline } from '@mui/material';

import BoardGameList from './components/BoardGameList';
import BoardGameDetail from './components/BoardGameDetail';
import Header from './components/Header';
import Login from './components/Login';
import BoardGameEdit from './components/BoardGameEdit';
import BoardGameAdd from './components/BoardGameAdd';
import TopPage from './components/TopPage';
import MenuList from './components/MenuList';
import MenuAdd from './components/MenuAdd';
import MenuEdit from './components/MenuEdit';
import { darkTheme, lightTheme } from './theme';
import { BoardGameProvider } from './contexts/BoardGameContext';
import { MenuProvider } from './contexts/MenuContext';

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
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'トップページ'}
          />
          <TopPage />
        </>
      ),
    },
    {
      path: '/boardgames',
      element: (
        <>
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'ボードゲーム一覧'}
          />
          <BoardGameList isAdmin={isAdmin} />
        </>
      ),
    },
    {
      path: '/boardgames/:id',
      element: (
        <>
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'ボードゲーム詳細'}
          />
          <BoardGameDetail isAdmin={isAdmin} />
        </>
      ),
    },
    {
      path: '/login',
      element: (
        <>
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'管理者用ログイン'}
          />
          <Login setIsAdmin={setIsAdmin} />
        </>
      ),
    },
    {
      path: '/boardgames/:id/edit',
      element: isAdmin ? (
        <>
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'ボードゲーム編集'}
          />
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
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'ボードゲーム追加'}
          />
          <BoardGameAdd />
        </>
      ) : (
        <RequireAuth />
      ),
    },
    {
      path: '/menu',
      element: (
        <>
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'メニュー'}
          />
          <MenuList isAdmin={isAdmin} />
        </>
      ),
    },
    {
      path: '/menu/new',
      element: isAdmin ? (
        <>
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'メニュー項目追加'}
          />
          <MenuAdd />
        </>
      ) : (
        <RequireAuth />
      ),
    },
    {
      path: '/menu/:id/edit',
      element: isAdmin ? (
        <>
          <Header
            toggleTheme={toggleTheme}
            setIsAdmin={setIsAdmin}
            label={'メニュー項目編集'}
          />
          <MenuEdit />
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
          <MenuProvider>
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
          </MenuProvider>
        </BoardGameProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const RequireAuth: React.FC = () => {
  const location = useLocation();
  return <Navigate to="/login" state={{ from: location.pathname }} />;
};

export default App;
