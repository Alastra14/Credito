import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'has_seen_onboarding';
const PIN_KEY = 'user_pin';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000; // 30 seconds

// In-memory attempt tracking (resets on app restart)
let failedAttempts = 0;
let lockoutUntil: number | null = null;

export async function hasSeenOnboarding(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return value === 'true';
}

export async function setHasSeenOnboarding(value: boolean): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, value ? 'true' : 'false');
}

export async function hasPin(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(PIN_KEY);
  return value !== null;
}

export async function setPin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export function isLockedOut(): { locked: boolean; remainingSeconds: number } {
  if (lockoutUntil && Date.now() < lockoutUntil) {
    return { locked: true, remainingSeconds: Math.ceil((lockoutUntil - Date.now()) / 1000) };
  }
  if (lockoutUntil && Date.now() >= lockoutUntil) {
    lockoutUntil = null;
    failedAttempts = 0;
  }
  return { locked: false, remainingSeconds: 0 };
}

export async function verifyPin(pin: string): Promise<{ success: boolean; attemptsLeft?: number; lockedSeconds?: number }> {
  const lockStatus = isLockedOut();
  if (lockStatus.locked) {
    return { success: false, lockedSeconds: lockStatus.remainingSeconds };
  }

  const storedPin = await SecureStore.getItemAsync(PIN_KEY);
  if (storedPin === pin) {
    failedAttempts = 0;
    lockoutUntil = null;
    return { success: true };
  }

  failedAttempts++;
  if (failedAttempts >= MAX_ATTEMPTS) {
    lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    return { success: false, lockedSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  return { success: false, attemptsLeft: MAX_ATTEMPTS - failedAttempts };
}

export async function removePin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
}
