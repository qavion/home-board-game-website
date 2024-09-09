import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './components/Header';
import BoardGameList from './components/BoardGameList';

const App: React.FC = () => {
  return (
    <BrowserRouter> 
      <Container maxWidth="lg">
        <Header />
        <BoardGameList />
      </Container>
    </BrowserRouter>
  );
};

export default App;