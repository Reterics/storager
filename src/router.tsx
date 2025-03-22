import {useSearchParams} from "react-router-dom";
import {InAppLayout} from "./layouts/InAppLayout.tsx";
import Items from "./pages/items.tsx";
import Parts from "./pages/Parts.tsx";
import Service from "./pages/Service.tsx";
import Settings from "./pages/Settings.tsx";
import UsersPage from "./pages/Users.tsx";
import SignInComponent from "./components/SignIn.tsx";
import Shops from "./pages/Shops.tsx";
import About from "./pages/About.tsx";
import Types from "./pages/Types.tsx";
import RecycleBin from "./pages/RecycleBin.tsx";
import Invoices from "./pages/Invoices.tsx";
import Print from "./pages/Print.tsx";
import Diagnostic from "./pages/Diagnostic.tsx";
import TermsOfUse from "./pages/TermsOfUse.tsx";
import {UserBasedLayout} from "./layouts/UserBasedLayout.tsx";


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
            case 'about':
                return <InAppLayout><About /></InAppLayout>;
            case 'types':
                return <InAppLayout><Types /></InAppLayout>;
            case 'recycle':
                return <InAppLayout><RecycleBin /></InAppLayout>;
            case 'invoices':
                return <InAppLayout><Invoices /></InAppLayout>;
            case 'print':
                return <InAppLayout><Print /></InAppLayout>;
            case 'diag':
                return <InAppLayout><Diagnostic /></InAppLayout>;
            case 'signin':
                return <SignInComponent />;
            case 'terms':
                return <UserBasedLayout><TermsOfUse/></UserBasedLayout>;
            default:
                return <InAppLayout><Shops /></InAppLayout>;
        }
    };

    return renderPage();
}

export default QueryRouter;
