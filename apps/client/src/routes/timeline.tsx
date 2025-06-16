import { createFileRoute } from '@tanstack/react-router';
import { Timeline } from '../components/Timeline';
import { authGuard } from '../utils/auth-guard';

// Search params の型定義
interface TimelineSearch {
  timelineId?: number;
}

export const Route = createFileRoute('/timeline')({
  component: TimelinePage,
  beforeLoad: authGuard,
  validateSearch: (search: Record<string, unknown>): TimelineSearch => {
    return {
      timelineId: search.timelineId ? Number(search.timelineId) : undefined,
    };
  },
});

function TimelinePage() {
  const { timelineId } = Route.useSearch();

  return <Timeline selectedTimelineId={timelineId} />;
}
