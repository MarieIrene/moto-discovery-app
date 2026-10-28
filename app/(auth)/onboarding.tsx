import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewInstance, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText, Button, Icon, Screen } from '@/components/ui';
import { ONBOARDING_SLIDES } from '@/data/mock';
import { useSession } from '@/state/SessionProvider';
import { colors, spacing } from '@/theme';

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 640);
  const [index, setIndex] = useState(0);
  const scroller = useRef<ScrollViewInstance>(null);
  const { completeOnboarding } = useSession();
  const last = index === ONBOARDING_SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace('/register');
  };

  const next = () => {
    if (last) return finish();
    scroller.current?.scrollTo({ x: (index + 1) * pageWidth, animated: true });
    setIndex(index + 1);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / pageWidth));

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        <Button label="Skip" variant="ghost" onPress={finish} />
      </View>
      <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll} style={styles.pager}>
        {ONBOARDING_SLIDES.map((slide, i) => (
          <View key={slide.key} style={[styles.page, { width: pageWidth }]} accessibilityLabel={`Step ${i + 1} of ${ONBOARDING_SLIDES.length}`}>
            <View style={styles.badge}>
              <Icon name={slide.icon} size={44} color="onPrimary" />
            </View>
            <AppText variant="title" align="center">{slide.title}</AppText>
            <AppText color="textMuted" align="center" style={styles.body}>{slide.body}</AppText>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Page ${index + 1} of ${ONBOARDING_SLIDES.length}`} accessible>
          {ONBOARDING_SLIDES.map((s, i) => <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />)}
        </View>
        <Button label={last ? 'Create an account' : 'Next'} size="lg" fullWidth onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  skipRow: { alignItems: 'flex-end', paddingHorizontal: spacing.md },
  pager: { flex: 1 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.md },
  badge: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  body: { maxWidth: 340 },
  footer: { padding: spacing.xl, gap: spacing.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 24, backgroundColor: colors.primary },
});
