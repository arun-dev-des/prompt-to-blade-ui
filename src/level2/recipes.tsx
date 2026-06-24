import { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Amount,
  Badge,
  Button,
  Link,
  Divider,
  TextInput,
  PasswordInput,
  TextArea,
  Switch,
  EmptyState,
  CheckIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MailIcon,
  SearchIcon,
  ThumbsUpIcon,
  useToast,
} from '@razorpay/blade/components';
import type { IconComponent, BoxProps } from '@razorpay/blade/components';
import { PaymentSuccess } from './PaymentSuccess';

/**
 * Recipe registry — the "library" the prompt studio composes from. Each recipe
 * is a real Blade composition (tokens only, no raw hex/px). Intent is matched by
 * keywords; this keeps the demo deterministic and backend-free while still being
 * a genuine prompt → on-system-UI flow.
 */
export type Recipe = {
  id: string;
  label: string;
  keywords: string[];
  /** Short description of what the recipe renders. */
  blurb: string;
  Component: () => JSX.Element;
};

/* ---------- shared bits ---------- */

const Panel = ({ children, maxWidth = '460px' }: { children: React.ReactNode; maxWidth?: BoxProps['maxWidth'] }) => (
  <Box
    width="100%"
    maxWidth={maxWidth}
    marginX="auto"
    backgroundColor="surface.background.gray.intense"
    borderRadius="large"
    borderWidth="thin"
    borderColor="surface.border.gray.muted"
    elevation="lowRaised"
    padding={{ base: 'spacing.5', m: 'spacing.7' }}
    display="flex"
    flexDirection="column"
    gap="spacing.5"
  >
    {children}
  </Box>
);

const FeatureRow = ({ children }: { children: string }) => (
  <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
    <CheckCircleIcon size="small" color="interactive.icon.positive.normal" />
    <Text size="small" color="surface.text.gray.subtle">
      {children}
    </Text>
  </Box>
);

/* ---------- recipes ---------- */

const AuthForm = () => {
  const toast = useToast();
  return (
    <Panel maxWidth="400px">
      <Box display="flex" flexDirection="column" gap="spacing.2">
        <Heading as="h2" size="large" weight="semibold" color="surface.text.gray.normal">
          Welcome back
        </Heading>
        <Text size="small" color="surface.text.gray.muted">
          Sign in to your Razorpay dashboard
        </Text>
      </Box>
      <TextInput label="Email" type="email" placeholder="you@company.com" leadingIcon={MailIcon} />
      <PasswordInput label="Password" placeholder="Enter your password" />
      <Box display="flex" justifyContent="flex-end">
        <Link variant="button" size="small" onClick={() => toast.show({ content: 'Reset link sent', color: 'information' })}>
          Forgot password?
        </Link>
      </Box>
      <Button isFullWidth onClick={() => toast.show({ content: 'Signed in', color: 'positive' })}>
        Sign in
      </Button>
      <Box display="flex" flexDirection="row" justifyContent="center" gap="spacing.2">
        <Text size="small" color="surface.text.gray.muted">
          New here?
        </Text>
        <Link variant="button" size="small" onClick={() => {}}>
          Create an account
        </Link>
      </Box>
    </Panel>
  );
};

const PricingPlans = () => {
  const toast = useToast();
  const plans = [
    { name: 'Starter', price: 0, features: ['2% per transaction', 'Standard support', 'Basic analytics'], highlight: false },
    { name: 'Growth', price: 4999, features: ['1.5% per transaction', 'Priority support', 'Advanced analytics', 'Smart routing'], highlight: true },
  ];
  return (
    <Box display="flex" flexDirection={{ base: 'column', m: 'row' }} gap="spacing.5" justifyContent="center">
      {plans.map((plan) => (
        <Box
          key={plan.name}
          width="100%"
          maxWidth="320px"
          backgroundColor="surface.background.gray.intense"
          borderRadius="large"
          borderWidth={plan.highlight ? 'thicker' : 'thin'}
          borderColor={plan.highlight ? 'surface.border.primary.normal' : 'surface.border.gray.muted'}
          elevation={plan.highlight ? 'midRaised' : 'lowRaised'}
          padding="spacing.6"
          display="flex"
          flexDirection="column"
          gap="spacing.5"
        >
          <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
            <Heading as="h3" size="medium" weight="semibold" color="surface.text.gray.normal">
              {plan.name}
            </Heading>
            {plan.highlight ? <Badge color="primary" emphasis="intense">Popular</Badge> : null}
          </Box>
          <Box display="flex" flexDirection="row" alignItems="flex-end" gap="spacing.2">
            <Amount value={plan.price} currency="INR" type="heading" size="large" suffix="none" />
            <Text size="small" color="surface.text.gray.muted">/mo</Text>
          </Box>
          <Divider />
          <Box display="flex" flexDirection="column" gap="spacing.3">
            {plan.features.map((f) => (
              <FeatureRow key={f}>{f}</FeatureRow>
            ))}
          </Box>
          <Button
            isFullWidth
            variant={plan.highlight ? 'primary' : 'secondary'}
            onClick={() => toast.show({ content: `${plan.name} selected`, color: 'positive' })}
          >
            Choose {plan.name}
          </Button>
        </Box>
      ))}
    </Box>
  );
};

const StatsRow = () => {
  const stats: { label: string; value: number; delta: string; up: boolean; icon: IconComponent }[] = [
    { label: 'Total revenue', value: 1284500, delta: '+12.5%', up: true, icon: TrendingUpIcon },
    { label: 'Transactions', value: 8642, delta: '+4.2%', up: true, icon: TrendingUpIcon },
    { label: 'Refunds', value: 32400, delta: '-2.1%', up: false, icon: TrendingDownIcon },
  ];
  return (
    <Box display="flex" flexDirection={{ base: 'column', m: 'row' }} gap="spacing.5">
      {stats.map((s) => (
        <Box
          key={s.label}
          flexGrow={1}
          flexBasis="0px"
          backgroundColor="surface.background.gray.intense"
          borderRadius="large"
          borderWidth="thin"
          borderColor="surface.border.gray.muted"
          elevation="lowRaised"
          padding="spacing.6"
          display="flex"
          flexDirection="column"
          gap="spacing.3"
        >
          <Text size="small" color="surface.text.gray.muted">{s.label}</Text>
          <Amount value={s.value} currency="INR" type="heading" size="medium" suffix="none" />
          <Badge color={s.up ? 'positive' : 'negative'} icon={s.icon}>
            {s.delta}
          </Badge>
        </Box>
      ))}
    </Box>
  );
};

const SettingsPanel = () => {
  const toast = useToast();
  const rows = [
    { id: 'payouts', title: 'Instant payouts', desc: 'Settle to your bank within minutes', on: true },
    { id: 'alerts', title: 'Transaction alerts', desc: 'Email me on every payment', on: true },
    { id: 'reports', title: 'Weekly reports', desc: 'A summary every Monday', on: false },
  ];
  return (
    <Panel maxWidth="480px">
      <Box display="flex" flexDirection="column" gap="spacing.2">
        <Heading as="h2" size="large" weight="semibold" color="surface.text.gray.normal">
          Notification settings
        </Heading>
        <Text size="small" color="surface.text.gray.muted">Choose what you hear from us about</Text>
      </Box>
      <Box display="flex" flexDirection="column" gap="spacing.5">
        {rows.map((r) => (
          <Box key={r.id} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="spacing.5">
            <Box display="flex" flexDirection="column" gap="spacing.0">
              <Text weight="semibold" color="surface.text.gray.normal">{r.title}</Text>
              <Text size="small" color="surface.text.gray.muted">{r.desc}</Text>
            </Box>
            <Switch defaultChecked={r.on} accessibilityLabel={r.title} size="medium" />
          </Box>
        ))}
      </Box>
      <Divider />
      <Box display="flex" justifyContent="flex-end">
        <Button onClick={() => toast.show({ content: 'Preferences saved', color: 'positive' })}>
          Save changes
        </Button>
      </Box>
    </Panel>
  );
};

const FeedbackForm = () => {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  return (
    <Panel maxWidth="440px">
      <Box display="flex" flexDirection="column" gap="spacing.2">
        <Heading as="h2" size="large" weight="semibold" color="surface.text.gray.normal">
          How was your experience?
        </Heading>
        <Text size="small" color="surface.text.gray.muted">Your feedback shapes what we build next</Text>
      </Box>
      <TextArea label="Tell us more" placeholder="What worked, what didn't…" />
      <Button
        isFullWidth
        icon={sent ? CheckIcon : ThumbsUpIcon}
        iconPosition="left"
        onClick={() => {
          setSent(true);
          toast.show({ content: 'Thanks for the feedback!', color: 'positive' });
        }}
      >
        {sent ? 'Sent — thank you' : 'Send feedback'}
      </Button>
    </Panel>
  );
};

const EmptyResult = () => (
  <Box display="flex" justifyContent="center" paddingY="spacing.7">
    <EmptyState
      title="Nothing here yet"
      description="When data arrives, it'll show up right here."
    >
      <Button icon={SearchIcon} iconPosition="left">Explore</Button>
    </EmptyState>
  </Box>
);

export const recipes: Recipe[] = [
  { id: 'payment', label: 'Payment confirmation', keywords: ['payment', 'success', 'paid', 'receipt', 'transaction', 'checkout'], blurb: 'A payment-successful screen with amount, payee and receipt actions.', Component: PaymentSuccess },
  { id: 'auth', label: 'Sign-in form', keywords: ['login', 'log in', 'sign in', 'signin', 'sign up', 'signup', 'auth', 'register', 'password'], blurb: 'An authentication card with email + password.', Component: AuthForm },
  { id: 'pricing', label: 'Pricing plans', keywords: ['pricing', 'plan', 'plans', 'subscription', 'tier', 'upgrade'], blurb: 'Side-by-side pricing cards with a highlighted plan.', Component: PricingPlans },
  { id: 'stats', label: 'Metrics dashboard', keywords: ['dashboard', 'stats', 'metric', 'analytics', 'revenue', 'report', 'kpi'], blurb: 'A row of metric cards with trend badges.', Component: StatsRow },
  { id: 'settings', label: 'Settings panel', keywords: ['settings', 'profile', 'account', 'notification', 'preferences', 'toggle'], blurb: 'A settings panel with switch rows.', Component: SettingsPanel },
  { id: 'feedback', label: 'Feedback form', keywords: ['feedback', 'review', 'rating', 'contact', 'support', 'survey'], blurb: 'A feedback form with a text area.', Component: FeedbackForm },
  { id: 'empty', label: 'Empty state', keywords: ['empty', 'no data', 'placeholder', 'blank'], blurb: 'An empty state with a primary action.', Component: EmptyResult },
];

/** Match a free-text prompt to the best recipe (first keyword hit), else null. */
export const matchRecipe = (prompt: string): Recipe | null => {
  const p = prompt.toLowerCase();
  return recipes.find((r) => r.keywords.some((k) => p.includes(k))) ?? null;
};
