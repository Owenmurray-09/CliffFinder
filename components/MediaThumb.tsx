import { Play } from 'lucide-react-native';
import { Image, type StyleProp, View, type ViewStyle } from 'react-native';

const VIDEO_EXT = /\.(mp4|mov|webm|m4v|qt)(\?|#|$)/i;
const VIDEO_MIME = /^blob:/i; // blob URLs lose extension; rely on caller to set isVideo

export type MediaThumbProps = {
  uri: string;
  size: number;
  radius?: number;
  /** Force video treatment for local blob URLs that lost their extension. */
  isVideo?: boolean;
  style?: StyleProp<ViewStyle>;
};

const looksLikeVideo = (uri: string): boolean => VIDEO_EXT.test(uri);

/**
 * Square media thumbnail. Renders the URI as an image; overlays a small play
 * pip if the URL looks like a video (extension match) or the caller explicitly
 * passes isVideo=true. Used by the Add Spot + Log Entry photo grids so a
 * picked video reads visually as a video before upload.
 */
export function MediaThumb({ uri, size, radius = 14, isVideo, style }: MediaThumbProps) {
  const treatAsVideo = isVideo ?? looksLikeVideo(uri);
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }, style]}>
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {treatAsVideo ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: VIDEO_MIME.test(uri) ? 'rgba(0,0,0,0.35)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="none"
        >
          <View
            style={{
              width: Math.round(size * 0.36),
              height: Math.round(size * 0.36),
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.55)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={Math.round(size * 0.18)} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </View>
      ) : null}
    </View>
  );
}
