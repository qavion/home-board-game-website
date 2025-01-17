import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  useBoardGameContext,
  fetchBoardGame,
  deleteBoardGame,
} from '../contexts/BoardGameContext';

interface Props {
  children?: React.ReactElement<any>;
  isAdmin?: boolean;
}

const BoardGameDetail: React.FC<Props> = (props: Props) => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useBoardGameContext();
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const navigate = useNavigate();

  const { isAdmin } = props;

  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
  const s3ImagePath = import.meta.env.VITE_S3_IMAGE_PATH;
  const s3OriginalDir = import.meta.env.VITE_S3_ORIGINAL_DIR;

  useEffect(() => {
    const loadBoardGame = async () => {
      await fetchBoardGame(dispatch, id!);
      setLoading(false);
    };

    loadBoardGame();
  }, [dispatch, id]);

  const handleDelete = () => {
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await deleteBoardGame(dispatch, Number(id));
    setOpenConfirm(false);
    navigate('/');
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
  };

  const handleEdit = () => {
    navigate(`/boardgames/${id}/edit`);
  };

  if (loading) {
    return <CircularProgress />;
  }

  const game = state.boardGames.find((game) => Number(game.id) === Number(id));

  if (!game) {
    return (
      <Typography sx={{ marginTop: 4 }}>
        ボードゲームが見つかりませんでした。
      </Typography>
    );
  }

  return (
    <Container>
      <Card sx={{ marginTop: 4 }}>
        <Box sx={{ position: 'relative', paddingTop: '100%' }}>
          {game.images && game.images.length > 0 ? (
            <CardMedia
              component="img"
              alt={game.title}
              height="140"
              image={`${cloudfrontDomain}/${s3ImagePath}/${s3OriginalDir}/${game.images[0]}`}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.300',
              }}
            >
              <Typography>No Image Data</Typography>
            </Box>
          )}
        </Box>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {game.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {game.title_kana || '不明'}
          </Typography>
          {game.genre && game.genre.length > 0 ? (
            <Box>
              {game.genre.map((g, index) => (
                <Chip
                  key={index}
                  label={g}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ジャンル: 不明
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {game.description || '説明無し'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              おすすめ度:
            </Typography>
            <Rating
              value={game.recommendation || 0}
              readOnly
              precision={0.1}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            プレイ人数: {game.playerCount?.text || '不明'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            プレイ時間: {game.playTime?.text || '不明'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            年齢: {game.age?.text || '不明'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            難易度: {game.difficulty || '不明'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            作成日時: {' '}
            {(game.created &&
              new Date(game.created).toLocaleString('ja-JP', {
                dateStyle: 'short',
                timeStyle: 'short',
              })) ||
              '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            最終更新日時: {' '}
            {(game.lastModified &&
              new Date(game.lastModified).toLocaleString('ja-JP', {
                dateStyle: 'short',
                timeStyle: 'short',
              })) ||
              '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            入荷日: {game.arrivalDate ? new Date(game.arrivalDate).toLocaleDateString() : '不明'}
          </Typography>
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="body2" color="text.secondary">
                ルール概要
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {game.rules.split('\n').map((rule, index) => (
                  <span key={index}>
                    {rule}
                    <br />
                  </span>
                )) || '不明'}
              </Typography>
            </AccordionDetails>
          </Accordion>
          {isAdmin && (
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
            >
              <Button variant="contained" color="primary" onClick={handleEdit}>
                編集
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDelete}
              >
                削除
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={openConfirm}
        onClose={handleCancelDelete}
      >
        <DialogTitle>{"削除の確認"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ボードゲーム {game.title} を削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BoardGameDetail;
