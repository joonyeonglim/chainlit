import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { accessTokenState, threadHistoryState } from '@chainlit/react-client';
import { threadsFiltersState } from "state/threads";
import { fetchThreads } from 'state/fetchThreads'; // fetchThreads를 가져옵니다.
import { Translator } from 'components/i18n';
import SquarePenIcon from 'assets/squarePen';

import { useChatInteract } from '@chainlit/react-client';
import { Box, IconButton, IconButtonProps, Tooltip } from '@mui/material';
import NewChatDialog from './newChatDialog';

export default function NewChatButton(props: IconButtonProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { clear } = useChatInteract();
  const [threadHistory, setThreadHistory] = useRecoilState(threadHistoryState);
  const accessToken = useRecoilValue(accessTokenState);
  const filters = useRecoilValue(threadsFiltersState);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    clear();
    navigate('/');
    handleClose();
    // fetchThreads 함수 호출
    if (threadHistory) {
        await fetchThreads(threadHistory, setThreadHistory, accessToken, filters);
    }
  };

  return (
    <Box>
      <Tooltip
        title={<Translator path="components.molecules.newChatButton.newChat" />}
      >
        <IconButton id="new-chat-button" onClick={handleClickOpen} {...props}>
          <SquarePenIcon sx={{ height: 20, width: 20 }} />
        </IconButton>
      </Tooltip>
      <NewChatDialog
        open={open}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </Box>
  );
}
