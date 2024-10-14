import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from '@mui/material';
import { Tune } from '@mui/icons-material';
import {
  useBoardGameContext,
  fetchBoardGames,
} from '../contexts/BoardGameContext';
import {
  FilterItem,
  filterOptions,
  FilterMenu
} from './FilterMenu';

const BoardGameList: React.FC = () => {
  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
  const { state, dispatch } = useBoardGameContext();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchBoardGames(dispatch);
  }, [dispatch]);

  const handleFilterClick = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedFilters((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const flattenFilters = (items: FilterItem[]): string[] => {
    return items.reduce((acc: string[], item) => {
      acc.push(item.value);
      if (item.children) {
        acc.push(...flattenFilters(item.children));
      }
      return acc;
    }, []);
  };

  const allFilterValues = flattenFilters(filterOptions);

  const filteredGames = state.boardGames.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      game.title_kana.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.some(
        (filter) =>
          allFilterValues.includes(filter) &&
          (game.genre.includes(filter) ||
            game.playerCount.text.includes(filter) ||
            game.playTime.text.includes(filter) ||
            game.age.text.includes(filter) ||
            game.difficulty.toString() === filter),
      );

    return matchesSearch && matchesFilters;
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
              width: 56,
              height: 56,
              '&:hover': {
                bgcolor: filterOpen ? 'text.primary' : 'action.hover',
              },
            }}
          >
            <Tune />
          </IconButton>
          <TextField
            label="検索"
            value={searchKeyword}
            onChange={handleSearchChange}
            fullWidth
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <Box>
          {filterOpen && (
            <FilterMenu
              options={filterOptions}
              onFilterChange={handleFilterChange}
              selectedFilters={selectedFilters}
            />
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
    <Box sx={{ display: 'grid', padding: 2, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          aria-label="filter"
          onClick={handleFilterClick}
          sx={{
            color: filterOpen ? 'background.default' : 'text.primary',
            bgcolor: filterOpen ? 'text.primary' : 'background.default',
            width: 56,
            height: 56,
            '&:hover': {
              bgcolor: filterOpen ? 'text.primary' : 'action.hover',
            },
          }}
        >
          <Tune />
        </IconButton>
        <TextField
          label="検索"
          value={searchKeyword}
          onChange={handleSearchChange}
          fullWidth
          sx={{ flexGrow: 1 }}
        />
      </Box>
      <Box>
        {filterOpen && (
          <FilterMenu
            options={filterOptions}
            onFilterChange={handleFilterChange}
            selectedFilters={selectedFilters}
          />
        )}
      </Box>
      <Grid2 container spacing={2}>
        {filteredGames.map((game) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={game.id}>
            <Card component={Link} to={`/boardgames/${game.id}`} sx={{ textDecoration: 'none' }}>
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
                    <Chip
                      key={index}
                      label={g}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {game.description}
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
                    value={game.recommendation}
                    readOnly
                    precision={0.1}
                    size="small"
                  />
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
