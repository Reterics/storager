import {vi} from "vitest";
import {currentUserMock} from "./userData";

vi.mock('firebase/auth', () => ({
        getAuth: () => {
            return {
                currentUser: currentUserMock
            }
        },
        setPersistence: vi.fn().mockImplementation(async () => {}),
        browserLocalPersistence: 'LOCAL',
        createUserWithEmailAndPassword: vi.fn().mockImplementation(()=>({
            user: currentUserMock
        })),
        signInWithEmailAndPassword: vi.fn().mockImplementation(()=>({
            user: currentUserMock
        })),
        signOut: vi.fn(),
        onAuthStateChanged: vi.fn().mockImplementation((_auth, callback) => {
            callback(currentUserMock);
            return () => {}; // Return a cleanup function
        })
    }
));
