import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Mail, MapPin, Mountain } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  type TextStyle,
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
const HERO_HEIGHT = 280;

type AuthView = 'signin' | 'signup' | 'forgot' | 'sent' | 'done' | 'location';

// Match the design's `.btn-primary` on sign-in (Map.html line ~340):
// padding 15, fontWeight 600, fontSize 15, letterSpacing 0.01em, marginTop 4.
const PRIMARY_BTN_STYLE = { paddingVertical: 15, paddingHorizontal: 15 };
const PRIMARY_BTN_TEXT: TextStyle = {
  fontFamily: 'Poppins_600SemiBold',
  fontWeight: '600',
  fontSize: 15,
  letterSpacing: 0.15,
};
// Outline button on sign-in: padding 14, fontWeight 500, fontSize 15.
const OUTLINE_BTN_STYLE = { paddingVertical: 14, paddingHorizontal: 14 };
const OUTLINE_BTN_TEXT: TextStyle = {
  fontFamily: 'Poppins_600SemiBold',
  fontWeight: '500',
  fontSize: 15,
};

const HEADLINE_STYLE: TextStyle = {
  fontFamily: 'Poppins_700Bold',
  fontWeight: '700',
  fontSize: 24,
  letterSpacing: -0.24, // -0.01em on 24px ≈ -0.24
};

export default function SigninScreen() {
  const t = useTheme();
  const router = useRouter();
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const signUpWithPassword = useAuthStore((s) => s.signUpWithPassword);
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);
  const grantLocation = useAuthStore((s) => s.grantLocation);
  const declineLocation = useAuthStore((s) => s.declineLocation);

  const [view, setView] = useState<AuthView>('signin');
  const [sentReason, setSentReason] = useState<'reset' | 'confirm'>('reset');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<SigninError | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const errMsg = serverErr ?? (err ? ERROR_MESSAGES[err] : undefined);

  const doSignin = async () => {
    setServerErr(null);
    const e = validateSignin(email, password);
    setErr(e);
    if (e) return;
    setBusy(true);
    const message = await signInWithPassword(email, password);
    setBusy(false);
    if (message) {
      setServerErr(message);
      return;
    }
    setView('done');
  };

  const doSignup = async () => {
    setServerErr(null);
    const e = validateSignup(name, email, password, confirm);
    setErr(e);
    if (e) return;
    setBusy(true);
    const result = await signUpWithPassword(email, password, name.trim());
    setBusy(false);
    if (result.error) {
      setServerErr(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setServerErr(null);
      setSentReason('confirm');
      setView('sent');
      return;
    }
    setView('done');
  };

  const doForgot = async () => {
    setServerErr(null);
    const e = validateForgot(email);
    setErr(e);
    if (e) return;
    setBusy(true);
    const message = await sendPasswordReset(email);
    setBusy(false);
    if (message) {
      setServerErr(message);
      return;
    }
    setSentReason('reset');
    setView('sent');
  };

  const goTo = (next: AuthView) => () => {
    setErr(null);
    setServerErr(null);
    setView(next);
  };

  const finishSignin = () => setView('location');

  const completeLocation = (granted: boolean) => () => {
    if (granted) grantLocation();
    else declineLocation();
    router.replace('/');
  };

  if (view === 'location') return <LocationView onAllow={completeLocation(true)} onDecline={completeLocation(false)} />;

  const showHero = view === 'signin' || view === 'signup';
  const showFooter = view === 'signin' || view === 'signup';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.palette.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: showFooter ? 56 : 24 }}
      >
        {showHero ? <Hero /> : null}

        {/* Form: overlaps the bottom 40px of the gradient-faded hero on
            signin/signup; otherwise sits at the top with safe-area padding. */}
        <View
          style={{
            marginTop: showHero ? -40 : 0,
            paddingHorizontal: 20,
            paddingTop: showHero ? 0 : 60,
            gap: 14,
          }}
        >
          {view === 'signin' ? (
            <>
              <Text style={[HEADLINE_STYLE, { color: t.palette.ink }]}>Welcome back</Text>
              <View style={{ gap: 10, marginTop: 6 }}>
                <Field
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
                <Field
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={doSignin}
                  rightAdornment={<ShowToggle showing={showPw} onPress={() => setShowPw((s) => !s)} />}
                />
              </View>
              {errMsg ? (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.danger, marginTop: -4 }}>
                  ⚠ {errMsg}
                </Text>
              ) : null}
              <Button
                label={busy ? 'Signing in…' : 'Sign in'}
                variant="primary"
                onPress={doSignin}
                busy={busy}
                style={{ ...PRIMARY_BTN_STYLE, marginTop: 4 }}
                textStyle={PRIMARY_BTN_TEXT}
              />
              <Pressable
                onPress={goTo('forgot')}
                accessibilityRole="button"
                hitSlop={8}
                style={{ alignSelf: 'center', marginTop: -2, paddingVertical: 4 }}
              >
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: t.palette.ink3 }}>
                  Forgot password?
                </Text>
              </Pressable>
              <OrDivider />
              <Button
                label="Create account"
                variant="outline"
                onPress={goTo('signup')}
                style={OUTLINE_BTN_STYLE}
                textStyle={OUTLINE_BTN_TEXT}
              />
            </>
          ) : null}

          {view === 'signup' ? (
            <>
              <Text style={[HEADLINE_STYLE, { color: t.palette.ink }]}>Create your account</Text>
              <View style={{ gap: 10, marginTop: 6 }}>
                <Field
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Owen Murray"
                  autoComplete="name"
                />
                <Field
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <Field
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  rightAdornment={<ShowToggle showing={showPw} onPress={() => setShowPw((s) => !s)} />}
                />
                <Field
                  label="Confirm password"
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  onSubmitEditing={doSignup}
                  rightAdornment={<ShowToggle showing={showPw} onPress={() => setShowPw((s) => !s)} />}
                />
              </View>
              {errMsg ? (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.danger, marginTop: -4 }}>
                  ⚠ {errMsg}
                </Text>
              ) : null}
              <Button
                label={busy ? 'Creating…' : 'Create account'}
                variant="primary"
                onPress={doSignup}
                busy={busy}
                style={{ ...PRIMARY_BTN_STYLE, marginTop: 4 }}
                textStyle={PRIMARY_BTN_TEXT}
              />
              <SignInLink onPress={goTo('signin')} prefix="Already have one?" cta="Sign in" />
            </>
          ) : null}

          {view === 'forgot' ? (
            <ForgotView
              email={email}
              setEmail={setEmail}
              onSubmit={doForgot}
              onBack={goTo('signin')}
              errMsg={errMsg}
              busy={busy}
            />
          ) : null}

          {view === 'sent' ? (
            <ConfirmView
              icon={<Mail size={40} color={t.palette.accent} />}
              title="Check your inbox"
              body={
                <>
                  We sent a {sentReason === 'confirm' ? 'confirmation' : 'reset'} link to{' '}
                  <Text style={{ fontWeight: '600', color: t.palette.ink }}>{email}</Text>. It
                  should arrive in a minute.
                </>
              }
              primary={{ label: 'Back to sign in', onPress: goTo('signin') }}
              secondary={
                sentReason === 'reset'
                  ? { label: 'Resend', onPress: doForgot }
                  : undefined
              }
            />
          ) : null}

          {view === 'done' ? (
            <ConfirmView
              icon={<Check size={40} color={t.palette.accent} strokeWidth={2.6} />}
              title="You're in."
              body={`Welcome to CliffFinder, ${name || email.split('@')[0] || 'explorer'}. Next, allow location so we can show jumps near you.`}
              primary={{ label: 'Continue', onPress: finishSignin }}
            />
          ) : null}
        </View>

        {showFooter ? (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 11,
              color: t.palette.ink3,
              textAlign: 'center',
              position: 'absolute',
              bottom: 24,
              left: 0,
              right: 0,
            }}
          >
            By continuing you agree to our Terms · Privacy
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Hero() {
  const t = useTheme();
  return (
    <View style={{ height: HERO_HEIGHT }}>
      <Image
        source={{ uri: HERO_URI }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', t.palette.paper]}
        locations={[0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        style={{
          position: 'absolute',
          top: 92,
          left: 20,
          right: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Mountain size={26} color={t.palette.accent} strokeWidth={2.5} />
        <View>
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontWeight: '700',
              fontSize: 26,
              lineHeight: 26,
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
    </View>
  );
}

function ShowToggle({ showing, onPress }: { showing: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={showing ? 'Hide password' : 'Show password'} hitSlop={8}>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.55,
          textTransform: 'uppercase',
          color: t.palette.ink3,
        }}
      >
        {showing ? 'Hide' : 'Show'}
      </Text>
    </Pressable>
  );
}

function OrDivider() {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: t.palette.line }} />
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
          color: t.palette.ink3,
          letterSpacing: 1.1,
          textTransform: 'uppercase',
        }}
      >
        or
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: t.palette.line }} />
    </View>
  );
}

function SignInLink({
  onPress,
  prefix,
  cta,
}: {
  onPress: () => void;
  prefix: string;
  cta: string;
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', marginTop: 2, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: t.palette.ink3 }}>{prefix}</Text>
      <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, fontWeight: '600', color: t.palette.accent }}>
          {cta}
        </Text>
      </Pressable>
    </View>
  );
}

function ForgotView({
  email,
  setEmail,
  onSubmit,
  onBack,
  errMsg,
  busy,
}: {
  email: string;
  setEmail: (s: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  errMsg?: string;
  busy: boolean;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: 14 }}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: t.palette.line,
          backgroundColor: t.palette.paper2,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        <ChevronLeft size={20} color={t.palette.ink} />
      </Pressable>
      <Text style={[HEADLINE_STYLE, { color: t.palette.ink }]}>Reset your password</Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, color: t.palette.ink3, marginTop: -6 }}>
        Enter the email tied to your account. We'll send a link to reset.
      </Text>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onSubmitEditing={onSubmit}
      />
      {errMsg ? (
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: t.palette.danger, marginTop: -4 }}>
          ⚠ {errMsg}
        </Text>
      ) : null}
      <Button
        label={busy ? 'Sending…' : 'Send reset link'}
        variant="primary"
        onPress={onSubmit}
        busy={busy}
        style={{ ...PRIMARY_BTN_STYLE, marginTop: 4 }}
        textStyle={PRIMARY_BTN_TEXT}
      />
      <SignInLink onPress={onBack} prefix="Remembered it?" cta="Sign in" />
    </View>
  );
}

function ConfirmView({
  icon,
  title,
  body,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  primary: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 16, paddingTop: 64, paddingHorizontal: 16 }}>
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
      <Text style={[HEADLINE_STYLE, { color: t.palette.ink, textAlign: 'center' }]}>{title}</Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          lineHeight: 21,
          color: t.palette.ink3,
          textAlign: 'center',
          maxWidth: 320,
        }}
      >
        {body}
      </Text>
      <Button
        label={primary.label}
        variant="primary"
        onPress={primary.onPress}
        style={{ ...PRIMARY_BTN_STYLE, paddingHorizontal: 28, marginTop: 6 }}
        textStyle={PRIMARY_BTN_TEXT}
      />
      {secondary ? (
        <Pressable onPress={secondary.onPress} accessibilityRole="button" hitSlop={8}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: t.palette.ink3 }}>
            {secondary.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function LocationView({ onAllow, onDecline }: { onAllow: () => void; onDecline: () => void }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.palette.paper }}>
      <View style={{ paddingTop: 70, paddingHorizontal: 20 }}>
        <Text
          style={{
            fontFamily: 'Poppins_700Bold',
            fontWeight: '700',
            fontSize: 26,
            letterSpacing: -0.26,
            color: t.palette.ink,
          }}
        >
          One last thing.
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            lineHeight: 21.75,
            color: t.palette.ink3,
            marginTop: 6,
          }}
        >
          Allow location so we can show jumps near you and tag spots you add.
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RadarTarget accent={t.palette.accent} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }}>
        <View
          style={{
            backgroundColor: t.palette.paper2,
            borderWidth: 1,
            borderColor: t.palette.line,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <Check size={18} color={t.palette.accent} strokeWidth={2.5} style={{ marginTop: 2 }} />
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              lineHeight: 19,
              color: t.palette.ink3,
              flex: 1,
            }}
          >
            Used only while you're using the app — we never track in the background.
          </Text>
        </View>
        <Button
          label="Allow while using app"
          variant="primary"
          onPress={onAllow}
          style={{ paddingVertical: 16, paddingHorizontal: 16 }}
          textStyle={PRIMARY_BTN_TEXT}
        />
        <Pressable
          onPress={onDecline}
          accessibilityRole="button"
          hitSlop={8}
          style={{ paddingVertical: 10, alignSelf: 'center' }}
        >
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: t.palette.ink3 }}>
            Maybe later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Radar graphic per Map.html line ~376: 240×240 with 3 concentric outer
// rings (inset i*-14 px), a tinted inner circle (accent@0.1 then @0.2),
// and a centered map pin scaled 2.4×.
function RadarTarget({ accent }: { accent: string }) {
  return (
    <View style={{ width: 240, height: 240 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: -i * 14,
            left: -i * 14,
            right: -i * 14,
            bottom: -i * 14,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: accent,
            opacity: 0.5 / i,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 30,
          left: 30,
          right: 30,
          bottom: 30,
          borderRadius: 9999,
          backgroundColor: `${accent}1a`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            right: 14,
            bottom: 14,
            borderRadius: 9999,
            backgroundColor: `${accent}33`,
          }}
        />
        <MapPin size={68} color={accent} fill={`${accent}66`} strokeWidth={2.2} />
      </View>
    </View>
  );
}
