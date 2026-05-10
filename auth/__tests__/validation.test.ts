import {
  EMAIL_RE,
  MIN_PASSWORD_LENGTH,
  validateForgot,
  validateSignin,
  validateSignup,
} from '../validation';

describe('EMAIL_RE', () => {
  test.each([
    ['alex@example.com', true],
    ['alex@cliffjumper.app', true],
    ['a@b.co', true],
    ['', false],
    ['no-at-sign.com', false],
    ['no-domain@', false],
    ['no-tld@example', false],
    ['has space@example.com', false],
    ['multi@@example.com', false],
  ])('%s → %s', (input, expected) => {
    expect(EMAIL_RE.test(input)).toBe(expected);
  });
});

describe('validateSignin', () => {
  test('valid email + password', () => {
    expect(validateSignin('alex@example.com', 'secret123')).toBeNull();
  });
  test('empty email → email_required', () => {
    expect(validateSignin('', 'password')).toBe('email_required');
  });
  test('invalid email → email_invalid', () => {
    expect(validateSignin('not-an-email', 'password')).toBe('email_invalid');
  });
  test('empty password → password_required', () => {
    expect(validateSignin('alex@example.com', '')).toBe('password_required');
  });
  test(`password under ${MIN_PASSWORD_LENGTH} chars → password_too_short`, () => {
    expect(validateSignin('alex@example.com', 'ab')).toBe('password_too_short');
  });
});

describe('validateSignup', () => {
  test('valid name + email + password + matching confirm', () => {
    expect(validateSignup('Alex', 'alex@example.com', 'secret123', 'secret123')).toBeNull();
  });
  test('empty name → name_required', () => {
    expect(validateSignup('', 'alex@example.com', 'secret123', 'secret123')).toBe('name_required');
  });
  test('whitespace name → name_required', () => {
    expect(validateSignup('   ', 'alex@example.com', 'secret123', 'secret123')).toBe(
      'name_required',
    );
  });
  test('falls through to email/password validation', () => {
    expect(validateSignup('Alex', 'bad', 'secret123', 'secret123')).toBe('email_invalid');
  });
  test('mismatched confirm → confirm_mismatch', () => {
    expect(validateSignup('Alex', 'alex@example.com', 'secret123', 'different')).toBe(
      'confirm_mismatch',
    );
  });
});

describe('validateForgot', () => {
  test('valid email passes', () => {
    expect(validateForgot('alex@example.com')).toBeNull();
  });
  test('empty email → email_required', () => {
    expect(validateForgot('')).toBe('email_required');
  });
  test('invalid email → email_invalid', () => {
    expect(validateForgot('not-an-email')).toBe('email_invalid');
  });
});
