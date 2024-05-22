// ResumeButton.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { toast } from 'sonner';
import { Box, Button, Skeleton, Stack } from '@mui/material';
import { useChatInteract } from '@chainlit/react-client';
import { Translator } from 'components/i18n';
import { useLayoutMaxWidth } from 'hooks/useLayoutMaxWidth';
import { projectSettingsState } from 'state/project';

interface Props {
  threadId?: string;
  isLoading?: boolean;
  onThreadsFetched: () => Promise<void>;
}

export default function ResumeButton({ threadId, isLoading, onThreadsFetched }: Props) {
  const navigate = useNavigate();
  const layoutMaxWidth = useLayoutMaxWidth();
  const pSettings = useRecoilValue(projectSettingsState);
  const { clear, setIdToResume } = useChatInteract();

  useEffect(() => {
    if (!isLoading && threadId && pSettings?.threadResumable) {
      onClick();
    }
  }, [threadId, pSettings, isLoading]);

  if (!threadId || !pSettings?.threadResumable) {
    return null;
  }

  if (isLoading) {
    return (
      <React.Fragment>
        {[1, 2, 3].map((index) => (
          <Stack
            key={`thread-skeleton-${index}`}
            sx={{
              px: 2,
              gap: 4,
              mt: 5,
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            <Stack>
              <Skeleton width={50} />
              <Skeleton width={50} />
            </Stack>
            <Skeleton
              variant="rounded"
              sx={{
                maxWidth: '60rem',
                width: '100%',
                height: 100
              }}
            />
          </Stack>
        ))}
      </React.Fragment>
    );
  }

  const onClick = async () => {
    clear();
    setIdToResume(threadId!);

    if (onThreadsFetched) {
      await onThreadsFetched();
    }

    if (!pSettings?.dataPersistence) {
      navigate('/');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      p={2}
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: layoutMaxWidth,
        m: 'auto',
        justifyContent: 'center'
      }}
    >
      <Button id="resumeThread"
              onClick={onClick}
              variant="contained"
              style={{ display: 'none' }}>
        <Translator path="pages.ResumeButton.resumeChat" />
      </Button>
    </Box>
  );
}
