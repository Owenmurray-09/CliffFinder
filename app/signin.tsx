import { useRouter } from 'expo-router';
import { Check, MapPin, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import {
  ERROR_MESSAGES,
  type SigninError,
  useAuthStore,
  validateForgot,
  validateSignin,
  validateSignup,
} from '@/auth/store';
import { useTheme } from '@/theme/useTheme';

const HERO_URI =
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1400&q=80';
const BUSY_MS = 700;
const HERO_HEIGHT = 280;

type AuthView = 'signin' | 'signup' | 'forgot' | 'sent' | 'done' | 'location';

export default function SigninScreen() {
  const t = useTheme();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const grantLocation = useAuthStore((s) => s.grantLocation);
  const declineLocation = useAuthStore((s) => s.declineLocation);

  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<SigninError | null>(null);

  const errMsg = err ? ERROR_MESSAGES[err] : undefined;

  const submitWithDelay = (next: AuthView) => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setView(next);
    }, BUSY_MS);
  };

  const doSignin = () => {
    const e = validateSignin(email, password);
    setErr(e);
    if (e) return;
    submitWithDelay('done');
  };

  const doSignup = () => {
    const e = validateSignup(name, email, password, confirm);
    setErr(e);
    if (e) return;
    submitWithDelay('done');
  };

  const doForgot = () => {
    const e = validateForgot(email);
    setErr(e);
    if (e) return;
    submitWithDelay('sent');
  };

  const goTo = (next: AuthView) => () => {
    setErr(null);
    setView(next);
  };

  const finishSignin = () => {
    // Don't flip isAuthenticated yet — that would let the AuthGate redirect
    // to /(tabs) before the user sees the location prompt. We only sign in
    // after the location prompt resolves (allow or decline).
    setView('location');
  };

  const completeLocation = (granted: boolean) => () => {
    if (granted) grantLocation();
    else declineLocation();
    signIn();
    router.replace('/');
  };

  const showHero = view === 'signin' || view === 'signup';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {showHero ? (
          <View style={{ height: HERO_HEIGHT, position: 'relative' }}>
            <Image
              source={{ uri: HERO_URI }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {/* paper-fade overlay so content reads against the photo edge */}
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: HERO_HEIGHT * 0.4,
                bottom: 0,
                // simple linear blend approximated; expo-linear-gradient could
                // be used here but a single ramp at 60% works well visually
                backgroundColor: t.palette.paper,
                opacity: 0,
              }}
            />
            <View style={{ position: 'absolute', top: 80, left: 24, right: 24 }}>
              <Text
                style={{
                  fontFamily: 'Poppins_700Bold',
                  fontSize: 26,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  textShadowColor: 'rgba(0,0,0,0.4)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}
              >
                CliffFinder
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: '#FFFFFF',
                  opacity: 0.9,
                  marginTop: 4,
                  textShadowColor: 'rgba(0,0,0,0.4)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
              >
                Explore more. Share safe.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={{ padding: 24, gap: 16, flex: 1 }}>
          {view === 'signin' ? (
            <>
              <Text style={[t.typography.display, { color: t.palette.ink }]}>Welcome back</Text>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={doSignin}
              />
              {errMsg ? (
                <Text style={{ color: t.palette.danger, fontSize: 12 }}>⚠ {errMsg}</Text>
              ) : null}
              <Button label="Sign in" variant="primary" onPress={doSignin} busy={busy} />
              <Button label="Forgot password?" variant="link" onPress={goTo('forgot')} />
              <View
                style={{ height: 1, backgroundColor: t.palette.line, marginVertical: 8 }}
              />
              <Button label="Create account" variant="outline" onPress={goTo('signup')} />
            </>
          ) : null}

          {view === 'signup' ? (
            <>
              <Text style={[t.typography.display, { color: t.palette.ink }]}>Create account</Text>
              <Field label="Name" value={name} onChangeText={setName} autoComplete="name" />
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <Field
                label="Confirm password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={doSignup}
              />
              {errMsg ? (
                <Text style={{ color: t.palette.danger, fontSize: 12 }}>⚠ {errMsg}</Text>
              ) : null}
              <Button label="Create account" variant="primary" onPress={doSignup} busy={busy} />
              <Button label="Back to sign in" variant="link" onPress={goTo('signin')} />
            </>
          ) : null}

          {view === 'forgot' ? (
            <>
              <Text style={[t.typography.display, { color: t.palette.ink }]}>Reset password</Text>
              <Text style={[t.typography.body, { color: t.palette.ink3 }]}>
                Enter your email and we'll send you a reset link.
              </Text>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onSubmitEditing={doForgot}
              />
              {errMsg ? (
                <Text style={{ color: t.palette.danger, fontSize: 12 }}>⚠ {errMsg}</Text>
              ) : null}
              <Button label="Send reset link" variant="primary" onPress={doForgot} busy={busy} />
              <Button label="Back to sign in" variant="link" onPress={goTo('signin')} />
            </>
          ) : null}

          {view === 'sent' ? (
            <ConfirmationView
              icon={<Mail size={40} color={t.palette.accent} />}
              title="Check your inbox"
              message={
                <>
                  We sent a reset link to{' '}
                  <Text style={{ fontWeight: '600', color: t.palette.ink }}>{email}</Text>. It
                  should arrive in a minute.
                </>
              }
              primary={{ label: 'Back to sign in', onPress: goTo('signin') }}
              secondary={{ label: 'Resend', onPress: doForgot }}
            />
          ) : null}

          {view === 'done' ? (
            <ConfirmationView
              icon={<Check size={40} color={t.palette.accent} strokeWidth={2.6} />}
              title="You're in"
              message={`Welcome to CliffFinder, ${name || email.split('@')[0] || 'explorer'}. Next, allow location so we can show jumps near you.`}
              primary={{ label: 'Continue', onPress: finishSignin }}
            />
          ) : null}

          {view === 'location' ? (
            <View
              style={{
                alignItems: 'center',
                gap: 18,
                paddingTop: 64,
                paddingHorizontal: 16,
              }}
            >
              <RadarGraphic accent={t.palette.accent} />
              <Text style={[t.typography.title, { color: t.palette.ink, textAlign: 'center' }]}>
                Show jumps near you
              </Text>
              <Text
                style={[
                  t.typography.body,
                  { color: t.palette.ink3, textAlign: 'center', maxWidth: 280 },
                ]}
              >
                Allow location while using the app to see what's nearby. You can change this any
                time in Settings.
              </Text>
              <Button
                label="Allow while using app"
                variant="primary"
                onPress={completeLocation(true)}
              />
              <Button
                label="Maybe later"
                variant="link"
                onPress={completeLocation(false)}
              />
            </View>
          ) : null}
        </View>

        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: t.palette.ink3,
            textAlign: 'center',
            paddingBottom: 24,
            paddingHorizontal: 24,
          }}
        >
          By continuing you agree to our Terms · Privacy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ConfirmationView({
  icon,
  title,
  message,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  title: string;
  message: React.ReactNode;
  primary: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
}) {
  const t = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        gap: 16,
        paddingTop: 48,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          backgroundColor: `${t.palette.accent}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text style={[t.typography.title, { color: t.palette.ink, textAlign: 'center' }]}>
        {title}
      </Text>
      <Text
        style={[
          t.typography.body,
          { color: t.palette.ink3, textAlign: 'center', maxWidth: 320, lineHeight: 21 },
        ]}
      >
        {message}
      </Text>
      <Button label={primary.label} variant="primary" onPress={primary.onPress} />
      {secondary ? (
        <Pressable onPress={secondary.onPress}>
          <Text style={[t.typography.body, { color: t.palette.ink3 }]}>{secondary.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Radar graphic: 3 concentric rings + central pin icon (per HANDOFF distilled).
function RadarGraphic({ accent }: { accent: string }) {
  const sizes = [120, 80, 44];
  const opacities = [0.16, 0.28, 0.45];
  return (
    <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
      {sizes.map((s, i) => (
        <View
          key={s}
          style={{
            position: 'absolute',
            width: s,
            height: s,
            borderRadius: s / 2,
            borderWidth: 2,
            borderColor: accent,
            opacity: opacities[i],
          }}
        />
      ))}
      <MapPin size={28} color={accent} fill={`${accent}33`} />
    </View>
  );
}
