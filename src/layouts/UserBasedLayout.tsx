import {FirebaseProvider} from "../database/firebase/FirebaseProvider.tsx";
import {ReactNode, useContext} from "react";
import {AuthContext} from "../store/AuthContext.tsx";
import PageLoading from "../components/PageLoading.tsx";
import Header from "../components/Header.tsx";
import {Footer} from "../components/Footer.tsx";
import UserHeader from "../components/UserHeader.tsx";


export const UserBasedLayout = ({children}: {
    children: ReactNode
}) => {
    const {user, loading} = useContext(AuthContext);

    if (!user) {
        return (<>
            <UserHeader />

        </>)
    }

    return (
        <FirebaseProvider>
            <Header/>
            <div className="main-container p-2 flex flex-col h-full flex-1">
                {loading && <PageLoading/>}

                {!loading && children}
            </div>
            <Footer />
        </FirebaseProvider>
    )
};
