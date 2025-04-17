export const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'A user with that email already exists',
  'auth/weak-password':
    'Please check your password. It should be 6+ characters',
  'auth/missing-password': 'Password is missing',
  'auth/invalid-password':
    'Password is invalid.  It must be a string with at least six characters.',
  'auth/too-many-requests	':
    'The number of requests exceeds the maximum allowed.',
  'auth/user-not-found':
    'There is no existing user record corresponding to the provided identifier.',
  'auth/unauthorized-continue-uri':
    'The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase Console.',
  'auth/invalid-credential': 'Invalid Credentials',
  'auth/permission-denied': 'Missing or insufficient permissions.',
};
