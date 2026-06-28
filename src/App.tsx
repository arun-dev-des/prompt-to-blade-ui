import { BladeProvider, Box, ToastContainer } from '@razorpay/blade/components';
import { bladeTheme } from '@razorpay/blade/tokens';
import { PageHeader } from './components/PageHeader';
import { Playground } from './level2/Playground';

/**
 * The app IS the Blade studio — a prompt → on-system Blade UI, by Claude.
 * Both `/` and the shared `/#level2` link render the same thing; the hash is a
 * no-op kept alive only because that link has been circulated widely.
 */
const App = () => (
  <BladeProvider themeTokens={bladeTheme} colorScheme="light">
    <ToastContainer />
    <Box minHeight="100vh" backgroundColor="surface.background.gray.subtle">
      <PageHeader />
      <Playground />
    </Box>
  </BladeProvider>
);

export default App;
