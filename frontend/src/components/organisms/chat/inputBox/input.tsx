import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import 'regenerator-runtime';

import TuneIcon from '@mui/icons-material/Tune';
import { Box, IconButton, Stack, TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import { FileSpec, useChatData } from '@chainlit/react-client';

import { useTranslation } from 'components/i18n/Translator';
import { Attachments } from 'components/molecules/attachments';
import HistoryButton from 'components/organisms/chat/history';

import { IAttachment, attachmentsState } from 'state/chat';
import { chatSettingsOpenState } from 'state/project';
import { inputHistoryState } from 'state/userInputHistory';
import { chatSettingsState } from 'state/chatSettings'; // 상태 관리를 위한 새로운 Recoil 상태

import MicButton from './MicButton';
import { SubmitButton } from './SubmitButton';
import UploadButton from './UploadButton';

interface Props {
  fileSpec: FileSpec;
  onFileUpload: (payload: File[]) => void;
  onFileUploadError: (error: string) => void;
  onSubmit: (message: string, attachments?: IAttachment[]) => void;
  onReply: (message: string) => void;
}

function getLineCount(el: HTMLDivElement) {
  const textarea = el.querySelector('textarea');
  if (!textarea) {
    return 0;
  }
  const lines = textarea.value.split('\n');
  return lines.length;
}

const Input = memo(
  ({ fileSpec, onFileUpload, onFileUploadError, onSubmit, onReply }: Props) => {
    const [attachments, setAttachments] = useRecoilState(attachmentsState);
    const setInputHistory = useSetRecoilState(inputHistoryState);
    const setChatSettingsOpen = useSetRecoilState(chatSettingsOpenState);
    const chatSettings = useRecoilValue(chatSettingsState); // 새로운 Recoil 상태를 사용
    const setChatSettings = useSetRecoilState(chatSettingsState); // 상태 업데이트 함수 추가

    const ref = useRef<HTMLDivElement>(null);
    const {
      loading,
      askUser,
      chatSettingsInputs,
      disabled: _disabled
    } = useChatData();

    const disabled = _disabled || !!attachments.find((a) => !a.uploaded);

    const [value, setValue] = useState('');
    const [isComposing, setIsComposing] = useState(false);

    const { t } = useTranslation();

    useEffect(() => {
      const pasteEvent = (event: ClipboardEvent) => {
        if (event.clipboardData && event.clipboardData.items) {
          const items = Array.from(event.clipboardData.items);

          // Attempt to handle text data first
          const textData = event.clipboardData.getData('text/plain');
          if (textData) {
            // Skip file handling if text data is present
            return;
          }

          // If no text data, check for files (e.g., images)
          items.forEach((item) => {
            if (item.kind === 'file') {
              const file = item.getAsFile();
              if (file) {
                onFileUpload([file]);
              }
            }
          });
        }
      };

      if (!ref.current) {
        return;
      }

      const input = ref.current;

      input.addEventListener('paste', pasteEvent);

      return () => {
        input.removeEventListener('paste', pasteEvent);
      };
    }, []);

    useEffect(() => {
      if (ref.current && !loading && !disabled) {
        ref.current.focus();
      }
    }, [loading, disabled]);

    const submit = useCallback(() => {
      if (value === '' || disabled) {
        return;
      }
      if (askUser) {
        onReply(value);
      } else {
        onSubmit(value, attachments);
      }
      setChatSettings((old) => ({ ...old, showButtons: false, recommendations: [] })); // 상태 업데이트
      setAttachments([]);
      setValue('');
    }, [
      value,
      disabled,
      setValue,
      askUser,
      attachments,
      setAttachments,
      onSubmit
    ]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          if (!isComposing) {
            e.preventDefault();
            submit();
          }
        } else if (e.key === 'ArrowUp') {
          const lineCount = getLineCount(e.currentTarget as HTMLDivElement);
          if (lineCount <= 1) {
            setInputHistory((old) => ({ ...old, open: true }));
          }
        }
      },
      [submit, setInputHistory, isComposing]
    );

    const onHistoryClick = useCallback((content: string) => {
      if (ref.current) {
        setValue(content);
      }
    }, []);

    const startAdornment = (
      <>
        <HistoryButton disabled={disabled} onClick={onHistoryClick} />
        <UploadButton
          disabled={disabled}
          fileSpec={fileSpec}
          onFileUploadError={onFileUploadError}
          onFileUpload={onFileUpload}
        />
        {!chatSettings.hideSettings && (
          <IconButton
            id="chat-settings-open-modal"
            disabled={disabled}
            color="inherit"
            onClick={() => setChatSettingsOpen(true)}
          >
            <TuneIcon />
          </IconButton>
        )}
        <MicButton disabled={disabled} />
      </>
    );

    return (
      <Stack
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: '1.5rem',
          boxShadow: 'box-shadow: 0px 2px 4px 0px #0000000D',
          textarea: {
            height: '34px',
            maxHeight: '30vh',
            overflowY: 'auto !important',
            resize: 'none',
            paddingBottom: '0.7rem',
            paddingTop: '0.7rem',
            color: 'text.primary',
            lineHeight: '24px'
          }
        }}
      >
        {attachments.length > 0 ? (
          <Box
            sx={{
              mt: 2,
              mx: 2,
              padding: '2px'
            }}
          >
            <Attachments />
          </Box>
        ) : null}

        <TextField
          inputRef={ref}
          id="chat-input"
          autoFocus
          multiline
          variant="standard"
          autoComplete="false"
          placeholder={t(
            'components.organisms.chat.inputBox.input.placeholder'
          )}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          value={value}
          fullWidth
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment
                sx={{ ml: 1, color: 'text.secondary' }}
                position="start"
              >
                {startAdornment}
              </InputAdornment>
            ),
            endAdornment: (
              <SubmitButton onSubmit={submit} disabled={disabled || !value} />
            )
          }}
        />
      </Stack>
    );
  }
);

export default Input;
