import {
  Box,
  Text,
  Badge,
  Link,
  Tooltip,
  IconButton,
  RazorpayIcon,
  SunIcon,
  MoonIcon,
  useTheme,
} from '@razorpay/blade/components';

/**
 * Sticky top bar: brand on the left, theme toggle on the right.
 * Owns its own colour-scheme control via Blade's `useTheme().setColorScheme`,
 * so dark mode works against the live BladeProvider with no prop drilling.
 */
export const PageHeader = () => {
  const { colorScheme, setColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const isLevel2 = typeof window !== 'undefined' && window.location.hash === '#level2';

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
        maxWidth="1120px"
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
            Events
          </Text>
          <Badge color="primary" size="small">
            Blade
          </Badge>
        </Box>

        <Box display="flex" flexDirection="row" alignItems="center" gap={{ base: 'spacing.4', m: 'spacing.6' }}>
          <Link
            variant="anchor"
            size="medium"
            href={isLevel2 ? '#' : '#level2'}
            color={isLevel2 ? 'neutral' : 'primary'}
          >
            {isLevel2 ? 'View Level 1' : 'View Level 2'}
          </Link>
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
