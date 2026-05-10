import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  type LucideIcon,
  Mountain,
  MoreHorizontal,
  Plus,
  Route,
  Shield,
  Star,
  Waves,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { StarRow } from '@/components/StarRow';
import { useSavedSpotsStore } from '@/data/savedSpotsStore';
import { useSpotsStore } from '@/data/spotsStore';
import { safeBack } from '@/lib/safeBack';
import { formatDepth, formatDistance, formatMeters, useUnitsStore } from '@/lib/units';
import type { Spot } from '@/data/types';
import { openDirections } from '@/map/directions';
import { distanceKm, HOME_POINT } from '@/map/projection';
import { useTheme } from '@/theme/useTheme';

const HERO_HEIGHT = 380;

const PIN_COLORS: Record<Spot['category'], string> = {
  trending: '#E07A2E',
  saved: '#E8B742',
  friends: '#D17EA8',
};
const CATEGORY_LABEL: Record<Spot['category'], string> = {
  trending: 'Trending',
  saved: 'Saved',
  friends: 'Friends jumped',
};

const TINY_LABEL: TextStyle = {
  fontFamily: 'Montserrat_600SemiBold',
  fontWeight: '600',
  fontSize: 10,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
};

const EXP_LABEL: Record<Spot['difficulty'], string> = {
  beginner: 'Beg.',
  intermediate: 'Int.',
  advanced: 'Adv.',
};

export default function SpotDetailsScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const spot = useSpotsStore((s) => s.getById(params.id));
  const saved = useSavedSpotsStore((s) => (spot ? s.isSaved(spot.id) : false));
  const toggleSaved = useSavedSpotsStore((s) => s.toggleSaved);
  const units = useUnitsStore((s) => s.units);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoWidth, setPhotoWidth] = useState(0);

  if (!spot) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.palette.paper }}>
        <EmptyState title="Spot not found" message="That spot doesn't exist or was removed." />
      </View>
    );
  }

  const distLabel = spot.distLabel ?? formatDistance(distanceKm(HOME_POINT, spot), units);
  const expLabel = EXP_LABEL[spot.difficulty];
  const ctaBottom = Math.max(insets.bottom, 16);

  const onPhotoLayout = (e: LayoutChangeEvent) => {
    setPhotoWidth(e.nativeEvent.layout.width);
  };
  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (photoWidth === 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / photoWidth);
    if (next !== photoIdx && next >= 0 && next < spot.photos.length) {
      setPhotoIdx(next);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 + ctaBottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CAROUSEL */}
        <View
          onLayout={onPhotoLayout}
          style={{ height: HERO_HEIGHT, width: '100%', backgroundColor: '#000' }}
        >
          {photoWidth > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onCarouselScroll}
              scrollEventThrottle={16}
            >
              {spot.photos.map((p, i) => (
                <Image
                  key={i}
                  source={{ uri: p }}
                  style={{ width: photoWidth, height: HERO_HEIGHT }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : null}

          {/* TOP DARK GRADIENT (status bar visibility) */}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120 }}
            pointerEvents="none"
          />
          {/* BOTTOM PAPER FADE (so the photo blends into the page) */}
          <LinearGradient
            colors={['transparent', t.palette.paper]}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 }}
            pointerEvents="none"
          />

          {/* CORNER BUTTONS */}
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: Math.max(insets.top, 12) + 4,
              left: 16,
              right: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <CircleButton onPress={() => safeBack(router)} accessibilityLabel="Back">
              <ChevronLeft size={20} color={t.palette.ink} />
            </CircleButton>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <CircleButton
                onPress={() => toggleSaved(spot.id)}
                accessibilityLabel={saved ? 'Remove from saved' : 'Save spot'}
                bg={saved ? t.palette.accent : 'rgba(255,255,255,0.92)'}
              >
                <Heart
                  size={18}
                  color={saved ? '#FFFFFF' : t.palette.ink}
                  fill={saved ? '#FFFFFF' : 'transparent'}
                  strokeWidth={1.8}
                />
              </CircleButton>
              <CircleButton onPress={() => {}} accessibilityLabel="More options">
                <MoreHorizontal size={18} color={t.palette.ink} />
              </CircleButton>
            </View>
          </View>

          {/* CATEGORY PILL */}
          <View
            style={{
              position: 'absolute',
              top: Math.max(insets.top, 12) + 70,
              left: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255,255,255,0.92)',
              paddingVertical: 5,
              paddingLeft: 9,
              paddingRight: 12,
              borderRadius: 99,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: PIN_COLORS[spot.category],
              }}
            />
            <Text
              style={{
                fontFamily: 'Montserrat_600SemiBold',
                fontWeight: '600',
                fontSize: 11,
                color: '#1E2F23',
                letterSpacing: 0.66,
                textTransform: 'uppercase',
              }}
            >
              {CATEGORY_LABEL[spot.category]}
            </Text>
          </View>

          {/* PHOTO DOTS */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 24,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {spot.photos.map((_, i) => {
              const active = i === photoIdx;
              return (
                <View
                  key={i}
                  style={{
                    width: active ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* TITLE ROW: name left, ★ rating right */}
        <View
          style={{
            paddingHorizontal: 22,
            paddingTop: 6,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontWeight: '700',
              fontSize: 30,
              lineHeight: 31.5,
              letterSpacing: -0.3,
              color: t.palette.ink,
              flex: 1,
            }}
          >
            {spot.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingBottom: 4 }}>
            <Star size={15} color={t.palette.star.readonly} fill={t.palette.star.readonly} />
            <Text
              style={{
                fontFamily: 'Montserrat_700Bold',
                fontWeight: '700',
                fontSize: 14,
                color: t.palette.ink,
              }}
            >
              {spot.rating.toFixed(1)}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: t.palette.ink3 }}>
              ({spot.reviewCount})
            </Text>
          </View>
        </View>

        {/* SUBTITLE: area · distance */}
        <Text
          style={{
            paddingHorizontal: 22,
            paddingTop: 4,
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: t.palette.ink3,
          }}
        >
          {spot.area} · {distLabel}
        </Text>

        {/* 3 STAT CARDS */}
        <View style={{ paddingHorizontal: 22, paddingTop: 16, flexDirection: 'row', gap: 8 }}>
          <StatCard Icon={Mountain} label="Jump h." value={formatMeters(spot.height_m, units)} />
          <StatCard Icon={Waves} label="Depth" value={formatDepth(spot.depth_m, units)} />
          <StatCard Icon={Shield} label="Exp." value={expLabel} />
        </View>

        {/* SAFETY RATING CARD */}
        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[TINY_LABEL, { color: t.palette.ink3 }]}>Safety rating</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 }}>
                  <StarRow value={Math.round(spot.rating)} size={14} />
                  <Text
                    style={{
                      fontFamily: 'Montserrat_700Bold',
                      fontWeight: '700',
                      fontSize: 14,
                      color: t.palette.ink,
                    }}
                  >
                    {spot.rating.toFixed(1)} / 5
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: t.palette.ink3,
                    textAlign: 'right',
                  }}
                >
                  {spot.reviewCount}
                  {'\n'}reviews
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* HOW TO ACCESS */}
        <View style={{ paddingHorizontal: 22, paddingTop: 10 }}>
          <Card>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={[TINY_LABEL, { color: t.palette.ink3 }]}>How to access</Text>
              <Pressable
                onPress={() =>
                  openDirections({ lat: spot.lat, lng: spot.lng, name: spot.name })
                }
                accessibilityRole="link"
                accessibilityLabel="Open in Maps"
                hitSlop={6}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontWeight: '600',
                    fontSize: 12,
                    color: t.palette.accent,
                  }}
                >
                  Open in Maps
                </Text>
                <ChevronRight size={12} color={t.palette.accent} />
              </Pressable>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13.5,
                lineHeight: 20.25,
                color: t.palette.ink,
                opacity: 0.92,
              }}
            >
              {spot.description}
            </Text>
          </Card>
        </View>

        {/* NOTES */}
        {spot.notes ? (
          <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
            <Text
              style={{
                fontFamily: 'Poppins_700Bold',
                fontWeight: '700',
                fontSize: 16,
                color: t.palette.ink,
                marginBottom: 6,
              }}
            >
              Notes
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 13,
                lineHeight: 19.5,
                color: t.palette.ink3,
              }}
            >
              {spot.notes}
            </Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* STICKY BOTTOM CTA — Directions (filled) + Logbook (outline) */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: ctaBottom,
        }}
      >
        <LinearGradient
          colors={['transparent', t.palette.paper]}
          locations={[0, 0.4]}
          style={{ position: 'absolute', left: 0, right: 0, top: -16, bottom: 0 }}
          pointerEvents="none"
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            label="Directions"
            variant="primary"
            onPress={() =>
              openDirections({ lat: spot.lat, lng: spot.lng, name: spot.name })
            }
            icon={<Route size={17} color={t.palette.on.accent} />}
            style={{
              flex: 1,
              height: 50,
              paddingVertical: 0,
              paddingHorizontal: 0,
              shadowColor: t.palette.accent,
              shadowOpacity: 0.34,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
            textStyle={{
              fontFamily: 'Poppins_700Bold',
              fontWeight: '700',
              fontSize: 14.5,
              letterSpacing: -0.15,
            }}
          />
          <Button
            label="Logbook"
            variant="outline"
            onPress={() => router.push(`/log/${spot.id}`)}
            icon={<Plus size={16} color={t.palette.ink} />}
            style={{
              flex: 1,
              height: 50,
              paddingVertical: 0,
              paddingHorizontal: 0,
              borderColor: t.palette.line,
              borderWidth: 1.5,
            }}
            textStyle={{
              fontFamily: 'Poppins_700Bold',
              fontWeight: '700',
              fontSize: 14.5,
              letterSpacing: -0.15,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function CircleButton({
  onPress,
  accessibilityLabel,
  bg = 'rgba(255,255,255,0.92)',
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  bg?: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {children}
    </Pressable>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.palette.cardBg,
          borderWidth: 1,
          borderColor: t.palette.glassBorder,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 16,
          shadowColor: '#1E2F23',
          shadowOpacity: t.dark ? 0 : 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: t.dark ? 0 : 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function StatCard({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.palette.cardBg,
        borderWidth: 1,
        borderColor: t.palette.glassBorder,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 6,
        shadowColor: '#1E2F23',
        shadowOpacity: t.dark ? 0 : 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: t.dark ? 0 : 1,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          backgroundColor: `${t.palette.accent}1f`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={15} color={t.palette.accent} strokeWidth={2.2} />
      </View>
      <Text style={[TINY_LABEL, { color: t.palette.ink3 }]}>{label}</Text>
      <Text
        style={{
          fontFamily: 'Poppins_700Bold',
          fontWeight: '700',
          fontSize: 17,
          lineHeight: 17,
          color: t.palette.ink,
          marginTop: -2,
          letterSpacing: -0.17,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

