import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface BoardGame {
  id: number;
  title_kana: string;
  title: string;
  genre: string[];
  tags: string[];
  images: string[];
  description: string;
  rules: string;
  playerCount: {
    min: number;
    max: number;
    text: string;
  };
  playTime: {
    min: number;
    max: number;
    text: string;
  };
  age: {
    min: number;
    text: string;
  };
  difficulty: string;
  recommendation: number;
  arrivalDate: string;
  created: string;
  lastModified: string;
}

interface BoardGameState {
  boardGames: BoardGame[];
  loading: boolean;
  error: string | null;
}

type BoardGameAction =
  | { type: 'FETCH_GAMES_START' }
  | { type: 'FETCH_GAMES_SUCCESS'; payload: BoardGame[] }
  | { type: 'FETCH_GAMES_ERROR'; payload: string }
  | { type: 'ADD_GAME'; payload: BoardGame }
  | { type: 'DELETE_GAME'; payload: number }
  | { type: 'UPDATE_GAME'; payload: BoardGame };

const initialState: BoardGameState = {
  boardGames: [],
  loading: false,
  error: null,
};

const BoardGameContext = createContext<
  | {
      state: BoardGameState;
      dispatch: React.Dispatch<BoardGameAction>;
    }
  | undefined
>(undefined);

const boardGameReducer = (
  state: BoardGameState,
  action: BoardGameAction,
): BoardGameState => {
  switch (action.type) {
    case 'FETCH_GAMES_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_GAMES_SUCCESS':
      return { ...state, loading: false, boardGames: action.payload };
    case 'FETCH_GAMES_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_GAME':
      return { ...state, boardGames: [...state.boardGames, action.payload] };
    case 'DELETE_GAME':
      return {
        ...state,
        boardGames: state.boardGames.filter(game => game.id !== action.payload),
      };
    case 'UPDATE_GAME':
      return {
        ...state,
        boardGames: state.boardGames.map(game =>
          game.id === action.payload.id ? action.payload : game,
        ),
      };
    default:
      return state;
  }
};

export const BoardGameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(boardGameReducer, initialState);

  return (
    <BoardGameContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardGameContext.Provider>
  );
};

export const useBoardGameContext = () => {
  const context = useContext(BoardGameContext);
  if (context === undefined) {
    throw new Error(
      'useBoardGameContext must be used within a BoardGameProvider',
    );
  }
  return context;
};

export const fetchBoardGames = async (
  dispatch: React.Dispatch<BoardGameAction>,
) => {
  dispatch({ type: 'FETCH_GAMES_START' });
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  try {
    const response = await fetch(apiEndpoint + '/boardgames', {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY,
      },
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch board games');
    }
    const data = await response.json();
    dispatch({ type: 'FETCH_GAMES_SUCCESS', payload: data });
  } catch (error) {
    dispatch({
      type: 'FETCH_GAMES_ERROR',
      payload:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export const fetchBoardGame = async (
  dispatch: React.Dispatch<BoardGameAction>,
  id: string,
) => {
  dispatch({ type: 'FETCH_GAMES_START' });
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const authHeader = localStorage.getItem('authHeader') || '';
  try {
    const response = await fetch(apiEndpoint + `/boardgames/${id}`, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY,
        'Authorization': authHeader,
      },
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch board game');
    }
    const data = await response.json();
    dispatch({ type: 'FETCH_GAMES_SUCCESS', payload: [data] });
  } catch (error) {
    dispatch({
      type: 'FETCH_GAMES_ERROR',
      payload:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export const addBoardGame = async (
  dispatch: React.Dispatch<BoardGameAction>,
  newGame: Omit<BoardGame, 'id' | 'created' | 'lastModified'>,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const authHeader = localStorage.getItem('authHeader') || '';
  try {
    const response = await fetch(apiEndpoint + '/boardgames', {
      method: 'POST',
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY,
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGame),
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to add new board game');
    }
    const addedGame = await response.json();
    dispatch({ type: 'ADD_GAME', payload: addedGame });
  } catch (error) {
    console.error('Error adding new board game:', error);
  }
};

export const deleteBoardGame = async (
  dispatch: React.Dispatch<BoardGameAction>,
  id: number,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const authHeader = localStorage.getItem('authHeader') || '';
  try {
    const response = await fetch(apiEndpoint + `/boardgames/${id}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY,
        'Authorization': authHeader,
      },
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to delete board game');
    }
    dispatch({ type: 'DELETE_GAME', payload: id });
  } catch (error) {
    console.error('Error deleting board game:', error);
  }
};

type PartialBoardGame = {
  id: number;
} & Partial<Omit<BoardGame, 'id'>>;

export const updateBoardGame = async (
  dispatch: React.Dispatch<BoardGameAction>,
  updatedGame: PartialBoardGame,
) => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const authHeader = localStorage.getItem('authHeader') || '';
  try {
    const response = await fetch(apiEndpoint + `/boardgames/${updatedGame.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY,
        'Authorization': authHeader,
      },
      body: JSON.stringify(updatedGame),
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to update board game');
    }
    const data = await response.json();
    dispatch({ type: 'UPDATE_GAME', payload: data });
  } catch (error) {
    console.error('Error updating board game:', error);
  }
};
