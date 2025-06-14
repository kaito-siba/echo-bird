import { createFileRoute } from '@tanstack/react-router';
import { Timeline } from '../components/Timeline';

export const Route = createFileRoute('/timeline')({
  component: TimelinePage,
});

function TimelinePage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Timeline />
    </div>
  );
}
