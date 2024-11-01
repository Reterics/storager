import {vi} from "vitest";
import {currentUserMock} from "./userData";

vi.mock('firebase/auth', () => ({
        getAuth: () => {
            return {
                currentUser: currentUserMock
            }
        },
        setPersistence: vi.fn(),
        browserLocalPersistence: 'LOCAL'
    }
));
