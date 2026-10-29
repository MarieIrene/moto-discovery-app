import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HERO_SLIDES, HeroSlideshow, SLIDE_MS } from '@/components/landing/HeroSlideshow';
import { AppText, Button, Icon, IconName } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const useNativeDriver = Platform.OS !== 'web';
const GLASS = 'rgba(255,255,255,0.12)';
const GLASS_BORDER = 'rgba(255,255,255,0.22)';
const LIVE_GREEN = '#3DDC84';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'map', title: 'Live map', body: 'See where drivers are' },
  { icon: 'shield-checkmark', title: 'Verified', body: 'ID, permit and selfie' },
  { icon: 'call', title: 'Call direct', body: 'No middleman' },
];

/** Fades and lifts its children into place, `order` steps after the screen appears. */
function Reveal({ order, children, style }: { order: number; children: React.ReactNode; style?: object }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 700, delay: 150 + order * 140, easing: Easing.out(Easing.cubic), useNativeDriver }).start();
  }, [t, order]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  return <Animated.View style={[style, { opacity: t, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

function LiveDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={styles.liveDotWrap}>
      <Animated.View
        style={[
          styles.liveHalo,
          { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }] },
        ]}
      />
      <View style={styles.liveDot} />
    </View>
  );
}

/** A moto icon riding along a dashed route between a pickup pin and a destination flag. */
function RideRoute() {
  const [width, setWidth] = useState(0);
  const ride = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ride, { toValue: 1, duration: 3800, easing: Easing.inOut(Easing.cubic), useNativeDriver }),
        Animated.delay(500),
        Animated.timing(ride, { toValue: 0, duration: 0, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ride]);
  const travel = Math.max(0, width - 64);
  const translateX = ride.interpolate({ inputRange: [0, 1], outputRange: [0, travel] });
  const bob = ride.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -3, 0, -3, 0] });

  return (
    <View style={styles.route} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.routeLine} />
      <View style={[styles.routeEnd, styles.routeStart]}><Icon name="location" size={16} color="onPrimary" /></View>
      <View style={[styles.routeEnd, styles.routeFinish]}><Icon name="flag" size={14} color="primary" /></View>
      {width > 0 ? (
        <Animated.View style={[styles.rider, { transform: [{ translateX }, { translateY: bob }] }]}>
          <Icon name="bicycle" size={20} color="primary" />
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function Welcome() {
  const [slide, setSlide] = useState(0);

  // Light status bar over the dark photos; the rest of the app uses dark on white.
  useFocusEffect(useCallback(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, []));

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_SLIDES[slide]!;

  return (
    <View style={styles.root} testID="landing">
      <HeroSlideshow index={slide} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
          <Reveal order={0} style={styles.topBar}>
            <View style={styles.brand}>
              <View style={styles.logo}><Icon name="bicycle" size={20} color="primary" /></View>
              <AppText variant="heading" color="onPrimary">Moto Discovery</AppText>
            </View>
            <View style={styles.cityPill}>
              <Icon name="location" size={12} color="onPrimary" />
              <AppText variant="small" color="onPrimary">All of Rwanda</AppText>
            </View>
          </Reveal>

          <View style={styles.hero}>
            <Reveal order={1} style={styles.livePill}>
              <LiveDot />
              <AppText variant="small" color="onPrimary">Drivers near you, live on the map</AppText>
            </Reveal>

            <Reveal order={2}>
              <AppText variant="display" color="onPrimary" style={styles.headline}>
                Your moto,{'\n'}<AppText variant="body" style={[styles.headline, styles.headlineAccent]}>one tap away.</AppText>
              </AppText>
            </Reveal>

            <Reveal order={3}>
              <AppText color="onPrimary" style={styles.tagline}>
                Find an available motorcycle taxi nearby, check that the driver is verified, and call them directly.
              </AppText>
            </Reveal>

            <Reveal order={4}>
              <RideRoute />
            </Reveal>

            <Reveal order={5} style={styles.features}>
              {FEATURES.map((f) => (
                <View key={f.title} style={styles.feature} accessible accessibilityLabel={`${f.title}. ${f.body}`}>
                  <View style={styles.featureIcon}><Icon name={f.icon} size={18} color="onPrimary" /></View>
                  <AppText variant="label" color="onPrimary">{f.title}</AppText>
                  <AppText variant="small" color="onPrimaryMuted">{f.body}</AppText>
                </View>
              ))}
            </Reveal>
          </View>

          <Reveal order={6} style={styles.actions}>
            <View style={styles.slideRow} accessible accessibilityLabel={`Photo ${slide + 1} of ${HERO_SLIDES.length}: ${current.caption}`}>
              <View style={styles.dots}>
                {HERO_SLIDES.map((s, i) => (
                  <Pressable key={s.key} onPress={() => setSlide(i)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Show photo ${i + 1}`}>
                    <View style={[styles.dot, i === slide && styles.dotActive]} />
                  </Pressable>
                ))}
              </View>
              <AppText variant="small" color="onPrimaryMuted">{current.caption}</AppText>
            </View>

            <Button
              label="Get started"
              icon="arrow-forward"
              variant="inverse"
              size="lg"
              fullWidth
              onPress={() => router.push('/sign-in')}
              testID="welcome-get-started"
            />
            <Pressable onPress={() => router.push('/admin-sign-in')} accessibilityRole="link" style={styles.adminLink} hitSlop={8}>
              <Icon name="shield-half" size={14} color="onPrimaryMuted" />
              <AppText variant="small" color="onPrimaryMuted">Admin demo access</AppText>
            </Pressable>
          </Reveal>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05200F', overflow: 'hidden' },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, width: '100%', maxWidth: 560, alignSelf: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  cityPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill, backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER,
  },

  hero: { flex: 1, justifyContent: 'flex-end', gap: spacing.lg, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER,
  },
  liveDotWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LIVE_GREEN },
  liveHalo: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: LIVE_GREEN },

  headline: { fontSize: 44, lineHeight: 50, letterSpacing: -1.2, fontWeight: '800' },
  headlineAccent: { color: LIVE_GREEN },
  tagline: { fontSize: 17, lineHeight: 25, opacity: 0.92, maxWidth: 420 },

  route: { height: 40, justifyContent: 'center', marginVertical: spacing.xs },
  routeLine: { position: 'absolute', left: 16, right: 16, top: 19, borderTopWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.5)' },
  routeEnd: { position: 'absolute', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', top: 6 },
  routeStart: { left: 2, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background },
  routeFinish: { right: 2, backgroundColor: colors.background },
  rider: {
    position: 'absolute', left: 16, top: 2, width: 36, height: 36, borderRadius: 18, backgroundColor: LIVE_GREEN,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background,
  },

  features: { flexDirection: 'row', gap: spacing.sm },
  feature: { flex: 1, gap: 2, padding: spacing.md, borderRadius: radius.lg, backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER },
  featureIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(61,220,132,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },

  actions: { gap: spacing.md },
  slideRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 24, backgroundColor: colors.background },
  adminLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, minHeight: 40 },
});
