import {
  Box,
  Text,
  Heading,
  Amount,
  Badge,
  Button,
  Divider,
  Switch,
  Avatar,
  TextInput,
  PasswordInput,
  TextArea,
  CheckCircleIcon,
  DownloadIcon,
  ShareIcon,
  CheckIcon,
  ArrowRightIcon,
  PlusIcon,
  UserIcon,
  CalendarIcon,
  LockIcon,
  MailIcon,
  SparklesIcon,
  SendIcon,
  TrashIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@razorpay/blade/components';
import type { IconComponent } from '@razorpay/blade/components';
import type { UIScreen, UISection, UIElement, ElementTone, FeedbackColor } from './uiSchema';

const ICONS: Record<string, IconComponent> = {
  download: DownloadIcon,
  share: ShareIcon,
  check: CheckIcon,
  arrow: ArrowRightIcon,
  plus: PlusIcon,
  user: UserIcon,
  calendar: CalendarIcon,
  lock: LockIcon,
  mail: MailIcon,
  sparkles: SparklesIcon,
  send: SendIcon,
  trash: TrashIcon,
};

const TEXT_COLOR: Record<ElementTone, 'surface.text.gray.normal' | 'surface.text.gray.subtle' | 'surface.text.gray.muted'> = {
  normal: 'surface.text.gray.normal',
  subtle: 'surface.text.gray.subtle',
  muted: 'surface.text.gray.muted',
};

const badgeColor = (c?: FeedbackColor) => (c ?? 'neutral');

/** Render one leaf element. Unknown kinds are skipped (defensive against drift). */
const Element = ({ el }: { el: UIElement }) => {
  switch (el.kind) {
    case 'heading':
      return (
        <Heading as="h3" size={el.size ?? 'small'} weight="semibold" color="surface.text.gray.normal">
          {el.text}
        </Heading>
      );
    case 'text':
      return <Text color={TEXT_COLOR[el.tone ?? 'subtle']}>{el.text}</Text>;
    case 'amount':
      return (
        <Box display="flex" flexDirection="column" gap="spacing.1">
          {el.label ? <Text size="small" color="surface.text.gray.muted">{el.label}</Text> : null}
          <Amount value={el.value} currency={(el.currency as never) ?? ('INR' as never)} type="heading" size="large" suffix="decimals" />
        </Box>
      );
    case 'statTile':
      return (
        <Box
          flexGrow={1}
          flexBasis="0px"
          backgroundColor="surface.background.gray.subtle"
          borderRadius="medium"
          borderWidth="thin"
          borderColor="surface.border.gray.muted"
          padding="spacing.5"
          display="flex"
          flexDirection="column"
          gap="spacing.3"
        >
          <Text size="small" color="surface.text.gray.muted">{el.label}</Text>
          <Amount value={el.value} currency={(el.currency as never) ?? ('INR' as never)} type="heading" size="medium" suffix="none" />
          {el.delta ? (
            <Badge color={el.up === false ? 'negative' : 'positive'} icon={el.up === false ? TrendingDownIcon : TrendingUpIcon}>
              {el.delta}
            </Badge>
          ) : null}
        </Box>
      );
    case 'badge':
      return <Badge color={badgeColor(el.color)} emphasis="intense">{el.text}</Badge>;
    case 'button':
      return (
        <Button variant={el.variant ?? 'primary'} isFullWidth icon={el.icon ? ICONS[el.icon] : undefined} iconPosition="left">
          {el.text}
        </Button>
      );
    case 'input':
      if (el.inputType === 'password') return <PasswordInput label={el.label} placeholder={el.placeholder} />;
      if (el.inputType === 'textarea') return <TextArea label={el.label} placeholder={el.placeholder} />;
      return <TextInput label={el.label} type={el.inputType === 'email' ? 'email' : 'text'} placeholder={el.placeholder} />;
    case 'switchRow':
      return (
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="spacing.5">
          <Box display="flex" flexDirection="column" gap="spacing.0">
            <Text weight="semibold" color="surface.text.gray.normal">{el.title}</Text>
            {el.description ? <Text size="small" color="surface.text.gray.muted">{el.description}</Text> : null}
          </Box>
          <Switch defaultChecked={el.on} accessibilityLabel={el.title} />
        </Box>
      );
    case 'person':
      return (
        <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.4">
          <Avatar size="medium" name={el.name} color="primary" />
          <Box display="flex" flexDirection="column" gap="spacing.0">
            <Text weight="semibold" color="surface.text.gray.normal">{el.name}</Text>
            {el.subtitle ? <Text size="small" color="surface.text.gray.muted">{el.subtitle}</Text> : null}
          </Box>
        </Box>
      );
    case 'feature':
      return (
        <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">
          <CheckCircleIcon size="small" color="interactive.icon.positive.normal" />
          <Text size="small" color="surface.text.gray.subtle">{el.text}</Text>
        </Box>
      );
    case 'divider':
      return <Divider />;
    default:
      return null;
  }
};

const Section = ({ section }: { section: UISection }) => {
  const isGrid = section.layout === 'grid';
  const body = (
    <Box
      display="flex"
      flexDirection={isGrid ? { base: 'column', m: 'row' } : 'column'}
      gap={isGrid ? 'spacing.5' : 'spacing.4'}
    >
      {(section.elements ?? []).slice(0, 8).map((el, i) => (
        <Element key={i} el={el} />
      ))}
    </Box>
  );

  if (section.variant === 'plain') {
    return (
      <Box display="flex" flexDirection="column" gap="spacing.4">
        {section.heading ? (
          <Heading as="h2" size="medium" weight="semibold" color="surface.text.gray.normal">{section.heading}</Heading>
        ) : null}
        {body}
      </Box>
    );
  }

  return (
    <Box
      backgroundColor="surface.background.gray.intense"
      borderRadius="large"
      borderWidth="thin"
      borderColor="surface.border.gray.muted"
      elevation="lowRaised"
      padding={{ base: 'spacing.5', m: 'spacing.6' }}
      display="flex"
      flexDirection="column"
      gap="spacing.5"
    >
      {section.heading ? (
        <Heading as="h2" size="medium" weight="semibold" color="surface.text.gray.normal">{section.heading}</Heading>
      ) : null}
      {body}
    </Box>
  );
};

/** Render a full Claude-generated screen spec as real Blade components. */
export const SchemaRenderer = ({ screen }: { screen: UIScreen }) => (
  <Box width="100%" maxWidth="640px" marginX="auto" display="flex" flexDirection="column" gap="spacing.6">
    <Box display="flex" flexDirection="column" gap="spacing.2">
      <Heading as="h1" size="large" weight="semibold" color="surface.text.gray.normal">{screen.title}</Heading>
      {screen.subtitle ? <Text color="surface.text.gray.subtle">{screen.subtitle}</Text> : null}
    </Box>
    {(screen.sections ?? []).slice(0, 4).map((section, i) => (
      <Section key={i} section={section} />
    ))}
  </Box>
);
