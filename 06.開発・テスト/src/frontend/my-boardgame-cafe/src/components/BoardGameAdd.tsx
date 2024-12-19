import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useBoardGameContext,
  addBoardGame,
} from '../contexts/BoardGameContext';

const BoardGameAdd: React.FC = () => {
  const { dispatch } = useBoardGameContext();
  const [title, setTitle] = useState('');
  const [titleKana, setTitleKana] = useState('');
  const [genre, setGenre] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [playerCount, setPlayerCount] = useState({ min: 0, max: 0, text: '' });
  const [playTime, setPlayTime] = useState({ min: 0, max: 0, text: '' });
  const [age, setAge] = useState({ min: 0, text: '' });
  const [difficulty, setDifficulty] = useState('');
  const [recommendation, setRecommendation] = useState(0);
  const [newGenre, setNewGenre] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const navigate = useNavigate();

  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;

  const handleSave = async () => {
    const newGame = {
      title,
      title_kana: titleKana,
      genre,
      tags,
      images,
      description,
      rules,
      playerCount,
      playTime,
      age,
      difficulty,
      recommendation,
    };

    await addBoardGame(dispatch, newGame);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleAddItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    items: string[],
    newItem: string,
    clearSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (newItem && !items.includes(newItem)) {
      setter([...items, newItem]);
      clearSetter('');
    }
  };

  const handleDeleteItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    items: string[],
    itemToDelete: string,
  ) => {
    setter(items.filter((item) => item !== itemToDelete));
  };

  const handleAddImage = async (file: File) => {
    try {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
      const response = await fetch(apiEndpoint + '/boardgames/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
        },
        mode: 'cors',
        body: JSON.stringify({
          fileName: newImage || file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get presigned URL');
      }

      const { presignedUrl, path } = await response.json();

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        mode: 'cors',
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      setImages([...images, path]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <TextField
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="タイトル（かな）"
          value={titleKana}
          onChange={(e) => setTitleKana(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="ジャンル"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={() =>
              handleAddItem(setGenre, genre, newGenre, setNewGenre)
            }
          >
            追加
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {genre.map((g, index) => (
            <Chip
              key={index}
              label={g}
              onDelete={() => handleDeleteItem(setGenre, genre, g)}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="タグ"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={() => handleAddItem(setTags, tags, newTag, setNewTag)}
          >
            追加
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => handleDeleteItem(setTags, tags, tag)}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="画像"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" component="label">
            追加
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleAddImage(e.target.files[0]);
                }
              }}
            />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {images.map((image, index) => (
            <Box
              key={index}
              sx={{ position: 'relative', display: 'inline-block' }}
            >
              <img
                src={`${cloudfrontDomain}/${image}`}
                alt={`thumbnail-${index}`}
                style={{ width: 100, height: 100, objectFit: 'cover' }}
              />
              <IconButton
                onClick={() => handleDeleteItem(setImages, images, image)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
        <TextField
          label="説明"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <TextField
          label="ルール"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="プレイ人数 (最小)"
            type="number"
            value={playerCount.min}
            onChange={(e) =>
              setPlayerCount({ ...playerCount, min: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="プレイ人数 (最大)"
            type="number"
            value={playerCount.max}
            onChange={(e) =>
              setPlayerCount({ ...playerCount, max: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
        </Box>
        <TextField
          label="プレイ人数 (テキスト)"
          value={playerCount.text}
          onChange={(e) =>
            setPlayerCount({ ...playerCount, text: e.target.value })
          }
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="プレイ時間 (最小)"
            type="number"
            value={playTime.min}
            onChange={(e) =>
              setPlayTime({ ...playTime, min: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="プレイ時間 (最大)"
            type="number"
            value={playTime.max}
            onChange={(e) =>
              setPlayTime({ ...playTime, max: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
        </Box>
        <TextField
          label="プレイ時間 (テキスト)"
          value={playTime.text}
          onChange={(e) => setPlayTime({ ...playTime, text: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="年齢 (最小)"
            type="number"
            value={age.min}
            onChange={(e) => setAge({ ...age, min: Number(e.target.value) })}
            fullWidth
            margin="normal"
          />
        </Box>
        <TextField
          label="年齢 (テキスト)"
          value={age.text}
          onChange={(e) => setAge({ ...age, text: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="難易度"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="おすすめ度"
          type="number"
          value={recommendation}
          onChange={(e) => setRecommendation(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            mt: 2,
            marginBottom: 5,
          }}
        >
          <Button variant="contained" color="secondary" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!title || !titleKana}
          >
            確定
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BoardGameAdd;
