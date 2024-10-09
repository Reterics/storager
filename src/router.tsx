import {useSearchParams} from "react-router-dom";
import {InAppLayout} from "./layouts/InAppLayout.tsx";
import Items from "./pages/items.tsx";
import Parts from "./pages/Parts.tsx";
import Service from "./pages/Service.tsx";
import Settings from "./pages/Settings.tsx";
import UsersPage from "./pages/Users.tsx";
import SignInComponent from "./components/SignIn.tsx";
import Shops from "./pages/Shops.tsx";


function QueryRouter() {
    const [searchParams] = useSearchParams();
    const page = searchParams.get('page') || 'shops'; // Default to 'shops' if no page is provided

    // Logic to return components based on `page` query parameter
    const renderPage = () => {
        switch (page) {
            case 'items':
                return <InAppLayout><Items /></InAppLayout>;
            case 'parts':
                return <InAppLayout><Parts /></InAppLayout>;
            case 'service':
                return <InAppLayout><Service /></InAppLayout>;
            case 'settings':
                return <InAppLayout><Settings /></InAppLayout>;
            case 'users':
                return <InAppLayout><UsersPage /></InAppLayout>;
            case 'signin':
                return <SignInComponent />;
            default:
                return <InAppLayout><Shops /></InAppLayout>;
        }
    };

    return renderPage();
}

export default QueryRouter;
