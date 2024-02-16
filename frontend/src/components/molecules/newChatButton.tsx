import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

// 필요한 상태와 훅을 가져옵니다.
import { accessTokenState, threadHistoryState } from '@chainlit/react-client';
import { threadsFiltersState } from "state/threads";
import { fetchThreads } from 'state/fetchThreads'; // fetchThreads를 가져옵니다.

import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';
import { useChatInteract } from '@chainlit/react-client';
import { AccentButton } from '@chainlit/react-components';
import { Translator } from 'components/i18n';
import NewChatDialog from './newChatDialog';

export default function NewChatButton() {
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
      <AccentButton
        id="new-chat-button"
        variant="outlined"
        onClick={handleClickOpen}
        startIcon={<AddIcon />}
      >
        <Translator path="components.molecules.newChatButton.newChat" />
      </AccentButton>
      <NewChatDialog
        open={open}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </Box>
  );
}
