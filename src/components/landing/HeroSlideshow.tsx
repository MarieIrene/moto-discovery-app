import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ImageSourcePropType, Platform, StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export interface HeroSlide {
  key: string;
  source: ImageSourcePropType;
  caption: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  { key: 'kigali', source: require('../../../assets/images/landing/hero-kigali.jpg'), caption: 'Motos across Kigali' },
  { key: 'driver', source: require('../../../assets/images/landing/driver-portrait.jpg'), caption: 'Licensed, verified drivers' },
  { key: 'road', source: require('../../../assets/images/landing/road-scenic.jpg'), caption: 'Hills, roads and shortcuts' },
  { key: 'night', source: require('../../../assets/images/landing/city-night.jpg'), caption: 'Day and night' },
];

/** How long each photo stays before cross-fading to the next. */
export const SLIDE_MS = 5000;
const FADE_MS = 1400;
const IMAGE_OPACITY = 0.6;
const useNativeDriver = Platform.OS !== 'web';

/**
 * Full-bleed background: the moto photos cross-fade with a slow zoom ("Ken Burns"), dimmed and
 * covered by a green gradient so white text on top stays readable.
 */
export function HeroSlideshow({ index }: { index: number }) {
  const fades = useRef(HERO_SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const zooms = useRef(HERO_SLIDES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const active = index % HERO_SLIDES.length;
    zooms[active]!.setValue(0);
    const zoom = Animated.timing(zooms[active]!, { toValue: 1, duration: SLIDE_MS + FADE_MS, easing: Easing.linear, useNativeDriver });
    const fade = Animated.parallel(
      fades.map((v, i) => Animated.timing(v, { toValue: i === active ? 1 : 0, duration: FADE_MS, easing: Easing.inOut(Easing.quad), useNativeDriver })),
    );
    zoom.start();
    fade.start();
    return () => {
      zoom.stop();
      fade.stop();
    };
  }, [index, fades, zooms]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {HERO_SLIDES.map((slide, i) => {
        // Alternate the zoom direction so consecutive photos don't move the same way.
        const scale = zooms[i]!.interpolate({ inputRange: [0, 1], outputRange: i % 2 === 0 ? [1.04, 1.16] : [1.16, 1.04] });
        const translateX = zooms[i]!.interpolate({ inputRange: [0, 1], outputRange: i % 2 === 0 ? [0, -12] : [-12, 0] });
        return (
          <Animated.Image
            key={slide.key}
            source={slide.source}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, styles.image, { opacity: Animated.multiply(fades[i]!, IMAGE_OPACITY), transform: [{ scale }, { translateX }] }]}
          />
        );
      })}
      <LinearGradient
        colors={['rgba(7,38,22,0.55)', 'rgba(7,38,22,0.15)', 'rgba(7,38,22,0.70)', 'rgba(5,28,17,0.97)']}
        locations={[0, 0.3, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.primaryPressed },
  image: { width: '100%', height: '100%' },
});
