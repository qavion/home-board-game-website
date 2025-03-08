import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  useBoardGameContext,
  BoardGame,
  fetchBoardGames,
} from '../contexts/BoardGameContext';
import '../index.css'; // CSSファイルをインポート

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const TopPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useBoardGameContext();
  const [todayBoardGame, setTodayBoardGame] = useState<BoardGame | null>(null);
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [currentDiceFace, setCurrentDiceFace] = useState(
    diceFaces[0] + diceFaces[0] + diceFaces[0],
  );

  useEffect(() => {
    if (state.boardGames.length === 0) {
      fetchBoardGames(dispatch);
    } else if (!todayBoardGame) {
      const randomIndex = Math.floor(Math.random() * state.boardGames.length);
      setTodayBoardGame(state.boardGames[randomIndex]);
    }
  }, [state.boardGames, dispatch, todayBoardGame]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingAnimation(false);
    }, 3000); // 3秒間のアニメーション

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loadingAnimation) {
      return;
    }
    const diceTimer = setInterval(() => {
      const randomFace =
        diceFaces[Math.floor(Math.random() * diceFaces.length)] +
        diceFaces[Math.floor(Math.random() * diceFaces.length)] +
        diceFaces[Math.floor(Math.random() * diceFaces.length)];
      setCurrentDiceFace(randomFace);
    }, 100); // 0.1秒毎にサイコロの目を切り替える

    return () => clearInterval(diceTimer);
  }, [loadingAnimation]);

  const handleNavigateToBoardGames = () => {
    navigate('/boardgames');
  };

  const handleCardClick = () => {
    if (todayBoardGame) {
      navigate(`/boardgames/${todayBoardGame.id}`);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        ようこそ、ボードゲームカフェへ！
      </Typography>
      {state.loading || loadingAnimation ? (
        <Card sx={{ mt: 4, maxWidth: 345, mx: 'auto', textAlign: 'center' }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '140px',
                fontSize: '50px',
              }}
            >
              {currentDiceFace}
            </Box>
            <Typography variant="body2" color="text.secondary">
              おみくじを引いています...
            </Typography>
          </CardContent>
        </Card>
      ) : (
        todayBoardGame && (
          <Card
            sx={{ mt: 4, maxWidth: 345, mx: 'auto', cursor: 'pointer' }}
            onClick={handleCardClick}
          >
            {todayBoardGame.images && todayBoardGame.images.length > 0 && (
              <CardMedia
                component="img"
                height="140"
                image={`${import.meta.env.VITE_CLOUDFRONT_DOMAIN}/${import.meta.env.VITE_S3_IMAGE_PATH}/${import.meta.env.VITE_S3_RESIZED_M_DIR}/${todayBoardGame.images[0].split('.').pop() ? todayBoardGame.images[0].replace(/\.[^/.]+$/, '.jpg') : `${todayBoardGame.images[0]}.jpg`}`}
                alt={todayBoardGame.title}
              />
            )}
            <CardContent>
              <Typography variant="h5" gutterBottom>
                今日のボードゲーム
              </Typography>
              <Typography variant="h6">{todayBoardGame.title}</Typography>
            </CardContent>
          </Card>
        )
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigateToBoardGames}
        sx={{ mt: 4 }}
      >
        ボードゲーム一覧を見る
      </Button>
    </Box>
  );
};

export default TopPage;
