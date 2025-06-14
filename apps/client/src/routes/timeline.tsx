import { createFileRoute } from '@tanstack/react-router';
import { Timeline } from '../components/Timeline';

export const Route = createFileRoute('/timeline')({
  component: TimelinePage,
});

function TimelinePage() {
  return <Timeline />;
}
