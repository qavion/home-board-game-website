import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface MenuItem {
  id: number;
  name: string;
  type: string;
  description: string;
  price: number;
  available: boolean;
}

interface MenuState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

type MenuAction =
  | { type: 'FETCH_MENU_START' }
  | { type: 'FETCH_MENU_SUCCESS'; payload: MenuItem[] }
  | { type: 'FETCH_MENU_ERROR'; payload: string }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: number }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'SET_ALL_MENU_ITEMS'; payload: MenuItem[] };

const initialState: MenuState = {
  menuItems: [],
  loading: false,
  error: null,
};

const MenuContext = createContext<
  | {
      state: MenuState;
      dispatch: React.Dispatch<MenuAction>;
    }
  | undefined
>(undefined);

const menuReducer = (state: MenuState, action: MenuAction): MenuState => {
  switch (action.type) {
    case 'FETCH_MENU_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_MENU_SUCCESS':
      return { ...state, loading: false, menuItems: action.payload };
    case 'FETCH_MENU_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [...state.menuItems, action.payload] };
    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case 'SET_ALL_MENU_ITEMS':
      return { ...state, menuItems: action.payload };
    default:
      return state;
  }
};

export const MenuProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(menuReducer, initialState);

  return (
    <MenuContext.Provider value={{ state, dispatch }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};

export const fetchMenuItems = async (dispatch: React.Dispatch<MenuAction>) => {
  dispatch({ type: 'FETCH_MENU_START' });
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
  try {
    const response = await fetch(apiEndpoint + '/menu', {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY,
      },
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch menu items');
    }
    const data = await response.json();
    dispatch({ type: 'FETCH_MENU_SUCCESS', payload: data });
  } catch (error) {
    dispatch({
      type: 'FETCH_MENU_ERROR',
      payload:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};
