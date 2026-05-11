import { Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type StarRaterProps = {
  /** Current rating, 1–5, or 0 if not yet rated. */
  value: number;
  onChange: (next: number) => void;
  /** Tap the already-selected star to clear back to 0. Default true. */
  allowClear?: boolean;
  size?: number;
};

/**
 * Interactive 5-star rater. Tap star N to set value=N; tap the currently
 * selected star to clear (when allowClear). Same visual idiom as the
 * "Your rating" block in the Log Entry screen.
 */
export function StarRater({ value, onChange, allowClear = true, size = 28 }: StarRaterProps) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        return (
          <Pressable
            key={i}
            onPress={() => {
              if (allowClear && value === i) onChange(0);
              else onChange(i);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${i} ${i === 1 ? 'star' : 'stars'}`}
            hitSlop={4}
          >
            <Star
              size={size}
              color={filled ? t.palette.accent : t.palette.ink3}
              fill={filled ? t.palette.accent : 'transparent'}
              strokeWidth={1.6}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
