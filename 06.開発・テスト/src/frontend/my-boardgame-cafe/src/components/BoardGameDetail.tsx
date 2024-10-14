import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress } from '@mui/material';
import { BoardGame } from '../contexts/BoardGameContext';

const BoardGameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [boardGame, setBoardGame] = useState<BoardGame | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch board game details from API or context
    const fetchBoardGame = async () => {
      try {
        const response = await fetch(`/api/boardgames/${id}`);
        const data = await response.json();
        setBoardGame(data);
      } catch (error) {
        console.error('Error fetching board game details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardGame();
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!boardGame) {
    return <Typography>ボードゲームが見つかりませんでした。</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4">{boardGame.title}</Typography>
      <Typography variant="subtitle1">{boardGame.description}</Typography>
      {/* Add more details as needed */}
    </Container>
  );
};

export default BoardGameDetail;
