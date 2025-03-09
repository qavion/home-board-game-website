import React, { useEffect, useRef, useState } from 'react';
import {
  useMenuContext,
  fetchMenuItems,
  MenuItem,
} from '../contexts/MenuContext';
import {
  CircularProgress,
  Grid2,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import DotLeaderRow from './DotLeaderRow';

const MenuList: React.FC = () => {
  const { state, dispatch } = useMenuContext();
  const { menuItems, loading, error } = state;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [simpleView, setSimpleView] = useState<boolean>(false);
  const categoryRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});

  const categories = [
    { type: 'drink', title: '飲み物' },
    { type: 'food', title: '食べ物' },
  ];

  // Initialize refs for each category
  useEffect(() => {
    categories.forEach((category) => {
      categoryRefs.current[category.type] = React.createRef<HTMLDivElement>();
    });
  }, []);

  useEffect(() => {
    fetchMenuItems(dispatch);
  }, [dispatch]);

  const scrollToCategory = (categoryType: string) => {
    setActiveCategory(categoryType);
    const ref = categoryRefs.current[categoryType];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewToggle = () => {
    setSimpleView(!simpleView);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const availableItems = menuItems.filter((item) => item.available);
  const availableCategories = categories.filter((category) =>
    availableItems.some((item) => item.type === category.type),
  );

  if (availableCategories.length > 0 && !activeCategory) {
    setActiveCategory(availableCategories[0].type);
  }

  const renderMenuItems = (items: MenuItem[]) => (
    <Grid2 container spacing={simpleView ? 1 : 2}>
      {items.map((item) => (
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
          <Card
            variant="outlined"
            elevation={0}
            sx={{
              height: '100%',
              '& .MuiCardContent-root': {
                py: simpleView ? 1 : 2,
              },
            }}
          >
            <CardContent>
              <DotLeaderRow label={item.name} value={item.price} />
              {!simpleView && (
                <Typography variant="body2">{item.description}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          py: 2,
          bgcolor: 'background.paper',
          zIndex: 10,
          mb: 2,
        }}
      >
        {availableCategories.length > 1 && (
          <Stack direction="row" spacing={2} flex={1} justifyContent="center">
            {availableCategories.map((category) => (
              <Chip
                key={category.type}
                label={category.title}
                onClick={() => scrollToCategory(category.type)}
                color={activeCategory === category.type ? 'primary' : 'default'}
                variant={
                  activeCategory === category.type ? 'filled' : 'outlined'
                }
                sx={{ px: 2, fontSize: '1rem' }}
              />
            ))}
          </Stack>
        )}

        <Tooltip title="シンプル表示">
          <IconButton
            onClick={handleViewToggle}
            color={simpleView ? 'primary' : 'default'}
            size="small"
            sx={{ ml: 1, mr: 2 }}
          >
            <FormatLineSpacingIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mb: 4 }}>
        {availableCategories.map((category) => {
          const categoryItems = availableItems.filter(
            (item) => item.type === category.type,
          );

          return (
            <Box
              key={category.type}
              ref={categoryRefs.current[category.type]}
              sx={{
                mt: simpleView ? 2 : 4,
                scrollMarginTop: '80px',
              }}
              id={`category-${category.type}`}
            >
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  borderBottom: '2px solid',
                  pb: simpleView ? 0.5 : 1,
                  mb: simpleView ? 1 : 2,
                }}
              >
                {category.title}
              </Typography>
              {renderMenuItems(categoryItems)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MenuList;
