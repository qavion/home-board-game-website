import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMenuContext,
  fetchMenuItems,
  MenuItem,
  updateMenuItem,
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
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fab,
} from '@mui/material';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DotLeaderRow from './DotLeaderRow';

interface MenuListProps {
  isAdmin?: boolean;
}

const MenuList: React.FC<MenuListProps> = ({ isAdmin = false }) => {
  const { state, dispatch } = useMenuContext();
  const { menuItems, loading, error } = state;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [simpleView, setSimpleView] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const categoryRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});
  const navigate = useNavigate();

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

  const handleAddItem = () => {
    navigate('/menu/new');
  };

  const handleEditItem = (itemId: number) => {
    navigate(`/menu/${itemId}/edit`);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteMenuItem(dispatch, itemToDelete.id);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Failed to delete menu item:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleAvailabilityToggle = async (item: MenuItem) => {
    try {
      await updateMenuItem(dispatch, {
        ...item,
        available: !item.available,
      });
    } catch (error) {
      console.error('Failed to update menu item availability:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // If admin, show all items; otherwise only show available items
  const filteredItems = isAdmin
    ? menuItems
    : menuItems.filter((item) => item.available);

  const availableCategories = categories.filter((category) =>
    filteredItems.some((item) => item.type === category.type),
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
              opacity: !item.available && isAdmin ? 0.6 : 1,
              position: 'relative',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <DotLeaderRow label={item.name} value={item.price} />
              </Box>
              {!simpleView && (
                <Typography variant="body2">{item.description}</Typography>
              )}

              {isAdmin && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}
                >
                  <Tooltip title={item.available ? '提供中' : '提供停止中'}>
                    <Switch
                      size="small"
                      checked={item.available}
                      onChange={() => handleAvailabilityToggle(item)}
                      sx={{ mr: 1 }}
                    />
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={() => handleEditItem(item.id)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(item)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
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
          py: 0.75,
          bgcolor: 'background.paper',
          zIndex: 10,
          mt: 2,
        }}
      >
        {availableCategories.length > 1 && (
          <Stack direction="row" spacing={1} flex={1} justifyContent="center">
            {availableCategories.map((category) => (
              <Chip
                key={category.type}
                label={category.title}
                onClick={() => scrollToCategory(category.type)}
                color={activeCategory === category.type ? 'primary' : 'default'}
                variant={
                  activeCategory === category.type ? 'filled' : 'outlined'
                }
                size="small"
                sx={{ px: 1, fontSize: '0.85rem' }}
              />
            ))}
          </Stack>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Tooltip title="シンプル表示">
            <IconButton
              onClick={handleViewToggle}
              color={simpleView ? 'primary' : 'default'}
              size="small"
              sx={{ ml: 0.5 }}
            >
              <FormatLineSpacingIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        {availableCategories.map((category) => {
          const categoryItems = filteredItems.filter(
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

      {isAdmin && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddItem}
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>メニュー項目の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {itemToDelete?.name} を削除してもよろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function for deleting menu items
async function deleteMenuItem(dispatch: any, id: number) {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const authHeader = localStorage.getItem('authHeader') || '';

  try {
    const response = await fetch(`${apiEndpoint}/menu/${id}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY,
        Authorization: authHeader,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Failed to delete menu item');
    }

    dispatch({ type: 'DELETE_MENU_ITEM', payload: id });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
}

export default MenuList;
