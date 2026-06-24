import {
  Box,
  Text,
  Badge,
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
  );
};
