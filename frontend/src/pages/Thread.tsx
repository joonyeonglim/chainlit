import { apiClient } from 'api';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Box } from '@mui/material';
import { accessTokenState, IThread, threadHistoryState, useApi } from '@chainlit/react-client';
import { threadsFiltersState } from "../state/threads";

import Page from './Page';
import ResumeButton from './ResumeButton';
import { fetchThreads } from 'state/fetchThreads';


export default function ThreadPage() {
  const { id } = useParams();
  const [threadHistory, setThreadHistory] = useRecoilState(threadHistoryState);
  const accessToken = useRecoilValue(accessTokenState);
  const filters = useRecoilValue(threadsFiltersState);

  const { data, error, isLoading } = useApi<IThread>(
    apiClient,
    id ? `/project/thread/${id}` : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false
    }
  );

  const handleFetchThreads = async () => {
    if (threadHistory) { // threadHistory가 undefined가 아닌 경우에만 fetchThreads 호출
      await fetchThreads(threadHistory, setThreadHistory, accessToken, filters);
    }
  };

  useEffect(() => {
    if (threadHistory?.currentThreadId !== id) {
      setThreadHistory((prev) => ({ ...prev, currentThreadId: id }));
    }
  }, [id, threadHistory?.currentThreadId, setThreadHistory]);

  return (
    <Page>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: 2
        }}
      >
        <ResumeButton threadId={id} isLoading={isLoading} onThreadsFetched={handleFetchThreads} />
      </Box>
    </Page>
  );
}
