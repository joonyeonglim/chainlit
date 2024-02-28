import React, { useState } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import {styled, useTheme} from '@mui/material/styles';
import TranslateIcon from '@mui/icons-material/Translate'; // 구글 번역 아이콘 임포트
import Typography from '@mui/material/Typography';

const GoogleTranslateSwitch = styled(Switch)(({ theme }) => ({
  width: 72,
  height: 40,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 9,
    padding: 1,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(28px)',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.success.main,
        opacity: 1,
        border: 'none',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    display: 'flex', // 아이콘을 가운데 정렬하기 위해 flexbox를 사용합니다.
    alignItems: 'center',
    justifyContent: 'center'
  },
  '& .MuiSwitch-track': {
    borderRadius: 20 / 2,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));



interface TranslateSwitchProps {
  isTranslateEnabled: boolean;
  setIsTranslateEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

function TranslateSwitch({ isTranslateEnabled, setIsTranslateEnabled }: TranslateSwitchProps) {
  const theme = useTheme();

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTranslateEnabled(event.target.checked);
    // 여기에서 번역 기능을 활성화/비활성화하는 로직을 추가할 수 있습니다.
  };

  return (
    <FormControlLabel
      control={
        <GoogleTranslateSwitch
          checked={isTranslateEnabled}
          onChange={handleToggle}
          icon={
            <TranslateIcon style={{ fontSize: 20 }} />
          } // 스위치가 꺼져있을 때의 아이콘
          checkedIcon={
            <TranslateIcon style={{ fontSize: 20 }} />
          } // 스위치가 켜져있을 때의 아이콘
        />
      }
      label="" // 라벨은 비워둡니다.
      style={{ margin: 0, padding: 0 }}
    />
  );
}

export default TranslateSwitch;
