import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
  };
});

// Icon fonts load through the asset system, which isn't available in Jest. Render the icon name instead.
jest.mock('@expo/vector-icons', () => {
  const { Text } = jest.requireActual('react-native');
  const Ionicons = ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>;
  return { Ionicons };
});
