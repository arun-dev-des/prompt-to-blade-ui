import {
  Box,
  Text,
  Heading,
  Button,
  Link,
  Divider,
  FileTextIcon,
  ExternalLinkIcon,
  EyeIcon,
  UsersIcon,
  PlayIcon,
} from '@razorpay/blade/components';
import type { IconComponent } from '@razorpay/blade/components';
import styled from 'styled-components';
import type { ReactNode } from 'react';
import { track } from '../analytics';
import { BLOG } from '../links';
import { STATS } from '../stats';

const fmt = (n: number) => n.toLocaleString('en-IN');

const STAT_ICONS: Record<(typeof STATS)[number]['label'], IconComponent> = {
  Impressions: EyeIcon,
  'Members reached': UsersIcon,
  'Tried it live': PlayIcon,
};

/**
 * Make a whole card open the article. The CTA stays a real link (keyboard and
 * screen-reader path); this is the mouse shortcut, so clicks that land on any
 * link/button inside are left to that element rather than opening twice.
 */
const openArticle = (placement: string) => (e: { target: EventTarget }) => {
  if ((e.target as HTMLElement).closest('a')) return;
  track('blog_link_clicked', { placement });
  window.open(BLOG.url, '_blank', 'noopener,noreferrer');
};

// Box has no cursor prop; this is the one place the click-through affordance lives.
const ClickArea = styled.div`
  cursor: pointer;
`;

const ArticleClickArea = ({ placement, children }: { placement: string; children: ReactNode }) => (
  <ClickArea onClick={openArticle(placement)}>{children}</ClickArea>
);

const Byline = ({ suffix }: { suffix?: string }) => (
  <Text size="small" color="surface.text.gray.muted">
    By{' '}
    <Link
      variant="anchor"
      size="small"
      href={BLOG.portfolio}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('portfolio_link_clicked', { placement: 'blog_card' })}
    >
      {BLOG.author}
    </Link>
    {suffix ? ` · ${suffix}` : null}
  </Text>
);

const ReadButton = ({ placement, size }: { placement: string; size: 'small' | 'medium' }) => (
  <Button
    variant="secondary"
    size={size}
    icon={ExternalLinkIcon}
    iconPosition="right"
    isFullWidth
    href={BLOG.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => track('blog_link_clicked', { placement })}
  >
    Read on LinkedIn
  </Button>
);

/** Reach numbers line by line in a card — sits under the write-up card in the right rail. */
export const StatsCard = () => (
  <Box
    backgroundColor="surface.background.gray.intense"
    borderRadius="large"
    borderWidth="thin"
    borderColor="surface.border.gray.muted"
    elevation="lowRaised"
    padding="spacing.5"
    display="flex"
    flexDirection="column"
    gap="spacing.4"
  >
    {STATS.map((stat, i) => {
      const Icon = STAT_ICONS[stat.label];
      return (
        <Box key={stat.label} display="flex" flexDirection="column" gap="spacing.4">
          {i > 0 ? <Divider /> : null}
          <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.4">
            <Icon size="large" color="surface.icon.primary.normal" />
            <Box flex={1} minWidth="spacing.0">
              <Text color="surface.text.gray.subtle">{stat.label}</Text>
            </Box>
            <Heading size="medium" weight="semibold" color="surface.text.gray.normal">{fmt(stat.value)}</Heading>
          </Box>
        </Box>
      );
    })}
  </Box>
);

/** Same numbers as one connected strip — for screens too narrow for the nav bar. */
export const StatsStrip = () => (
  <Box
    display="flex"
    flexDirection="row"
    backgroundColor="surface.background.gray.intense"
    borderRadius="large"
    borderWidth="thin"
    borderColor="surface.border.gray.muted"
  >
    {STATS.map((stat, i) => {
      const Icon = STAT_ICONS[stat.label];
      return (
        <Box
          key={stat.label}
          flex={1}
          minWidth="spacing.0"
          display="flex"
          flexDirection="column"
          gap="spacing.2"
          paddingX={{ base: 'spacing.4', m: 'spacing.6' }}
          paddingY="spacing.4"
          borderLeftWidth={i === 0 ? 'none' : 'thin'}
          borderLeftColor="surface.border.gray.muted"
        >
          <Icon size="medium" color="surface.icon.primary.normal" />
          <Box display="flex" flexDirection="column" gap="spacing.1">
            <Heading size="medium" weight="semibold" color="surface.text.gray.normal">{fmt(stat.value)}</Heading>
            <Text size="small" color="surface.text.gray.muted">{stat.label}</Text>
          </Box>
        </Box>
      );
    })}
  </Box>
);

/** Cover image, title, author and CTA — for the right rail on wide screens. */
export const BlogCard = () => (
  <ArticleClickArea placement="blog_card_body">
  <Box
    backgroundColor="surface.background.gray.intense"
    borderRadius="large"
    borderWidth="thin"
    borderColor="surface.border.gray.muted"
    elevation="lowRaised"
    overflow="hidden"
    display="flex"
    flexDirection="column"
  >
    <img src={BLOG.cover} alt="Prompt to Blade UI — walkthrough cover" style={{ width: '100%', display: 'block' }} />
    <Box padding="spacing.5" display="flex" flexDirection="column" gap="spacing.4">
      <Box display="flex" flexDirection="column" gap="spacing.2">
        <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.2">
          <FileTextIcon size="small" color="surface.icon.gray.muted" />
          <Text size="small" color="surface.text.gray.muted">Article on LinkedIn</Text>
        </Box>
        <Text weight="semibold" color="surface.text.gray.normal">{BLOG.title}</Text>
        <Byline />
      </Box>
      <ReadButton placement="blog_card" size="medium" />
    </Box>
  </Box>
  </ArticleClickArea>
);

/** Compact version for narrow screens: icon, title, author, CTA in one strip. */
export const BlogBanner = () => (
  <ArticleClickArea placement="blog_banner_body">
  <Box
    backgroundColor="surface.background.primary.subtle"
    borderRadius="large"
    borderWidth="thin"
    borderColor="surface.border.primary.muted"
    paddingX={{ base: 'spacing.5', m: 'spacing.6' }}
    paddingY="spacing.4"
    display="flex"
    flexDirection={{ base: 'column', m: 'row' }}
    alignItems={{ base: 'stretch', m: 'center' }}
    justifyContent="space-between"
    gap={{ base: 'spacing.4', m: 'spacing.6' }}
  >
    <Box display="flex" flexDirection="row" alignItems="center" gap="spacing.4" flex={1} minWidth="spacing.0">
      <Box flexShrink={0} display="flex">
        <FileTextIcon size="large" color="surface.icon.primary.normal" />
      </Box>
      <Box display="flex" flexDirection="column" gap="spacing.1" minWidth="spacing.0">
        <Text weight="semibold" color="surface.text.gray.normal">{BLOG.title}</Text>
        <Byline suffix="LinkedIn article" />
      </Box>
    </Box>
    <Box flexShrink={0}>
      <ReadButton placement="blog_banner" size="small" />
    </Box>
  </Box>
  </ArticleClickArea>
);
