import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Box } from '@mui/material';

import {
  accessTokenState,
  IThread,
  threadHistoryState,
  useApi,
  useChatMessages
} from '@chainlit/react-client';
import { threadsFiltersState } from "../state/threads";

import Chat from 'components/organisms/chat';
import { Thread } from 'components/organisms/sidebar/threadHistory/Thread';

import { apiClientState } from 'state/apiClient';

import Page from './Page';
import ResumeButton from './ResumeButton';
import { fetchThreads } from 'state/fetchThreads';


export default function ThreadPage() {
  const { id } = useParams();
  const apiClient = useRecoilValue(apiClientState);
  const accessToken = useRecoilValue(accessTokenState);
  const filters = useRecoilValue(threadsFiltersState);

  const { data, error, isLoading } = useApi<IThread>(
    apiClient,
    id ? `/project/thread/${id}` : null,
    {
      revalidateOnFocus: false
    }
  );

  const [threadHistory, setThreadHistory] = useRecoilState(threadHistoryState);

  const { threadId } = useChatMessages();

  const isCurrentThread = threadId === id;

  const handleFetchThreads = async () => {
    if (threadHistory) { // threadHistory가 undefined가 아닌 경우에만 fetchThreads 호출
      await fetchThreads(threadHistory, setThreadHistory, accessToken, filters);
    }
  };

  useEffect(() => {
    if (threadHistory?.currentThreadId !== id) {
      setThreadHistory((prev) => {
        return { ...prev, currentThreadId: id };
      });
    }
  }, [id]);

  return (
    <Page>
      <>
        {isCurrentThread && <Chat />}
        {!isCurrentThread && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              gap: 2
            }}
          >
            <Box sx={{ width: '100%', flexGrow: 1, overflow: 'auto' }}>
              <Thread thread={data} error={error} isLoading={isLoading} />
            </Box>
            <ResumeButton threadId={id} isLoading={isLoading} onThreadsFetched={handleFetchThreads} />
          </Box>
        )}
      </>
    </Page>
  );
}




//        <ResumeButton threadId={id} isLoading={isLoading} onThreadsFetched={handleFetchThreads} />
