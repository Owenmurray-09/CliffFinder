import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatBox } from '@/components/StatBox';
import { getSpotById } from '@/data/spots';
import { useTheme } from '@/theme/useTheme';

const HERO_HEIGHT = 280;
type Tab = 'photos' | 'reviews' | 'map';

export default function SpotDetailsScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const spot = getSpotById(params.id);
  const [saved, setSaved] = useState(spot?.category === 'saved');
  const [tab, setTab] = useState<Tab>('photos');

  if (!spot) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.palette.paper }}>
        <EmptyState title="Spot not found" message="That spot doesn't exist or was removed." />
      </View>
    );
  }

  const ctaBottom = Math.max(insets.bottom, 16) + 16;

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 + ctaBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: HERO_HEIGHT }}>
          <PhotoCarousel photos={spot.photos} height={HERO_HEIGHT} />
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          <View style={{ gap: 4 }}>
            <Text style={[t.typography.display, { color: t.palette.ink }]}>{spot.name}</Text>
            <Text style={[t.typography.body, { color: t.palette.ink3 }]}>{spot.area}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Star size={16} color={t.palette.star.readonly} fill={t.palette.star.readonly} />
              <Text
                style={{
                  fontFamily: 'Poppins_700Bold',
                  fontSize: 15,
                  color: t.palette.ink,
                }}
              >
                {spot.rating.toFixed(1)}
              </Text>
              <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
                ({spot.reviewCount})
              </Text>
              <Text
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12,
                  color: t.palette.ink3,
                  textTransform: 'capitalize',
                }}
              >
                {spot.difficulty}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatBox value={`${spot.height_m}m`} label="Height" />
            <StatBox value={`${spot.depth_m}m`} label="Depth" />
            <StatBox value={spot.waterType} label="Water" />
          </View>

          <Text style={[t.typography.body, { color: t.palette.ink2, lineHeight: 21 }]}>
            {spot.description}
          </Text>

          <View style={{ marginTop: 8, alignItems: 'flex-start' }}>
            <SegmentedControl
              options={[
                { label: 'Photos', value: 'photos' },
                { label: 'Reviews', value: 'reviews' },
                { label: 'Map', value: 'map' },
              ]}
              value={tab}
              onValueChange={(v) => setTab(v as Tab)}
            />
          </View>

          {tab === 'photos' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {spot.photos.map((p, i) => (
                <Image
                  key={i}
                  source={{ uri: p }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: t.radius.cardSm,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
          ) : null}

          {tab === 'reviews' ? (
            <Card>
              <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
                Reviews aren't wired up yet. {spot.reviewCount} reviews on file.
              </Text>
            </Card>
          ) : null}

          {tab === 'map' ? (
            <Card>
              <Text style={[t.typography.cardTitle, { color: t.palette.ink }]}>Coordinates</Text>
              <Text style={[t.typography.body, { color: t.palette.ink2 }]}>
                {spot.lat.toFixed(4)}°, {spot.lng.toFixed(4)}°
              </Text>
              <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
                Real Mapbox tiles land in a post-MVP loop.
              </Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating overlay buttons */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: Math.max(insets.top, 12),
          left: 12,
          right: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <CircleButton onPress={() => router.back()} accessibilityLabel="Back">
          <ChevronLeft size={22} color={t.palette.ink} />
        </CircleButton>
        <CircleButton onPress={() => setSaved((s) => !s)} accessibilityLabel="Save">
          <Heart
            size={20}
            color={saved ? t.palette.danger : t.palette.ink}
            fill={saved ? t.palette.danger : 'transparent'}
          />
        </CircleButton>
      </View>

      {/* Sticky CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: ctaBottom,
          left: 16,
          right: 16,
        }}
      >
        <Button
          label="Log a jump"
          variant="primary"
          // Loop 26 lands /log/[id]; cast for now.
          onPress={() => router.push(`/log/${spot.id}` as never)}
        />
      </View>
    </View>
  );
}

function CircleButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      {children}
    </Pressable>
  );
}
