import {
  Box,
  Text,
  Tooltip,
  IconButton,
  Button,
  ExternalLinkIcon,
  RazorpayIcon,
  SunIcon,
  MoonIcon,
  useTheme,
} from '@razorpay/blade/components';
import { track } from '../analytics';
import { BLOG } from '../links';
import { RAILS_MIN_WIDTH, useMinWidth } from '../useMinWidth';

/**
 * Sticky top bar: brand on the left; the build write-up link and theme toggle on the right.
 * Owns its own colour-scheme control via Blade's `useTheme().setColorScheme`,
 * so dark mode works against the live BladeProvider with no prop drilling.
 */
export const PageHeader = () => {
  const { colorScheme, setColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  // Track the page body: wider container once the right rail appears.
  const wide = useMinWidth(RAILS_MIN_WIDTH);

  return (
    <Box
      as="header"
      position="sticky"
      top="spacing.0"
      zIndex={10}
      backgroundColor="surface.background.gray.moderate"
      borderBottomWidth="thin"
      borderBottomColor="surface.border.gray.muted"
    >
      <Box
        margin="auto"
        maxWidth={wide ? '1560px' : '1120px'}
        width="100%"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingX={{ base: 'spacing.5', m: 'spacing.7' }}
        paddingY="spacing.4"
      >
        <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
          <RazorpayIcon size="large" color="surface.icon.primary.normal" />
          <Text weight="semibold" color="surface.text.gray.normal">
            Razorpay Blade
          </Text>
        </Box>

        <Box display="flex" flexDirection="row" alignItems="center" gap={{ base: 'spacing.3', m: 'spacing.5' }}>
          <Button
            variant="tertiary"
            size="small"
            icon={ExternalLinkIcon}
            iconPosition="right"
            href={BLOG.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('blog_link_clicked', { placement: 'header' })}
          >
            How I built this
          </Button>
          <Tooltip content={isDark ? 'Switch to light' : 'Switch to dark'}>
            <IconButton
              icon={isDark ? SunIcon : MoonIcon}
              size="medium"
              accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
            />
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};
