import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid2,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
} from '@mui/material';
import {
  useBoardGameContext,
  fetchBoardGames,
} from '../contexts/BoardGameContext';

const BoardGameList: React.FC = () => {
  const { state, dispatch } = useBoardGameContext();
  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;

  useEffect(() => {
    fetchBoardGames(dispatch);
  }, [dispatch]);

  if (state.loading) {
    return <Typography>Loading...</Typography>;
  }

  if (state.error) {
    return <Typography color="error">{state.error}</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid2 container spacing={2}>
        {state.boardGames.map((game) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={game.id}>
            <Card>
              <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                <CardMedia
                  component="img"
                  alt={game.title}
                  height="140"
                  image={`${cloudfrontDomain}/${game.images[0]}`}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {game.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {game.title_kana}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  {game.genre.map((g, index) => (
                    <Chip key={index} label={g} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {game.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    おすすめ度:
                  </Typography>
                  <Rating value={game.recommendation} readOnly precision={0.5} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  プレイ人数: {game.playerCount.text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  プレイ時間: {game.playTime.text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  年齢: {game.age.text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  難易度: {game.difficulty}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default BoardGameList;
