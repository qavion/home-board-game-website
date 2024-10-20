import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface FilterItem {
  label: string;
  value: string;
  checked: boolean;
}

export interface FilterCategory {
  label: string;
  items: FilterItem[];
}

interface FilterMenuProps {
  filter: Record<string, FilterCategory>;
  onFilterChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    categoryKey: string,
    item: FilterItem,
  ) => void;
}

export const filter: Record<string, FilterCategory> = {
  recommendation: {
    label: 'おすすめ',
    items: [{ label: 'おすすめ', value: 'recommended', checked: false }],
  },
  difficulty: {
    label: '難易度',
    items: [
      { label: '初心者向け', value: 'beginner', checked: false },
      { label: '中級者向け', value: 'intermediate', checked: false },
      { label: '上級者向け', value: 'advanced', checked: false },
    ],
  },
  playTime: {
    label: 'プレイ時間',
    items: [
      { label: '～5分', value: '0to5', checked: false },
      { label: '5～15分', value: '5to15', checked: false },
      { label: '15～30分', value: '15to30', checked: false },
      { label: '30～60分', value: '30to60', checked: false },
      { label: '1～2時間', value: '60to120', checked: false },
      { label: '2時間～', value: '120to1000000', checked: false },
    ],
  },
  genre: {
    label: 'ジャンル',
    items: [
      { label: '戦略', value: 'strategy', checked: false },
      { label: '推理', value: 'deduction', checked: false },
      { label: '協力', value: 'cooperative', checked: false },
      { label: '抽象', value: 'abstract', checked: false },
      { label: '経済', value: 'economic', checked: false },
      { label: '競り', value: 'auction', checked: false },
      { label: 'カード', value: 'card', checked: false },
      { label: 'ダイス', value: 'dice', checked: false },
      { label: '謎解き', value: 'mystery', checked: false },
      { label: 'マダミス', value: 'murder_mystery', checked: false },
      { label: 'パーティー', value: 'party', checked: false },
      { label: '正体隠匿', value: 'hidden_role', checked: false },
      { label: '拡張再生産', value: 'engine_building', checked: false },
      { label: 'タイル配置', value: 'tile_placement', checked: false },
      { label: 'デッキ構築', value: 'deck_building', checked: false },
      {
        label: 'ワーカープレイスメント',
        value: 'worker_placement',
        checked: false,
      },
    ],
  },
};

export const FilterMenu: React.FC<FilterMenuProps> = ({
  filter,
  onFilterChange,
}) => {
  const isSelected = (item: FilterItem) => item.checked;

  return (
    <div>
      {Object.entries(filter).map(([categoryKey, category]) => (
        <Accordion key={category.label}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {category.items.filter((i) => i.checked).length > 0 ? (
              <Typography sx={{fontWeight: 'bold'}}>
                {category.label +
                  ' (' +
                  category.items.filter((i) => i.checked).length +
                  ')'}
              </Typography>
            ) : (
              <Typography>{category.label}</Typography>
            )}
          </AccordionSummary>
          <AccordionDetails>
            {category.items.map((item: FilterItem) => (
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    value={item.value}
                    checked={isSelected(item)}
                    onChange={(event) =>
                      onFilterChange(event, categoryKey, item)
                    }
                  />
                }
                label={item.label}
              />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
