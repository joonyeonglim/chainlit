import { apiClient } from 'api';
import { SetStateAction, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {toast} from 'sonner';

import DeleteOutline from '@mui/icons-material/DeleteOutline';
import LoadingButton from '@mui/lab/LoadingButton';
import {IconButton} from '@mui/material';
import Button from '@mui/material/Button';
import Edit from '@mui/icons-material/Edit';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import {ClientError, accessTokenState} from '@chainlit/react-client';

import {Translator} from 'components/i18n';
import InputAdornment from "@mui/material/InputAdornment";
import TextField from '@mui/material/TextField';
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";

interface Props {
  threadId: string;
}

const ChangeThreadButton = ({threadId}: Props) => {
  const [open, setOpen] = useState(false);
  const accessToken = useRecoilValue(accessTokenState);
  const [message, setMessage] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSendMessage = () => {
    // 여기에 메시지 전송 로직 추가
    console.log('Sending message:', message);
    setMessage(''); // 메시지 전송 후 텍스트 필드 초기화
    handleClose();
  };

  const handleConfirm = async () => {
    toast.promise(apiClient.deleteThread(threadId, accessToken), {
      loading: (
        <Translator path="components.organisms.threadHistory.sidebar.ChangeThreadButton.changeChat" />
      ),
      success: () => {
        // onDelete();
        return (
          <Translator path="components.organisms.threadHistory.sidebar.ChangeThreadButton.chatChanged" />
        );
      },
      error: (err) => {
        if (err instanceof ClientError) {
          return <span>{err.message}</span>;
        } else {
          return <span></span>;
        }
      }
    });
    handleClose();
  };

  return (
    <div>
      <IconButton size="small" onClick={handleClickOpen} sx={{ p: '2px' }}>
        <Edit sx={{ width: 16, height: 16 }} />
      </IconButton>
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              backgroundImage: 'none'
            }
          }}
        >
          <DialogTitle id="alert-dialog-title">{'Change Name Thread?'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Translator path="components.organisms.threadHistory.sidebar.ChangeThreadButton.confirmMessage" />

            </DialogContentText>
          </DialogContent>

          <DialogActions >

            <TextField
              label="Chat Name"
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSendMessage}>
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ width: '100%' }}
            />

          </DialogActions>

        </Dialog>
      )}
    </div>
  );
};

export { ChangeThreadButton };
