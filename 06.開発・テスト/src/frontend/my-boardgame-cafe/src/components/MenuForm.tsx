import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  useMenuContext,
  fetchMenuItem,
  addMenuItem,
  updateMenuItem,
} from '../contexts/MenuContext';

interface MenuFormProps {
  isEditMode: boolean;
}

const MenuForm: React.FC<MenuFormProps> = ({ isEditMode }) => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useMenuContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('drink');
  const [available, setAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const loadMenuItem = async () => {
        try {
          await fetchMenuItem(dispatch, Number(id));
          setLoading(false);
        } catch (error) {
          setError('Failed to load menu item');
          setLoading(false);
        }
      };
      loadMenuItem();
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && id) {
      const menuItem = state.menuItems.find(item => item.id === Number(id));
      if (menuItem) {
        setName(menuItem.name);
        setPrice(menuItem.price);
        setDescription(menuItem.description);
        setType(menuItem.type);
        setAvailable(menuItem.available);
      }
    }
  }, [state.menuItems, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const menuItemData = {
      name,
      price,
      description,
      type,
      available,
    };

    try {
      if (isEditMode && id) {
        await updateMenuItem(dispatch, { id: Number(id), ...menuItemData });
      } else {
        await addMenuItem(dispatch, menuItemData);
      }
      navigate('/menu');
    } catch (error) {
      setError('Failed to save menu item');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'メニュー項目の編集' : '新しいメニュー項目'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="価格"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="menu-type-label">種類</InputLabel>
            <Select
              labelId="menu-type-label"
              value={type}
              label="種類"
              onChange={(e) => setType(e.target.value)}
              required
            >
              <MuiMenuItem value="drink">飲み物</MuiMenuItem>
              <MuiMenuItem value="food">食べ物</MuiMenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />
            }
            label="利用可能"
            sx={{ my: 2, display: 'block' }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/menu')}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!name || price <= 0}
            >
              保存
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default MenuForm;
