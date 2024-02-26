import { apiClient } from 'api';
import { useAuth } from 'api/auth';
import isEqual from 'lodash/isEqual';
import uniqBy from 'lodash/uniqBy';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce'; // debounce import

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import {
  IThreadFilters,
  accessTokenState,
  threadHistoryState
} from '@chainlit/react-client';

import { Translator } from 'components/i18n';

import { projectSettingsState } from 'state/project';
import { settingsState } from 'state/settings';
import { threadsFiltersState } from 'state/threads';

import { ThreadList } from './ThreadList';
import TriggerButton from './TriggerButton';
import Filters from './filters';
import { Button } from '@mui/material';

const DRAWER_WIDTH = 260;
const BATCH_SIZE = 20;

const _ThreadHistorySideBar = () => {
  const isMobile = useMediaQuery('(max-width:66rem)');

  const [threadHistory, setThreadHistory] = useRecoilState(threadHistoryState);
  const accessToken = useRecoilValue(accessTokenState);
  // const filters = useRecoilValue(threadsFiltersState);
  const [filters, setFilters] = useRecoilState(threadsFiltersState);

  const [settings, setSettings] = useRecoilState(settingsState);

  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [prevFilters, setPrevFilters] = useState<IThreadFilters>(filters);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const filtersHasChanged = !isEqual(prevFilters, filters);

  const handleScroll = debounce(() => {
    if (!ref.current) return;

    const { scrollHeight, clientHeight, scrollTop } = ref.current;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 10;

    if (isAtBottom && !isLoadingMore && threadHistory?.pageInfo?.hasNextPage) {
      setShouldLoadMore(true);
    } else {
      setShouldLoadMore(false);
    }
  }, 100);

  const fetchThreads = async (cursor?: string | number) => {
    // 페이지의 끝에 도달했는지 확인
    if (!threadHistory?.pageInfo?.hasNextPage && threadHistory?.threads?.length > 0) {
      return;
    }

    try {
      const isLoading = filters.after ? true : false;
      setIsLoadingMore(isLoading);
      setIsFetching(!isLoading);

      const { pageInfo, data } = await apiClient.listThreads(
        { first: BATCH_SIZE, cursor },
        filters,
        accessToken
      );
      setError(undefined);

      // Prevent threads to be duplicated
      const allThreads = uniqBy(
        cursor ? threadHistory?.threads?.concat(data) : data,
        'id'
      );

      if (allThreads) {
        setThreadHistory((prev) => ({
          ...prev,
          pageInfo: pageInfo,
          threads: allThreads
        }));
      }

      setFilters(prevFilters => ({ ...prevFilters, after: pageInfo.endCursor as string }));
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    } finally {
      setShouldLoadMore(false);
      setIsLoadingMore(false);
      setIsFetching(false);
    }
  };

  if (accessToken && !isFetching && !threadHistory?.threads && !error) {
    fetchThreads();
  }

  if (threadHistory?.pageInfo) {
    const { hasNextPage, endCursor } = threadHistory.pageInfo;

    if (shouldLoadMore && !isLoadingMore && hasNextPage && endCursor) {
      fetchThreads(endCursor);
    }
  }

  if (filtersHasChanged) {
    setPrevFilters(filters);
    fetchThreads();
  }

  const setChatHistoryOpen = (open: boolean) =>
    setSettings((prev) => ({ ...prev, isChatHistoryOpen: open }));

  // 컴포넌트 마운트 시 첫 페이지 로딩
  useEffect(() => {
    if (accessToken && !threadHistory?.threads && !error) {
      fetchThreads();
    }
  }, [accessToken, threadHistory?.threads, error]);

  // // 스크롤 이벤트 리스너 추가 및 제거
  // useEffect(() => {
  //   const currentRef = ref.current;
  //   if (currentRef) {
  //     currentRef.addEventListener('scroll', handleScroll);
  //   }
  //
  //   return () => {
  //     if (currentRef) {
  //       currentRef.removeEventListener('scroll', handleScroll);
  //     }
  //   };
  // }, [handleScroll]);

  const handleLoadMore = () => {
    if (threadHistory?.pageInfo?.hasNextPage) {
      fetchThreads(threadHistory.pageInfo.endCursor);
    }
  };


  return (
    <Box display="flex" position="relative">
      <Drawer
        className="chat-history-drawer"
        anchor="left"
        open={settings.isChatHistoryOpen}
        variant={isMobile ? 'temporary' : 'persistent'}
        hideBackdrop={!isMobile}
        onClose={() => setChatHistoryOpen(false)}
        PaperProps={{
          ref: ref,
          onScroll: handleScroll
        }}
        sx={{
          width: settings.isChatHistoryOpen ? 'auto' : 0,
          '& .MuiDrawer-paper': {
            width: settings.isChatHistoryOpen ? DRAWER_WIDTH : 0,
            position: 'inherit',
            gap: 1,
            display: 'flex',
            padding: '0px 4px',
            backgroundImage: 'none',
            borderRight: 'none',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0px 4px 20px 0px rgba(0, 0, 0, 0.20)'
                : '0px 4px 20px 0px rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <Stack
          sx={{
            px: 2,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1.5
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary
            }}
          >
            <Translator path="components.organisms.threadHistory.sidebar.index.pastChats" />
          </Typography>
        </Stack>
        <Filters />
        {threadHistory ? (
          <ThreadList
            threadHistory={threadHistory}
            error={error}
            isFetching={isFetching}
            isLoadingMore={isLoadingMore}
            fetchThreads={fetchThreads}
          />
        ) : null}
        {threadHistory?.pageInfo?.hasNextPage && (
          <Button onClick={handleLoadMore}>더 보기</Button>
        )}
      </Drawer>
      {!isMobile ? (
        <Box
          position="absolute"
          sx={{
            top: '50%',
            transform: 'translateY(-100%)',
            right: -30,
            zIndex: 10
          }}
        >
          <TriggerButton
            onClick={() => setChatHistoryOpen(!settings.isChatHistoryOpen)}
            open={settings.isChatHistoryOpen}
          />
        </Box>
      ) : null}
    </Box>
  );
};

const ThreadHistorySideBar = () => {
  const { user } = useAuth();
  const pSettings = useRecoilValue(projectSettingsState);

  if (!pSettings?.dataPersistence || !user) {
    return null;
  }

  return <_ThreadHistorySideBar />;
};

export { ThreadHistorySideBar };
