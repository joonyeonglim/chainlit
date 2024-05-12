import React, { useState, useEffect } from 'react'; // useState 훅 추가
import { useAuth } from 'api/auth';
import { memo, useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { Box, Button } from '@mui/material';

import {ClientError, FileSpec, IStep, useChatInteract} from '@chainlit/react-client';
import { useChatData } from '@chainlit/react-client';

import ScrollDownButton from 'components/atoms/buttons/scrollDownButton';

import { IAttachment } from 'state/chat';
import { IProjectSettings } from 'state/project';
import { inputHistoryState } from 'state/userInputHistory';

import Input from './input';
import WaterMark from './waterMark';
import TranslateSwitch from './GoogleTranslateButton';

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
    const { chatSettingsValue, chatSettingsInputs } =
      useChatData();
    const { sendMessage, replyMessage } = useChatInteract();
    const [recommendations, setRecommendations] = useState<string[]>([]); // Initialize without default questions
    const [showButtons, setShowButtons] = useState(true); // State to control button visibility

    const isRecommendQuestions = chatSettingsValue?.recommendQuestions ?? 'None';
    useEffect(() => {
      if (isRecommendQuestions === "None") {
        setShowButtons(false);
        setRecommendations([]); // Ensure recommendations are cleared if "None"
      } else {
        const lastItems = chatSettingsInputs[chatSettingsInputs.length - 1];
        if (lastItems && lastItems.id === "recommendQuestions") {
          const newRecommendations = lastItems.items.map((item: { value: String; }) => item.value);
          setRecommendations(newRecommendations);
          setShowButtons(newRecommendations.length > 0);
        } else {
          setShowButtons(false);
        }
      }
    }, [isRecommendQuestions, chatSettingsInputs]);


    const onSubmit = useCallback(
      async (msg: string, attachments?: IAttachment[]) => {
        const message: IStep = {
          threadId: '',
          id: uuidv4(),
          name: user?.identifier || 'User',
          type: 'user_message',
          output: msg,
          createdAt: new Date().toISOString(),
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
      async (msg: string) => {
        const message: IStep = {
          threadId: '',
          id: uuidv4(),
          name: user?.identifier || 'User',
          type: 'user_message',
          output: msg,
          createdAt: new Date().toISOString(),
        };

        replyMessage(message);
        setAutoScroll(true);
      },
      [user, replyMessage]
    );

    // Handler for question click
    const handleQuestionClick = (question: string) => { // Ensure parameter is typed
      onSubmit(question, []);
      setShowButtons(false); // Hide buttons after one is clicked

      // Additional integration with sendMessage or replyMessage
    };


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
          maxWidth: '48rem',
          m: 'auto',
          justifyContent: 'center'
        }}
      >
        {!autoScroll ? (
          <ScrollDownButton onClick={() => setAutoScroll(true)} />
        ) : null}
        <Box>
          {/* Display Recommendations */}
          {showButtons && ( // Conditional rendering based on showButtons state
            <Box display="flex" justifyContent="center" mb={2}>
              {recommendations.map((question, index) => (
                <Button key={index} variant="outlined" onClick={() => handleQuestionClick(question)} sx={{ margin: '0 8px' }}>
                  {question}
                </Button>
              ))}
            </Box>
          )}
          <Input
            fileSpec={fileSpec}
            onFileUpload={onFileUpload}
            onFileUploadError={onFileUploadError}
            onSubmit={onSubmit}
            onReply={onReply}
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
