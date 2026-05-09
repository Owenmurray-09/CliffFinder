import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle,
  type ViewToken,
} from 'react-native';

const DOT = 6;
const DOT_ACTIVE_WIDTH = 16;

export type PhotoCarouselProps = {
  photos: ReadonlyArray<string>;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  height?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function PhotoCarousel({
  photos,
  initialIndex = 0,
  onIndexChange,
  height = 280,
  testID,
  style,
}: PhotoCarouselProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(initialIndex);

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = viewableItems[0]?.index;
      if (typeof next === 'number') {
        setIndex(next);
        onIndexChange?.(next);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <View testID={testID} style={[{ height }, style]} onLayout={handleLayout}>
      {width > 0 ? (
        <FlatList
          data={photos as string[]}
          keyExtractor={(uri, i) => `${i}-${uri}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width, height: '100%' }}
              resizeMode="cover"
            />
          )}
        />
      ) : null}
      <View
        testID={testID ? `${testID}-dots` : undefined}
        style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 6,
        }}
        pointerEvents="none"
      >
        {photos.map((_, i) => {
          const active = i === index;
          return (
            <View
              key={i}
              style={{
                width: active ? DOT_ACTIVE_WIDTH : DOT,
                height: DOT,
                borderRadius: DOT / 2,
                backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
