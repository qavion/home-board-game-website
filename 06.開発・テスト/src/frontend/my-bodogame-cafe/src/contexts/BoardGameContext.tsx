import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface BoardGame {
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
  | { type: 'ADD_GAME'; payload: BoardGame };

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
  try {
    const response = await fetch('http://localhost:3001/boardGames');
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

export const addBoardGame = async (
  dispatch: React.Dispatch<BoardGameAction>,
  newGame: Omit<BoardGame, 'id'>,
) => {
  try {
    const response = await fetch('http://localhost:3001/boardGames', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGame),
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
