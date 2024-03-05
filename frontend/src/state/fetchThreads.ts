import { apiClient } from 'api';
import uniqBy from "lodash/uniqBy";
import {IThreadFilters, ThreadHistory} from '@chainlit/react-client';

const BATCH_SIZE = 20;

export const fetchThreads = async (
  threadHistory: ThreadHistory, setThreadHistory: (arg0: (prev: any) => any) => void,
  accessToken: string | undefined, filters: IThreadFilters,
  cursor?: string | number
) => {
  const { pageInfo, data } = await apiClient.listThreads(
    { first: BATCH_SIZE },
    filters,
    accessToken
  );

  const allThreads = uniqBy(
    cursor ? threadHistory?.threads?.concat(data) : data,
    'id'
  );

  setThreadHistory((prev) => ({
    ...prev,
    pageInfo: pageInfo,
    threads: allThreads
  }));
};
