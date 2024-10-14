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
  children?: FilterItem[];
}

interface FilterMenuProps {
  options: FilterItem[];
  selectedFilters: string[];
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const filterOptions: FilterItem[] = [
  { label: 'おすすめ', value: 'recommended' },
  {
    label: '難易度',
    value: 'difficulty',
    children: [
      { label: '初心者向け', value: 'beginner' },
      { label: '中級者向け', value: 'intermediate' },
      { label: '上級者向け', value: 'advanced' },
    ],
  },
  {
    label: 'プレイ時間',
    value: 'playtime',
    children: [
      { label: '～5分', value: 'under5' },
      { label: '5～15分', value: '5to15' },
      { label: '15～30分', value: '15to30' },
      { label: '30～60分', value: '30to60' },
      { label: '1～2時間', value: '60to120' },
      { label: '2時間～', value: 'over120' },
    ],
  },
  {
    label: 'ジャンル',
    value: 'genre',
    children: [
      { label: '戦略', value: 'strategy' },
      { label: '推理', value: 'deduction' },
      { label: '協力', value: 'cooperative' },
      { label: '抽象', value: 'abstract' },
      { label: '経済', value: 'economic' },
      { label: '競り', value: 'auction' },
      { label: 'カード', value: 'card' },
      { label: 'ダイス', value: 'dice' },
      { label: '謎解き', value: 'mystery' },
      { label: 'マダミス', value: 'murder_mystery' },
      { label: 'パーティー', value: 'party' },
      { label: '正体隠匿', value: 'hidden_role' },
      { label: '拡張再生産', value: 'engine_building' },
      { label: 'タイル配置', value: 'tile_placement' },
      { label: 'デッキ構築', value: 'deck_building' },
      { label: 'ワーカープレイスメント', value: 'worker_placement' },
    ],
  },
];

export const FilterMenu: React.FC<FilterMenuProps> = ({
  options,
  selectedFilters,
  onFilterChange,
}) => {
  return (
    <div>
      {options.map((option) => (
        <Accordion key={option.value}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{option.label}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {option.children ? (
              option.children.map((child) => (
                <FormControlLabel
                  key={child.value}
                  control={
                    <Checkbox
                      value={child.value}
                      checked={selectedFilters.includes(child.value)}
                      onChange={onFilterChange}
                    />
                  }
                  label={child.label}
                />
              ))
            ) : (
              <FormControlLabel
                control={
                  <Checkbox
                    value={option.value}
                    checked={selectedFilters.includes(option.value)}
                    onChange={onFilterChange}
                  />
                }
                label={option.label}
              />
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
