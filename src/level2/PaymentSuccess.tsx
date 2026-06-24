import {
  Box,
  Text,
  Heading,
  Amount,
  Avatar,
  Badge,
  Button,
  IconButton,
  Divider,
  InfoGroup,
  InfoItem,
  InfoItemKey,
  InfoItemValue,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ShareIcon,
  ShieldIcon,
  useToast,
} from '@razorpay/blade/components';
import { Reveal } from '../components/Reveal';

/**
 * LEVEL 2 dry-run — "Payment Successful" confirmation screen.
 *
 * A self-contained Blade build that exercises the full system: Amount (fintech
 * type), InfoGroup key/value rows, Avatar, Badge, real button states + toast
 * feedback, semantic tokens throughout, responsive, and theme-agnostic (survives
 * the dark-mode toggle in the header).
 */
const transaction = {
  amount: 1499,
  currency: 'INR' as const,
  payee: { name: 'Blue Bottle Coffee', handle: 'bluebottle@hdfc' },
  id: 'pay_Nf3kQ9Lm2Xy8Zb',
  method: 'UPI · Google Pay',
  timestamp: '24 Jun 2026, 7:42 PM',
};

export const PaymentSuccess = () => {
  const toast = useToast();

  const copyId = async () => {
    try {
      await navigator.clipboard?.writeText(transaction.id);
      toast.show({ content: 'Transaction ID copied', color: 'positive' });
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      paddingX={{ base: 'spacing.5', m: 'spacing.7' }}
      paddingY={{ base: 'spacing.8', m: 'spacing.10' }}
    >
      <Reveal>
        <Box
          width="100%"
          maxWidth="440px"
          backgroundColor="surface.background.gray.intense"
          borderRadius="large"
          borderWidth="thin"
          borderColor="surface.border.gray.muted"
          elevation="midRaised"
          padding={{ base: 'spacing.6', m: 'spacing.7' }}
          display="flex"
          flexDirection="column"
          gap="spacing.6"
        >
          {/* Success crest */}
          <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.4">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="64px"
              height="64px"
              borderRadius="round"
              backgroundColor="feedback.background.positive.subtle"
            >
              <CheckIcon size="2xlarge" color="interactive.icon.positive.normal" />
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center" gap="spacing.2">
              <Heading as="h1" size="large" weight="semibold" color="surface.text.gray.normal">
                Payment successful
              </Heading>
              <Text size="small" color="surface.text.gray.muted">
                {transaction.timestamp}
              </Text>
            </Box>
            <Amount
              value={transaction.amount}
              currency={transaction.currency}
              type="display"
              size="xlarge"
              suffix="decimals"
            />
            <Badge color="positive" emphasis="subtle">
              Completed
            </Badge>
          </Box>

          {/* Payee */}
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="spacing.4"
            backgroundColor="surface.background.gray.subtle"
            borderRadius="medium"
            padding="spacing.4"
          >
            <Avatar size="medium" name={transaction.payee.name} color="primary" />
            <Box display="flex" flexDirection="column" gap="spacing.0">
              <Text size="small" color="surface.text.gray.muted">
                Paid to
              </Text>
              <Text weight="semibold" color="surface.text.gray.normal">
                {transaction.payee.name}
              </Text>
              <Text size="small" color="surface.text.gray.subtle">
                {transaction.payee.handle}
              </Text>
            </Box>
          </Box>

          {/* Details */}
          <InfoGroup itemOrientation="horizontal" size="medium" valueAlign="right">
            <InfoItem>
              <InfoItemKey>Transaction ID</InfoItemKey>
              <InfoItemValue
                trailing={
                  <IconButton
                    icon={CopyIcon}
                    size="small"
                    accessibilityLabel="Copy transaction ID"
                    onClick={copyId}
                  />
                }
              >
                {transaction.id}
              </InfoItemValue>
            </InfoItem>
            <InfoItem>
              <InfoItemKey>Payment method</InfoItemKey>
              <InfoItemValue>{transaction.method}</InfoItemValue>
            </InfoItem>
            <InfoItem>
              <InfoItemKey>Date &amp; time</InfoItemKey>
              <InfoItemValue>{transaction.timestamp}</InfoItemValue>
            </InfoItem>
          </InfoGroup>

          <Divider />

          {/* Actions — one obvious primary */}
          <Box display="flex" flexDirection="column" gap="spacing.3">
            <Button
              isFullWidth
              icon={DownloadIcon}
              iconPosition="left"
              onClick={() =>
                toast.show({ content: 'Receipt downloaded', color: 'positive' })
              }
            >
              Download receipt
            </Button>
            <Button
              isFullWidth
              variant="tertiary"
              icon={ShareIcon}
              iconPosition="left"
              onClick={() => toast.show({ content: 'Share link ready', color: 'information' })}
            >
              Share receipt
            </Button>
          </Box>

          {/* Trust footer */}
          <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" gap="spacing.2">
            <ShieldIcon size="small" color="surface.icon.gray.muted" />
            <Text size="xsmall" color="surface.text.gray.muted">
              Secured by Razorpay
            </Text>
          </Box>
        </Box>
      </Reveal>
    </Box>
  );
};
