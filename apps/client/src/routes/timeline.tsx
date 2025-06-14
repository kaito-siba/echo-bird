import { createFileRoute } from '@tanstack/react-router';
import { Timeline } from '../components/Timeline';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/timeline')({
  component: TimelinePage,
  beforeLoad: authGuard,
});

function TimelinePage() {
  return <Timeline />;
}
