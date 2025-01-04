import React, { useState, useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Box, Button } from '@mui/material';
import { useChatData, useChatInteract, IStep, useAuth } from '@chainlit/react-client';
import { v4 as uuidv4 } from 'uuid';

import { IAttachment } from 'state/chat';
import { inputHistoryState } from 'state/userInputHistory';
import { chatSettingsState } from 'state/chatSettings';
import { useIsDarkMode } from 'hooks/useIsDarkMode';

const RecommendQuestions = () => {
  const isDark = useIsDarkMode();
  const setInputHistory = useSetRecoilState(inputHistoryState);
  const chatSettings = useRecoilValue(chatSettingsState);
  const setChatSettings = useSetRecoilState(chatSettingsState);
  const { sendMessage } = useChatInteract();
  const { chatSettingsValue, chatSettingsInputs } = useChatData();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const isRecommendQuestions = chatSettingsValue?.recommendQuestions ?? 'None';
    if (isRecommendQuestions !== 'None') {
      const newRecommendations =
        chatSettingsInputs.length > 0 &&
        chatSettingsInputs[chatSettingsInputs.length - 1].id === 'recommendQuestions'
          ? chatSettingsInputs[chatSettingsInputs.length - 1].items.map(
            (item: { value: any }) => item.value
          )
          : [];

      setRecommendations(newRecommendations);
      setChatSettings((old) => ({
        ...old,
        recommendations: newRecommendations,
        showButtons: true
      }));
    } else {
      setChatSettings((old) => ({
        ...old,
        showButtons: false
      }));
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
        createdAt: new Date().toISOString()
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
    [user, sendMessage, setInputHistory]
  );

  const handleQuestionClick = (question: string) => {
    setChatSettings((old) => ({
      ...old,
      showButtons: false,
      recommendations: []
    }));
    onSubmit(question, []);
  };

  return (
    <>
      {chatSettings.showButtons && recommendations.length > 0 && (
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          // 버튼 간 간격 (8px)
          gap={0.7}
          // 박스 크기를 컨텐츠에 맞춤
          width="fit-content"
          maxWidth="48rem"            // 최대 크기는 원하는 만큼 제한 (InputBox 폭에 맞춰 조정)
          // 내용물 기준으로 테두리 박스가 타이트하게 잡히도록 최소화된 padding
          p={1}
          // 테두리 & 모서리 둥글림
          sx={{
            boxSizing: 'border-box',
            border: '0px solid #ccc',
            borderRadius: '8px',
            // 수평 가운데 정렬
            margin: 'auto',
            wordBreak: 'break-word',  // 너무 긴 단어가 있을 때 줄바꿈 처리
          }}
        >
          {recommendations.map((question, index) => (
            <Button
              key={index}
              variant="contained"
              onClick={() => handleQuestionClick(question)}
              sx={{
                // 부모 Box의 gap으로 간격을 관리하므로 margin은 제거
                border: 'none',
                boxShadow: 'none',
                backgroundColor: isDark ? '#333' : '#f0f0f0',
                color: isDark ? '#fff' : '#000',
                '&:hover': {
                  backgroundColor: isDark ? '#444' : '#e0e0e0'
                }
              }}
            >
              {question}
            </Button>
          ))}
        </Box>
      )}
    </>
  );
};

export default RecommendQuestions;
