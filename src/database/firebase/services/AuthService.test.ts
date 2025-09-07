import type { Mock } from 'vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase/auth module functions used by AuthService
vi.mock('firebase/auth', () => {
  return {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  };
});

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { UserFormValues } from '../../../interfaces/interfaces.ts';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('SignIn: calls firebase signInWithEmailAndPassword when firebaseAuth is available', async () => {
    // Arrange: mock config to export a non-null firebaseAuth
    vi.doMock('../config.ts', () => ({
      firebaseAuth: {} as unknown,
    }));
    // Re-import the module under test to pick up mocked config
    const { SignIn: SignInFresh } = await import('./AuthService');

    (signInWithEmailAndPassword as Mock).mockResolvedValue({
      user: { uid: 'u1' },
    } as unknown);

    // Act
    const result = await SignInFresh({ email: 'a@b.com', password: 'pw' });

    // Assert
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'a@b.com',
      'pw',
    );
    expect(result).toEqual({ user: { uid: 'u1' } });
  });

  it('SignIn: returns { user: null } when firebaseAuth is null', async () => {
    vi.doMock('../config.ts', () => ({
      firebaseAuth: null,
    }));
    const { SignIn: SignInFresh } = await import('./AuthService');

    const result = await SignInFresh({ email: 'x@y.com', password: 'pw' });

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(result).toEqual({ user: null });
  });

  it('SignUp: calls firebase createUserWithEmailAndPassword when firebaseAuth is available', async () => {
    vi.doMock('../config.ts', () => ({
      firebaseAuth: {} as unknown,
    }));
    const { SignUp: SignUpFresh } = await import('./AuthService');

    (createUserWithEmailAndPassword as Mock).mockResolvedValue({
      user: { uid: 'u2' },
    } as unknown);

    const result = await SignUpFresh({
      email: 'c@d.com',
      password: 'pw',
    } as UserFormValues);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'c@d.com',
      'pw',
    );
    expect(result).toEqual({ user: { uid: 'u2' } });
  });

  it('SignUp: returns { user: null } when firebaseAuth is null', async () => {
    vi.doMock('../config.ts', () => ({
      firebaseAuth: null,
    }));
    const { SignUp: SignUpFresh } = await import('./AuthService');

    const result = await SignUpFresh({
      email: 'z@z.com',
      password: 'pw',
    } as UserFormValues);

    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(result).toEqual({ user: null });
  });

  it('SignOut: calls firebase signOut when firebaseAuth is available', async () => {
    vi.doMock('../config.ts', () => ({
      firebaseAuth: {} as unknown,
    }));
    const { SignOut: SignOutFresh } = await import('./AuthService');

    await expect(SignOutFresh()).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(expect.any(Object));
  });

  it('SignOut: does nothing when firebaseAuth is null', async () => {
    vi.doMock('../config.ts', () => ({
      firebaseAuth: null,
    }));
    const { SignOut: SignOutFresh } = await import('./AuthService');

    await expect(SignOutFresh()).resolves.toBeUndefined();
    expect(signOut).not.toHaveBeenCalled();
  });
});
