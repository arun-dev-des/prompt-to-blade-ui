import { BladeProvider, Box, ToastContainer } from '@razorpay/blade/components';
import { bladeTheme } from '@razorpay/blade/tokens';
import { PageHeader } from './components/PageHeader';
import { EventPage } from './components/EventPage';
import { event } from './data/event';

/**
 * App shell. Everything renders inside a single <BladeProvider> (light theme by
 * default; the header toggles to dark). The page surface itself is a Blade Box
 * with a token background, so there is no app-level CSS colour anywhere.
 */
const App = () => (
  <BladeProvider themeTokens={bladeTheme} colorScheme="light">
    <ToastContainer />
    <Box minHeight="100vh" backgroundColor="surface.background.gray.subtle">
      <PageHeader />
      <EventPage event={event} />
    </Box>
  </BladeProvider>
);

export default App;
