import { useSyncExternalStore } from 'react';
import { BladeProvider, Box, ToastContainer } from '@razorpay/blade/components';
import { bladeTheme } from '@razorpay/blade/tokens';
import { PageHeader } from './components/PageHeader';
import { EventPage } from './components/EventPage';
import { Playground } from './level2/Playground';
import { event } from './data/event';

/**
 * Tiny hash-based view switch — NOT app routing, just a way to flip between the
 * Level 1 submission (default) and the Level 2 freestyle sandbox (`#level2`)
 * without disturbing either. Both render under the same single <BladeProvider>.
 */
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};
const useHash = () =>
  useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  );

const App = () => {
  const isLevel2 = useHash() === '#level2';

  return (
    <BladeProvider themeTokens={bladeTheme} colorScheme="light">
      <ToastContainer />
      <Box minHeight="100vh" backgroundColor="surface.background.gray.subtle">
        <PageHeader />
        {isLevel2 ? <Playground /> : <EventPage event={event} />}
      </Box>
    </BladeProvider>
  );
};

export default App;
