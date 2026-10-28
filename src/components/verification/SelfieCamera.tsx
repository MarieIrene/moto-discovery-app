import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Linking, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Icon } from '@/components/ui';
import { colors, spacing } from '@/theme';

const OVAL_W = 240;
const OVAL_H = 310;

export interface SelfieCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

/**
 * Full-screen front camera for the registration selfie. There is deliberately no "choose from
 * gallery" option: the photo must be taken now, by the person registering.
 */
export function SelfieCamera({ visible, onClose, onCapture }: SelfieCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setPreview(null);
      setReady(false);
      return;
    }
    if (permission && !permission.granted && permission.canAskAgain) void requestPermission();
  }, [visible, permission, requestPermission]);

  useEffect(() => {
    if (!visible || preview) return;
    const loop = Animated.loop(Animated.timing(scan, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [visible, preview, scan]);

  const capture = async () => {
    if (!camera.current || busy) return;
    setBusy(true);
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.6 });
      if (photo?.uri) setPreview(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const granted = !!permission?.granted;
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [12, OVAL_H - 12] });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={styles.root}>
        {granted && !preview ? (
          <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="front" mirror onCameraReady={() => setReady(true)} />
        ) : null}
        {preview ? <Image source={{ uri: preview }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}

        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
          <View style={styles.top}>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close camera" hitSlop={10} style={styles.close}>
              <Icon name="close" size={26} color="onPrimary" />
            </Pressable>
            <AppText variant="heading" color="onPrimary">{preview ? 'Check your selfie' : 'Take a live selfie'}</AppText>
            <View style={styles.close} />
          </View>

          {granted ? (
            <View style={styles.guideWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View style={[styles.oval, preview && styles.ovalDone]}>
                {!preview ? <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} /> : null}
              </View>
              <AppText color="onPrimary" align="center" style={styles.hint}>
                {preview ? 'Is your whole face clear and well lit?' : 'Fit your face inside the oval. Remove sunglasses, hats and helmets.'}
              </AppText>
            </View>
          ) : (
            <View style={styles.guideWrap}>
              <Icon name="camera-reverse" size={48} color="onPrimary" />
              <AppText color="onPrimary" align="center" style={styles.hint}>
                {permission?.canAskAgain === false
                  ? 'Camera access is off. Turn it on in Settings to take your selfie.'
                  : 'Allow camera access to take your selfie.'}
              </AppText>
              <Button
                label={permission?.canAskAgain === false ? 'Open Settings' : 'Allow camera'}
                variant="inverse"
                onPress={() => (permission?.canAskAgain === false ? Linking.openSettings() : requestPermission())}
              />
            </View>
          )}

          <View style={styles.bottom}>
            {preview ? (
              <View style={styles.row}>
                <Button label="Retake" icon="refresh" variant="secondary" style={styles.flex} onPress={() => setPreview(null)} />
                <Button label="Use this photo" icon="checkmark" variant="inverse" style={styles.flex} onPress={() => onCapture(preview)} testID="selfie-use" />
              </View>
            ) : granted ? (
              <Pressable
                onPress={capture}
                disabled={!ready || busy}
                accessibilityRole="button"
                accessibilityLabel="Take selfie"
                style={({ pressed }) => [styles.shutter, (pressed || busy) && styles.shutterPressed, !ready && styles.shutterDisabled]}
                testID="selfie-shutter"
              >
                <View style={styles.shutterInner} />
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.35)' },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  guideWrap: { alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
  oval: {
    width: OVAL_W, height: OVAL_H, borderRadius: OVAL_W / 2, borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)',
    borderStyle: 'dashed', overflow: 'hidden',
  },
  ovalDone: { borderStyle: 'solid', borderColor: '#3DDC84' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#3DDC84', opacity: 0.85 },
  hint: { maxWidth: 300, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  bottom: { alignItems: 'center', padding: spacing.xl, backgroundColor: 'rgba(0,0,0,0.35)' },
  row: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch' },
  flex: { flex: 1 },
  shutter: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.background },
  shutterPressed: { transform: [{ scale: 0.92 }] },
  shutterDisabled: { opacity: 0.4 },
});
