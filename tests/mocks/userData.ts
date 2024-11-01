import {vi} from "vitest";

export const currentUserMock = {
    id: '1',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
        creationTime: new Date().toString(),
        lastSignInTime: new Date().toString(),
    },
    providerData: [{
        displayName: 'user',
        email: 'test@test.com',
        phoneNumber: '0630666666',
        photoURL: null,
        providerId: '',
        uid: '1'
    }],
    refreshToken: '',
    tenantId: '',
    delete: vi.fn(),
    getIdToken: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    getIdTokenResult: vi.fn(),
    displayName: 'user',
    email:'email',
    phoneNumber:'0630666666',
    photoURL: null,
    providerId: '',
    uid: '1'
}
