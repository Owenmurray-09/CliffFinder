import { ChevronRight } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function ListRow({
  title,
  subtitle,
  icon,
  trailing,
  onPress,
  testID,
  style,
}: ListRowProps) {
  const t = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: t.palette.paper2,
    borderWidth: 1,
    borderColor: t.palette.line,
    borderRadius: t.radius.cardSm,
    width: '100%',
  };

  const trailingNode =
    trailing !== undefined ? trailing : <ChevronRight size={20} color={t.palette.ink3} />;

  const content = (
    <>
      {icon !== undefined ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: t.palette.paper,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[t.typography.cardTitle, { color: t.palette.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[t.typography.label, { color: t.palette.ink3 }]}>{subtitle}</Text>
        ) : null}
      </View>
      {trailingNode}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        style={[containerStyle, style]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[containerStyle, style]}>
      {content}
    </View>
  );
}
