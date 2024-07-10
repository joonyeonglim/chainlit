import React, { useState, useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Box, Button } from '@mui/material';
import { useChatData, useChatInteract, IStep, useAuth } from '@chainlit/react-client';
import { v4 as uuidv4 } from 'uuid';

import { IAttachment } from 'state/chat';
import { inputHistoryState } from 'state/userInputHistory';
import { chatSettingsState } from 'state/chatSettings'; // 상태 관리를 위한 새로운 Recoil 상태

const RecommendQuestions = () => {
  const setInputHistory = useSetRecoilState(inputHistoryState);
  const chatSettings = useRecoilValue(chatSettingsState); // 새로운 Recoil 상태를 사용
  const setChatSettings = useSetRecoilState(chatSettingsState); // 상태 업데이트 함수 추가
  const { sendMessage } = useChatInteract();
  const { chatSettingsValue, chatSettingsInputs } = useChatData();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const isRecommendQuestions = chatSettingsValue?.recommendQuestions ?? 'None';
    if (isRecommendQuestions !== 'None') {
      const newRecommendations = chatSettingsInputs.length > 0 && chatSettingsInputs[chatSettingsInputs.length - 1].id === "recommendQuestions"
        ? chatSettingsInputs[chatSettingsInputs.length - 1].items.map((item: { value: any; }) => item.value)
        : [];

      setRecommendations(newRecommendations);
      setChatSettings((old) => ({ ...old, recommendations: newRecommendations, showButtons: true })); // 상태 업데이트
    } else {
      setChatSettings((old) => ({ ...old, showButtons: false })); // 상태 업데이트
    }
  }, [chatSettingsInputs, chatSettingsValue?.recommendQuestions, setChatSettings]);

  useEffect(() => {
    const { recommendations, showButtons } = chatSettings;
    setRecommendations(recommendations);
  }, [chatSettings]);

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

      sendMessage(message, fileReferences);
    },
    [user, sendMessage]
  );

  const handleQuestionClick = (question: string) => {
    setChatSettings((old) => ({ ...old, showButtons: false, recommendations: [] })); // 상태 업데이트
    onSubmit(question, []);   // 질문 전송
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
      {chatSettings.showButtons && (
        <Box display="flex" justifyContent="center" mb={2}>
          {recommendations.map((question, index) => (
            <Button key={index} variant="outlined" onClick={() => handleQuestionClick(question)} sx={{ margin: '0 8px' }}>
              {question}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RecommendQuestions;
