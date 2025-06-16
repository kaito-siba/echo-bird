import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClientJson } from '../../../utils/api-client';

// サーバー側のレスポンスインターフェース
export interface TargetAccountSummary {
  id: number;
  username: string;
  display_name: string | null;
  profile_image_url: string | null;
  is_active: boolean;
}

export interface Timeline {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: number;
  updated_at: number;
  target_accounts: TargetAccountSummary[];
}

export interface TimelineListResponse {
  timelines: Timeline[];
  total: number;
}

export interface TimelineCreateRequest {
  name: string;
  description?: string | null;
  target_account_ids: number[];
  is_active?: boolean;
  is_default?: boolean;
}

export interface TimelineUpdateRequest {
  name?: string | null;
  description?: string | null;
  target_account_ids?: number[] | null;
  is_active?: boolean | null;
  is_default?: boolean | null;
}

// タイムライン一覧取得
export const timelineListQueryOptions = queryOptions({
  queryKey: ['timelines'],
  queryFn: async (): Promise<TimelineListResponse> => {
    return apiClientJson('/timelines');
  },
});

// タイムライン詳細取得
export const timelineDetailQueryOptions = (timelineId: number) =>
  queryOptions({
    queryKey: ['timeline', timelineId],
    queryFn: async (): Promise<Timeline> => {
      return apiClientJson(`/timelines/${timelineId}`);
    },
  });

// タイムライン内ツイート取得
export const timelineTweetsQueryOptions = (
  timelineId: number,
  page = 1,
  pageSize = 20,
) =>
  queryOptions({
    queryKey: ['timeline-tweets', timelineId, page, pageSize],
    queryFn: async () => {
      return apiClientJson(
        `/timelines/${timelineId}/tweets?page=${page}&page_size=${pageSize}`,
      );
    },
  });

// タイムライン作成ミューテーション
export const useCreateTimelineMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TimelineCreateRequest): Promise<Timeline> => {
      return apiClientJson('/timelines', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // タイムライン一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['timelines'] });
    },
  });
};

// タイムライン更新ミューテーション
export const useUpdateTimelineMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      timelineId,
      data,
    }: {
      timelineId: number;
      data: TimelineUpdateRequest;
    }): Promise<Timeline> => {
      return apiClientJson(`/timelines/${timelineId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // タイムライン一覧と詳細を再取得
      queryClient.invalidateQueries({ queryKey: ['timelines'] });
      queryClient.invalidateQueries({ queryKey: ['timeline', data.id] });
    },
  });
};

// タイムライン削除ミューテーション
export const useDeleteTimelineMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timelineId: number): Promise<{ message: string }> => {
      return apiClientJson(`/timelines/${timelineId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // タイムライン一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['timelines'] });
    },
  });
};
