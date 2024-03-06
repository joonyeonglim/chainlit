import React, { useState } from 'react'; // useState 훅 추가

import { useAuth } from 'api/auth';
import { memo, useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { Box } from '@mui/material';

import { FileSpec, IStep, useChatInteract } from '@chainlit/react-client';

import ScrollDownButton from 'components/atoms/buttons/scrollDownButton';

import { IAttachment } from 'state/chat';
import { IProjectSettings } from 'state/project';
import { inputHistoryState } from 'state/userInputHistory';

import Input from './input';
import WaterMark from './waterMark';
import TranslateSwitch from './GoogleTranslateButton'; // TranslateSwitch 컴포넌트 임포트

interface Props {
  fileSpec: FileSpec;
  onFileUpload: (payload: File[]) => void;
  onFileUploadError: (error: string) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  autoScroll?: boolean;
  projectSettings?: IProjectSettings;
}

const InputBox = memo(
  ({
    fileSpec,
    onFileUpload,
    onFileUploadError,
    setAutoScroll,
    autoScroll,
    projectSettings
  }: Props) => {
    const setInputHistory = useSetRecoilState(inputHistoryState);
    // 체크 박스 상태 추가

    const { user } = useAuth();
    const { sendMessage, replyMessage } = useChatInteract();
    const [isTranslateEnabled, setIsTranslateEnabled] = useState(false); // 번역 스위치 상태

    const onSubmit = useCallback(
      async (msg: string, attachments?: IAttachment[], isTranslateEnabled?: boolean) => {
        const message: IStep = {
          threadId: '',
          id: uuidv4(),
          name: user?.identifier || 'User',
          type: 'user_message',
          output: msg,
          createdAt: new Date().toISOString(),
          translate: isTranslateEnabled
        };

        setInputHistory((old) => {
          const MAX_SIZE = 50;
          const inputs = [...(old.inputs || [])];
          inputs.push({
            content: msg,
            createdAt: new Date().getTime()
          });

          return {
            ...old,
            inputs:
              inputs.length > MAX_SIZE
                ? inputs.slice(inputs.length - MAX_SIZE)
                : inputs
          };
        });

        const fileReferences = attachments
          ?.filter((a) => !!a.serverId)
          .map((a) => ({ id: a.serverId! }));

        setAutoScroll(true);
        sendMessage(message, fileReferences);
      },
      [user, projectSettings, sendMessage]
    );

    const onReply = useCallback(
      async (msg: string, isTranslateEnabled?: boolean) => {
        const message: IStep = {
          threadId: '',
          id: uuidv4(),
          name: user?.identifier || 'User',
          type: 'user_message',
          output: msg,
          createdAt: new Date().toISOString(),
          translate: isTranslateEnabled
        };

        replyMessage(message);
        setAutoScroll(true);
      },
      [user, replyMessage]
    );

    return (
      <Box
        display="flex"
        position="relative"
        flexDirection="column"
        gap={1}
        p={2}
        sx={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '60rem',
          m: 'auto',
          justifyContent: 'center'
        }}
      >
        {!autoScroll ? (
          <ScrollDownButton onClick={() => setAutoScroll(true)} />
        ) : null}
        <Box>
          <TranslateSwitch // 번역 스위치 추가
            isTranslateEnabled={isTranslateEnabled}
            setIsTranslateEnabled={setIsTranslateEnabled}
          />
          <Input
            fileSpec={fileSpec}
            onFileUpload={onFileUpload}
            onFileUploadError={onFileUploadError}
            onSubmit={onSubmit}
            onReply={onReply}
            isTranslateEnabled={isTranslateEnabled}
          />
          {/* {tokenCount > 0 && ( */}
          {/* <Stack flexDirection="row" alignItems="center">
          <Typography
            sx={{ ml: 'auto' }}
            color="text.secondary"
            variant="caption"
          >
            Token usage: {tokenCount}
          </Typography>
        </Stack> */}
          {/* )} */}
        </Box>
        <WaterMark />
      </Box>
    );
  }
);

export default InputBox;
