import {FirebaseProvider} from "../firebase/FirebaseProvider.tsx";
import {ReactNode, useContext} from "react";
import {AuthContext} from "../store/AuthContext.tsx";
import SignInComponent from "../components/SignIn.tsx";
import PageLoading from "../components/PageLoading.tsx";
import Header from "../components/Header.tsx";


export const InAppLayout = ({children}: {
    children: ReactNode
}) => {
    const {user, loading} = useContext(AuthContext);

    if (!user) return <SignInComponent/>;

    return (
        <FirebaseProvider>
            <Header/>
            <div className="main-container p-2 flex flex-col h-full">
                {loading && <PageLoading/>}

                {!loading && children}
            </div>

        </FirebaseProvider>
)
};
