import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';
import {
  useBoardGameContext,
  fetchBoardGame,
  updateBoardGame,
  addBoardGame,
  fetchAllBoardGames,
} from '../contexts/BoardGameContext';
import InputKeyToHiragana from './InputKeyToHiragana';

interface BoardGameFormProps {
  isEditMode: boolean;
}

const BoardGameForm: React.FC<BoardGameFormProps> = ({ isEditMode }) => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useBoardGameContext();
  const [loading, setLoading] = useState(isEditMode);
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
  const [arrivalDate, setArrivalDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [newGenre, setNewGenre] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [inputKey, setInputKey] = useState<string[]>([]);
  const navigate = useNavigate();

  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
  const s3ImagePath = import.meta.env.VITE_S3_IMAGE_PATH;
  const s3OriginalDir = import.meta.env.VITE_S3_ORIGINAL_DIR;

  useEffect(() => {
    if (isEditMode) {
      const loadBoardGame = async () => {
        await fetchBoardGame(dispatch, id!);
        setLoading(false);
      };
      loadBoardGame();
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    const loadAllBoardGames = async () => {
      await fetchAllBoardGames(dispatch);
    };
    loadAllBoardGames();
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode) {
      const game = state.boardGames.find(
        (game) => Number(game.id) === Number(id),
      );
      if (game) {
        setTitle(game.title);
        setTitleKana(game.title_kana);
        setGenre(game.genre);
        setTags(game.tags);
        setImages(game.images);
        setDescription(game.description);
        setRules(game.rules);
        setPlayerCount(game.playerCount);
        setPlayTime(game.playTime);
        setAge(game.age);
        setDifficulty(game.difficulty);
        setRecommendation(game.recommendation);
        setArrivalDate(game.arrivalDate);
      }
    }
  }, [state.boardGames, id, isEditMode]);

  const getChangedAttributes = () => {
    const game = state.boardGames.find(
      (game) => Number(game.id) === Number(id),
    );
    if (!game) return {};

    const updatedGame: Partial<typeof game> = {};
    if (title !== game.title) updatedGame.title = title;
    if (titleKana !== game.title_kana) updatedGame.title_kana = titleKana;
    if (JSON.stringify(genre) !== JSON.stringify(game.genre))
      updatedGame.genre = genre;
    if (JSON.stringify(tags) !== JSON.stringify(game.tags))
      updatedGame.tags = tags;
    if (JSON.stringify(images) !== JSON.stringify(game.images))
      updatedGame.images = images;
    if (description !== game.description) updatedGame.description = description;
    if (rules !== game.rules) updatedGame.rules = rules;
    if (JSON.stringify(playerCount) !== JSON.stringify(game.playerCount))
      updatedGame.playerCount = playerCount;
    if (JSON.stringify(playTime) !== JSON.stringify(game.playTime))
      updatedGame.playTime = playTime;
    if (JSON.stringify(age) !== JSON.stringify(game.age)) updatedGame.age = age;
    if (difficulty !== game.difficulty) updatedGame.difficulty = difficulty;
    if (recommendation !== game.recommendation)
      updatedGame.recommendation = recommendation;
    if (arrivalDate !== game.arrivalDate) updatedGame.arrivalDate = arrivalDate;

    return updatedGame;
  };

  const handleSave = async () => {
    if (isEditMode) {
      const updatedGame = getChangedAttributes();
      if (Object.keys(updatedGame).length === 0) return;
      await updateBoardGame(dispatch, { id: Number(id), ...updatedGame });
    } else {
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
        arrivalDate,
        difficulty,
        recommendation,
      };
      await addBoardGame(dispatch, newGame);
    }
    navigate(isEditMode ? `/boardgames/${id}` : '/');
  };

  const handleCancel = () => {
    navigate(isEditMode ? `/boardgames/${id}` : '/');
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

  const handleAddImage = async (file: File, id: string) => {
    const previousImages = [...images];
    try {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
      const authHeader = localStorage.getItem('authHeader') || '';
      const response = await fetch(apiEndpoint + '/boardgames/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Authorization': authHeader,
        },
        mode: 'cors',
        body: JSON.stringify({
          fileName: newImage || `${id}_${file.name}`,
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

      const fileName = path.split('/').pop() || '';
      if (images.includes(fileName)) {
        return;
      }
      if (fileName === '') {
        throw new Error(`Failed to get filename from path: ${path}`);
      }

      setImages([...images, fileName]);
    } catch (error) {
      console.error('Error uploading image:', error);
      setImages(previousImages);
      if (error instanceof Error) {
        alert(`Error uploading image: ${error.message}`);
      } else {
        alert('An unknown error occurred while uploading the image.');
      }
    }
  };

  const allGenresSet = new Set<string>();
  const allTagsSet = new Set<string>();
  const allPlayerCountsSet = new Set<string>();
  const allAgesSet = new Set<string>();
  const allDifficultiesSet = new Set<string>();
  const allPlayTimesSet = new Set<string>();

  state.boardGames.forEach((game) => {
    game.genre.forEach((genre) => allGenresSet.add(genre));
    game.tags.forEach((tag) => allTagsSet.add(tag));
    allPlayerCountsSet.add(game.playerCount.text);
    allAgesSet.add(game.age.text);
    allDifficultiesSet.add(game.difficulty);
    allPlayTimesSet.add(game.playTime.text);
  });

  const allGenres = Array.from(allGenresSet).sort();
  const allTags = Array.from(allTagsSet).sort();
  const allPlayerCounts = Array.from(allPlayerCountsSet).sort();
  const allAges = Array.from(allAgesSet).sort();
  const allDifficulties = Array.from(allDifficultiesSet).sort();
  const allPlayTimes = Array.from(allPlayTimesSet).sort();

  if (loading) {
    return <CircularProgress />;
  }

  const renderAutocomplete = (
    label: string,
    options: string[],
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    handleAdd: () => void,
  ) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Autocomplete
        options={options}
        value={value}
        onInputChange={(_e, newInputValue) => setValue(newInputValue)}
        fullWidth
        renderInput={(params) => (
          <TextField {...params} label={label} fullWidth margin="normal" />
        )}
      />
      <Button variant="contained" onClick={handleAdd}>
        追加
      </Button>
    </Box>
  );

  const inputTitle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTitle(e.target.value);
  };

  const inputTitleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      setInputKey(inputKey.slice(0, -1));
      return;
    }
    if (e.key in InputKeyToHiragana) {
      setInputKey([...inputKey, e.key]);
    }
  };

  const convertAndSetTitleKana = () => {
    if (inputKey.length === 0 || titleKana !== '') {
      setInputKey([]);
      return;
    }
    let tempTable: any = InputKeyToHiragana;
    let tempTitleKana = '';
    let prevKey = '';
    const hiraganaRegex = /^\p{sc=Hiragana}+$/u;
    for (const key of inputKey) {
      if (key in tempTable) {
        tempTable = tempTable[key];
        if (typeof tempTable === 'string') {
          tempTitleKana += tempTable;
          tempTable = InputKeyToHiragana;
        }
        prevKey = key;
      } else if (key === prevKey) {
        tempTitleKana += 'っ';
      } else if (prevKey === 'n') {
        tempTitleKana += 'ん';
        if (key in InputKeyToHiragana) {
          tempTable = InputKeyToHiragana;
          tempTable = tempTable[key];
        } else {
          tempTable = InputKeyToHiragana;
        }
      } else if (hiraganaRegex.test(key)) {
        tempTitleKana += key;
        tempTable = InputKeyToHiragana;
      } else {
        tempTable = InputKeyToHiragana;
      }
    }
    setTitleKana(tempTitleKana);
    setInputKey([]);
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <TextField
          label="タイトル"
          value={title}
          onChange={(e) => inputTitle(e)}
          onKeyUp={(e) => inputTitleKeyUp(e)}
          onBlur={() => convertAndSetTitleKana()}
          fullWidth
          margin="normal"
          slotProps={{
            input: {
              endAdornment: title && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setTitle('')}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="タイトル（かな）"
          value={titleKana}
          onChange={(e) => setTitleKana(e.target.value)}
          fullWidth
          margin="normal"
          slotProps={{
            input: {
              endAdornment: titleKana && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setTitleKana('')}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {renderAutocomplete('ジャンル', allGenres, newGenre, setNewGenre, () =>
          handleAddItem(setGenre, genre, newGenre, setNewGenre),
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {genre.map((g, index) => (
            <Chip
              key={index}
              label={g}
              onDelete={() => handleDeleteItem(setGenre, genre, g)}
            />
          ))}
        </Box>
        {renderAutocomplete('タグ', allTags, newTag, setNewTag, () =>
          handleAddItem(setTags, tags, newTag, setNewTag),
        )}
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
                  handleAddImage(e.target.files[0], id!);
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
                src={`${cloudfrontDomain}/${s3ImagePath}/${s3OriginalDir}/${image}`}
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
        <Autocomplete
          options={allPlayerCounts}
          value={playerCount.text}
          onInputChange={(_e, newInputValue) =>
            setPlayerCount({ ...playerCount, text: newInputValue })
          }
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="プレイ人数 (テキスト)"
              fullWidth
              margin="normal"
            />
          )}
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
        <Autocomplete
          options={allPlayTimes}
          value={playTime.text}
          onInputChange={(_e, newInputValue) =>
            setPlayTime({ ...playTime, text: newInputValue })
          }
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="プレイ時間 (テキスト)"
              fullWidth
              margin="normal"
            />
          )}
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
        <Autocomplete
          options={allAges}
          value={age.text}
          onInputChange={(_e, newInputValue) =>
            setAge({ ...age, text: newInputValue })
          }
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="年齢 (テキスト)"
              fullWidth
              margin="normal"
            />
          )}
        />
        <Autocomplete
          options={allDifficulties}
          value={difficulty}
          onInputChange={(_e, newInputValue) => setDifficulty(newInputValue)}
          fullWidth
          renderInput={(params) => (
            <TextField {...params} label="難易度" fullWidth margin="normal" />
          )}
        />
        <TextField
          label="おすすめ度"
          type="number"
          value={recommendation}
          onChange={(e) => setRecommendation(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="入荷日"
            type="date"
            value={arrivalDate}
            onChange={(e) =>
              setArrivalDate(
                new Date(e.target.value).toISOString().slice(0, 10),
              )
            }
            fullWidth
            margin="normal"
          />
        </Box>
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
            disabled={
              isEditMode
                ? Object.keys(getChangedAttributes()).length === 0
                : !title && !titleKana
            }
          >
            確定
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BoardGameForm;
