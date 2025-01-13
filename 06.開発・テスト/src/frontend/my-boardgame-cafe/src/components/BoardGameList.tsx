import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
  Grid2,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Button,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import { Tune, SortByAlpha, Add } from '@mui/icons-material';
import {
  useBoardGameContext,
  fetchBoardGames,
} from '../contexts/BoardGameContext';
import {
  filter as defaultFilter,
  FilterItem,
  FilterMenu,
  FilterCategory,
} from './FilterMenu';

interface Props {
  children?: React.ReactElement<any>;
  isAdmin?: boolean;
}

const BoardGameList: React.FC<Props> = ({ isAdmin }) => {
  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
  const s3ImagePath = import.meta.env.VITE_S3_IMAGE_PATH;
  const s3ResizedMDir = import.meta.env.VITE_S3_RESIZED_M_DIR;

  const { state, dispatch } = useBoardGameContext();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] =
    useState<Record<string, FilterCategory>>(defaultFilter);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState<
    'title' | 'title_desc' | 'title_kana' | 'recommendation'
  >('title');
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoardGames(dispatch);
  }, [dispatch]);

  const handleFilterClick = () => {
    setFilterOpen(!filterOpen);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortMenuAnchorEl(null);
  };

  const handleSortChange = (
    order: 'title' | 'title_desc' | 'title_kana' | 'recommendation',
  ) => {
    setSortOrder(order);
    handleSortClose();
  };

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    categoryKey: string,
    item: FilterItem,
  ) => {
    const { checked } = event.target;
    setFilter((prev) => {
      return {
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          items: prev[categoryKey].items.map((i) =>
            i.value === item.value ? { ...i, checked } : i,
          ),
        },
      };
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const handleClearFilters = () => {
    setFilter(defaultFilter);
    setSearchKeyword('');
  };

  const handleAddGame = () => {
    navigate('/boardgames/new');
  };

  const filteredGames = state.boardGames.filter((game) => {
    const keyWords = searchKeyword.split(/\s+/);
    const matchesSearch = keyWords.every((keyWord) => {
      return (
        game.title.toLowerCase().includes(keyWord.toLowerCase()) ||
        game.title_kana.toLowerCase().includes(keyWord.toLowerCase()) ||
        game.genre.some((g) =>
          g.toLowerCase().includes(keyWord.toLowerCase()),
        ) ||
        game.description.toLowerCase().includes(keyWord.toLowerCase()) ||
        game.tags.some((t) => t.toLowerCase().includes(keyWord.toLowerCase()))
      );
    });

    const matchesFilters = Object.entries(filter).every(([key, category]) => {
      const selectedFilters = category.items.filter((item) => item.checked);
      return (
        selectedFilters.length === 0 ||
        selectedFilters.some((item) => {
          switch (key) {
            case 'recommendation':
              return true;
            case 'difficulty':
              return item.label.includes(game.difficulty);
            case 'playTime':
              const [min_time, max_time] = item.value.split('to').map(Number);
              return (
                game.playTime.min <= max_time && game.playTime.max >= min_time
              );
            case 'genre':
              return game.genre.includes(item.label);
            default:
              return false;
          }
        })
      );
    });

    return matchesSearch && matchesFilters;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortOrder) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'title_kana':
        return a.title_kana.localeCompare(b.title_kana);
      case 'recommendation':
        return b.recommendation - a.recommendation;
      default:
        return 0;
    }
  });

  if (state.loading) {
    return (
      <Box sx={{ display: 'grid', padding: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            aria-label="filter"
            onClick={handleFilterClick}
            sx={{
              color: filterOpen ? 'background.default' : 'text.primary',
              bgcolor: filterOpen ? 'text.primary' : 'background.default',
              width: 40, // Adjusted size
              height: 40,
              '&:hover': {
                bgcolor: filterOpen ? 'text.primary' : 'action.hover',
              },
            }}
          >
            <Tune sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            aria-label="sort"
            onClick={handleSortClick}
            sx={{
              color: 'text.primary',
              bgcolor: 'background.default',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <SortByAlpha sx={{ fontSize: 20 }} />
          </IconButton>
          <TextField
            label="検索"
            value={searchKeyword}
            onChange={handleSearchChange}
            fullWidth
            sx={{ flexGrow: 1 }}
          />
          {isAdmin && (
            <IconButton
              aria-label="add"
              onClick={handleAddGame}
              sx={{
                color: 'text.primary',
                bgcolor: 'background.default',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Add sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
        <Menu
          anchorEl={sortMenuAnchorEl}
          open={Boolean(sortMenuAnchorEl)}
          onClose={handleSortClose}
        >
          <MenuItem onClick={() => handleSortChange('title')}>
            タイトル順
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('title_desc')}>
            タイトル逆順
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('title_kana')}>
            タイトルかな順
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('recommendation')}>
            おすすめ順
          </MenuItem>
        </Menu>
        <Box>
          {filterOpen && (
            <FilterMenu filter={filter} onFilterChange={handleFilterChange} />
          )}
        </Box>
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return <Typography color="error">{state.error}</Typography>;
  }

  return (
    <Container>
      <Box sx={{ display: 'grid', padding: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            aria-label="filter"
            onClick={handleFilterClick}
            sx={{
              color: filterOpen ? 'background.default' : 'text.primary',
              bgcolor: filterOpen ? 'text.primary' : 'background.default',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: filterOpen ? 'text.primary' : 'action.hover',
              },
            }}
          >
            <Tune sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            aria-label="sort"
            onClick={handleSortClick}
            sx={{
              color: 'text.primary',
              bgcolor: 'background.default',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <SortByAlpha sx={{ fontSize: 20 }} />
          </IconButton>
          <TextField
            label="検索"
            value={searchKeyword}
            onChange={handleSearchChange}
            fullWidth
            sx={{ flexGrow: 1 }}
          />
          {isAdmin && (
            <IconButton
              aria-label="add"
              onClick={handleAddGame}
              sx={{
                color: 'text.primary',
                bgcolor: 'background.default',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Add sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
        <Menu
          anchorEl={sortMenuAnchorEl}
          open={Boolean(sortMenuAnchorEl)}
          onClose={handleSortClose}
        >
          <MenuItem onClick={() => handleSortChange('title')}>
            タイトル順
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('title_desc')}>
            タイトル逆順
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('title_kana')}>
            タイトルかな順
          </MenuItem>
          <MenuItem onClick={() => handleSortChange('recommendation')}>
            おすすめ順
          </MenuItem>
        </Menu>
        <Box>
          {filterOpen && (
            <FilterMenu filter={filter} onFilterChange={handleFilterChange} />
          )}
        </Box>
        <Typography variant="body2" align="right" color="info">
          ヒット数: {filteredGames.length} 件
        </Typography>
        {sortedGames.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography>条件に一致するゲームはありません。</Typography>
            <Button
              variant="contained"
              onClick={handleClearFilters}
              sx={{ mt: 2 }}
            >
              条件をすべて消去
            </Button>
          </Box>
        )}
        <Grid2 container spacing={2}>
          {sortedGames.map((game) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={game.id}>
              <Card
                component={Link}
                to={`/boardgames/${game.id}`}
                sx={{ textDecoration: 'none' }}
              >
                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                  {game.images && game.images.length > 0 ? (
                    <CardMedia
                      component="img"
                      alt={game.title}
                      height="140"
                      image={`${cloudfrontDomain}/${s3ImagePath}/${s3ResizedMDir}/${game.images[0].split('.').pop() ? game.images[0].replace(/\.[^/.]+$/, '.jpg') : `${game.images[0]}.jpg`}`}
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {game.title_kana || '不明'}
                  </Typography>
                  {game.genre && game.genre.length > 0 ? (
                    <Box sx={{ mb: 1 }}>
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      ジャンル: 不明
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {game.description || '説明無し'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
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
                    作成日時:{' '}
                    {(game.created &&
                      new Date(game.created).toLocaleString('ja-JP', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })) ||
                      '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最終更新日時:{' '}
                    {(game.lastModified &&
                      new Date(game.lastModified).toLocaleString('ja-JP', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })) ||
                      '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    入荷日:{' '}
                    {game.arrivalDate
                      ? new Date(game.arrivalDate).toLocaleDateString()
                      : '不明'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </Container>
  );
};

export default BoardGameList;
