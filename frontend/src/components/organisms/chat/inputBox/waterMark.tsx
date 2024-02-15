import { useRecoilValue } from 'recoil';

import { Stack, Typography } from '@mui/material';

import { Translator } from 'components/i18n';

import LogoDark from 'assets/logo_dark.png';
import LogoLight from 'assets/logo_light.png';

import { settingsState } from 'state/settings';

export default function WaterMark() {
  const { theme } = useRecoilValue(settingsState);
  const src = theme === 'light' ? LogoLight : LogoDark;
  return (
    <Stack mx="auto" className="watermark">
      <a
        href="https://evidnet.com/ko/"
        target="_blank"
        style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none'
        }}
      >
        <Typography fontSize="12px" color="text.secondary">
          <Translator path="components.organisms.chat.inputBox.waterMark.text" />
        </Typography>
        <img
          src={src}
          alt="watermark"
          style={{ width: 65, filter: 'grayscale(1)', marginLeft: '4px' }}
        />
      </a>
    </Stack>
  );
}
