import { AndroidConfig, withGradleProperties } from 'expo/config-plugins';

const isWindows = process.platform === 'win32';

// expo-camera bundles ML Kit's document scanner (and its barcode engine) unless this is off; the app never uses it.
const withoutDocumentScanner = (config) =>
  withGradleProperties(config, (config) => {
    config.modResults = AndroidConfig.BuildProperties.updateAndroidBuildProperty(
      config.modResults,
      'expo.camera.document-scanner-enabled',
      'false',
    );
    return config;
  });

export default ({ config }) =>
  withoutDocumentScanner({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      [
        'expo-build-properties',
        {
          android: {
            // Real Android phones are ARM; x86 builds only serve emulators and nearly double the APK size.
            buildArchs: ['armeabi-v7a', 'arm64-v8a'],
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            ...(isWindows ? { cmakeVersion: '3.31.6' } : {}),
          },
        },
      ],
    ],
  });
