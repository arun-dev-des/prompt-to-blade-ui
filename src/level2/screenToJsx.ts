/**
 * Serialize a Claude-generated UIScreen spec into copy-pasteable Blade JSX —
 * the inverse of SchemaRenderer. Because the render path is deterministic, the
 * emitted code is a faithful, on-system snapshot: the exact Blade components +
 * tokens that produced the live preview, with no raw hex or magic pixels.
 */
import type { UIScreen, UISection, UIElement, ElementTone } from './uiSchema';

const TEXT_COLOR: Record<ElementTone, string> = {
  normal: 'surface.text.gray.normal',
  subtle: 'surface.text.gray.subtle',
  muted: 'surface.text.gray.muted',
};

/** Button-icon name (from the schema enum) → Blade icon component identifier. */
const ICON_IDENT: Record<string, string> = {
  download: 'DownloadIcon',
  share: 'ShareIcon',
  check: 'CheckIcon',
  arrow: 'ArrowRightIcon',
  plus: 'PlusIcon',
  user: 'UserIcon',
  calendar: 'CalendarIcon',
  lock: 'LockIcon',
  mail: 'MailIcon',
  sparkles: 'SparklesIcon',
  send: 'SendIcon',
  trash: 'TrashIcon',
};

// A line is [indentLevel, text]; rendered with two spaces per level at the end.
type Line = [number, string];

/** JSX child text as a safe expression — handles quotes, braces, angle brackets. */
const child = (s: string) => `{${JSON.stringify(s)}}`;
/** Free-text string attribute as a safe expression: label={"…"}. */
const sattr = (name: string, s: string) => `${name}={${JSON.stringify(s)}}`;

const elementLines = (el: UIElement, indent: number, used: Set<string>): Line[] => {
  const u = (...names: string[]) => names.forEach((n) => used.add(n));
  switch (el.kind) {
    case 'heading':
      u('Heading');
      return [[indent, `<Heading as="h3" size="${el.size ?? 'small'}" weight="semibold" color="surface.text.gray.normal">${child(el.text)}</Heading>`]];
    case 'text':
      u('Text');
      return [[indent, `<Text color="${TEXT_COLOR[el.tone ?? 'subtle']}">${child(el.text)}</Text>`]];
    case 'amount': {
      u('Box', 'Amount');
      const lines: Line[] = [[indent, `<Box display="flex" flexDirection="column" gap="spacing.1">`]];
      if (el.label) {
        u('Text');
        lines.push([indent + 1, `<Text size="small" color="surface.text.gray.muted">${child(el.label)}</Text>`]);
      }
      lines.push([indent + 1, `<Amount value={${el.value}} currency="${el.currency ?? 'INR'}" type="heading" size="large" suffix="decimals" />`]);
      lines.push([indent, `</Box>`]);
      return lines;
    }
    case 'statTile': {
      u('Box', 'Text', 'Amount');
      const lines: Line[] = [
        [indent, `<Box flexGrow={1} flexBasis="0px" backgroundColor="surface.background.gray.subtle" borderRadius="medium" borderWidth="thin" borderColor="surface.border.gray.muted" padding="spacing.5" display="flex" flexDirection="column" gap="spacing.3">`],
        [indent + 1, `<Text size="small" color="surface.text.gray.muted">${child(el.label)}</Text>`],
        [indent + 1, `<Amount value={${el.value}} currency="${el.currency ?? 'INR'}" type="heading" size="medium" suffix="none" />`],
      ];
      if (el.delta) {
        const down = el.up === false;
        u('Badge', down ? 'TrendingDownIcon' : 'TrendingUpIcon');
        lines.push([indent + 1, `<Badge color="${down ? 'negative' : 'positive'}" icon={${down ? 'TrendingDownIcon' : 'TrendingUpIcon'}}>${child(el.delta)}</Badge>`]);
      }
      lines.push([indent, `</Box>`]);
      return lines;
    }
    case 'badge':
      u('Badge');
      return [[indent, `<Badge color="${el.color ?? 'neutral'}" emphasis="intense">${child(el.text)}</Badge>`]];
    case 'button': {
      u('Button');
      const ident = el.icon ? ICON_IDENT[el.icon] : undefined;
      const iconAttr = ident ? ` icon={${(used.add(ident), ident)}} iconPosition="left"` : '';
      return [[indent, `<Button variant="${el.variant ?? 'primary'}" isFullWidth${iconAttr}>${child(el.text)}</Button>`]];
    }
    case 'input': {
      const ph = el.placeholder ? ` ${sattr('placeholder', el.placeholder)}` : '';
      if (el.inputType === 'password') {
        u('PasswordInput');
        return [[indent, `<PasswordInput ${sattr('label', el.label)}${ph} />`]];
      }
      if (el.inputType === 'textarea') {
        u('TextArea');
        return [[indent, `<TextArea ${sattr('label', el.label)}${ph} />`]];
      }
      u('TextInput');
      return [[indent, `<TextInput ${sattr('label', el.label)} type="${el.inputType === 'email' ? 'email' : 'text'}"${ph} />`]];
    }
    case 'switchRow': {
      u('Box', 'Text', 'Switch');
      const lines: Line[] = [
        [indent, `<Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="spacing.5">`],
        [indent + 1, `<Box display="flex" flexDirection="column" gap="spacing.0">`],
        [indent + 2, `<Text weight="semibold" color="surface.text.gray.normal">${child(el.title)}</Text>`],
      ];
      if (el.description) lines.push([indent + 2, `<Text size="small" color="surface.text.gray.muted">${child(el.description)}</Text>`]);
      lines.push([indent + 1, `</Box>`]);
      const checked = el.on !== undefined ? ` defaultChecked={${el.on}}` : '';
      lines.push([indent + 1, `<Switch${checked} ${sattr('accessibilityLabel', el.title)} />`]);
      lines.push([indent, `</Box>`]);
      return lines;
    }
    case 'person': {
      u('Box', 'Avatar', 'Text');
      const lines: Line[] = [
        [indent, `<Box display="flex" flexDirection="row" alignItems="center" gap="spacing.4">`],
        [indent + 1, `<Avatar size="medium" ${sattr('name', el.name)} color="primary" />`],
        [indent + 1, `<Box display="flex" flexDirection="column" gap="spacing.0">`],
        [indent + 2, `<Text weight="semibold" color="surface.text.gray.normal">${child(el.name)}</Text>`],
      ];
      if (el.subtitle) lines.push([indent + 2, `<Text size="small" color="surface.text.gray.muted">${child(el.subtitle)}</Text>`]);
      lines.push([indent + 1, `</Box>`]);
      lines.push([indent, `</Box>`]);
      return lines;
    }
    case 'feature':
      u('Box', 'CheckCircleIcon', 'Text');
      return [
        [indent, `<Box display="flex" flexDirection="row" alignItems="center" gap="spacing.3">`],
        [indent + 1, `<CheckCircleIcon size="small" color="interactive.icon.positive.normal" />`],
        [indent + 1, `<Text size="small" color="surface.text.gray.subtle">${child(el.text)}</Text>`],
        [indent, `</Box>`],
      ];
    case 'divider':
      used.add('Divider');
      return [[indent, `<Divider />`]];
    default:
      return [];
  }
};

const sectionLines = (section: UISection, indent: number, used: Set<string>): Line[] => {
  used.add('Box');
  const isGrid = section.layout === 'grid';
  const elements = (section.elements ?? []).slice(0, 8);
  const bodyDir = isGrid ? `flexDirection={{ base: 'column', m: 'row' }}` : `flexDirection="column"`;
  const bodyGap = isGrid ? 'spacing.5' : 'spacing.4';

  // For a plain section the body Box sits at `indent`; for a card it nests one deeper.
  const emitBody = (at: number): Line[] => [
    [at, `<Box display="flex" ${bodyDir} gap="${bodyGap}">`],
    ...elements.flatMap((el) => elementLines(el, at + 1, used)),
    [at, `</Box>`],
  ];

  if (section.variant === 'plain') {
    const lines: Line[] = [[indent, `<Box display="flex" flexDirection="column" gap="spacing.4">`]];
    if (section.heading) {
      used.add('Heading');
      lines.push([indent + 1, `<Heading as="h2" size="medium" weight="semibold" color="surface.text.gray.normal">${child(section.heading)}</Heading>`]);
    }
    lines.push(...emitBody(indent + 1));
    lines.push([indent, `</Box>`]);
    return lines;
  }

  const lines: Line[] = [[indent, `<Box backgroundColor="surface.background.gray.intense" borderRadius="large" borderWidth="thin" borderColor="surface.border.gray.muted" elevation="lowRaised" padding={{ base: 'spacing.5', m: 'spacing.6' }} display="flex" flexDirection="column" gap="spacing.5">`]];
  if (section.heading) {
    used.add('Heading');
    lines.push([indent + 1, `<Heading as="h2" size="medium" weight="semibold" color="surface.text.gray.normal">${child(section.heading)}</Heading>`]);
  }
  lines.push(...emitBody(indent + 1));
  lines.push([indent, `</Box>`]);
  return lines;
};

/** Turn a UIScreen spec into a self-contained Blade JSX component string. */
export const screenToJsx = (screen: UIScreen): string => {
  const used = new Set<string>(['Box', 'Heading']);
  const body: Line[] = [
    [2, `<Box width="100%" maxWidth="640px" marginX="auto" display="flex" flexDirection="column" gap="spacing.6">`],
    [3, `<Box display="flex" flexDirection="column" gap="spacing.2">`],
    [4, `<Heading as="h1" size="large" weight="semibold" color="surface.text.gray.normal">${child(screen.title)}</Heading>`],
  ];
  if (screen.subtitle) {
    used.add('Text');
    body.push([4, `<Text color="surface.text.gray.subtle">${child(screen.subtitle)}</Text>`]);
  }
  body.push([3, `</Box>`]);
  for (const section of (screen.sections ?? []).slice(0, 4)) {
    body.push(...sectionLines(section, 3, used));
  }
  body.push([2, `</Box>`]);

  const imports = [...used].sort().join(', ');
  const render = body.map(([level, text]) => `${'  '.repeat(level)}${text}`).join('\n');

  return [
    `import { ${imports} } from '@razorpay/blade/components';`,
    ``,
    `export const GeneratedScreen = () => (`,
    render,
    `);`,
    ``,
  ].join('\n');
};
