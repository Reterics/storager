import { useSearchParams } from 'react-router-dom';
import { InAppLayout } from './layouts/InAppLayout.tsx';
import Items from './pages/items.tsx';
import Parts from './pages/Parts.tsx';
import Service from './pages/Service.tsx';
import Settings from './pages/Settings.tsx';
import UsersPage from './pages/Users.tsx';
import SignInComponent from './components/SignIn.tsx';
import Shops from './pages/Shops.tsx';
import About from './pages/About.tsx';
import Types from './pages/Types.tsx';
import RecycleBin from './pages/RecycleBin.tsx';
import Invoices from './pages/Invoices.tsx';
import Print from './pages/Print.tsx';
import Diagnostic from './pages/Diagnostic.tsx';
import TermsOfUse from './pages/TermsOfUse.tsx';
import { UserBasedLayout } from './layouts/UserBasedLayout.tsx';
import Logs from './pages/Logs.tsx';
import Transactions from './pages/Transactions.tsx';
import Leases from './pages/Leases.tsx';
import ItemsPage from './core/pages/ItemsPage.tsx';
import PartsPage from './core/pages/PartsPage.tsx';
import ShopsCorePage from './core/pages/ShopsPage.tsx';
import UsersCorePage from './core/pages/UsersPage.tsx';
import TypesCorePage from './core/pages/TypesPage.tsx';
import ServicesCorePage from './core/pages/ServicesPage.tsx';
import LeasesCorePage from './core/pages/LeasesPage.tsx';
import Reports from './pages/Reports.tsx';
import TransactionsCorePage from './core/pages/TransactionsPage.tsx';

function QueryRouter() {
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || 'shops'; // Default to 'shops' if no page is provided

  // Logic to return components based on `page` query parameter
  const renderPage = () => {
    switch (page) {
      case 'items':
        return (
          <InAppLayout>
            <Items />
          </InAppLayout>
        );
      case 'items-core':
        return (
          <InAppLayout>
            <ItemsPage />
          </InAppLayout>
        );
      case 'parts-core':
        return (
          <InAppLayout>
            <PartsPage />
          </InAppLayout>
        );
      case 'parts':
        return (
          <InAppLayout>
            <Parts />
          </InAppLayout>
        );
      case 'service':
        return (
          <InAppLayout>
            <Service />
          </InAppLayout>
        );
      case 'services-core':
        return (
          <InAppLayout>
            <ServicesCorePage />
          </InAppLayout>
        );
      case 'settings':
        return (
          <InAppLayout>
            <Settings />
          </InAppLayout>
        );
      case 'users':
        return (
          <InAppLayout>
            <UsersPage />
          </InAppLayout>
        );
      case 'users-core':
        return (
          <InAppLayout>
            <UsersCorePage />
          </InAppLayout>
        );
      case 'about':
        return (
          <InAppLayout>
            <About />
          </InAppLayout>
        );
      case 'types':
        return (
          <InAppLayout>
            <Types />
          </InAppLayout>
        );
      case 'types-core':
        return (
          <InAppLayout>
            <TypesCorePage />
          </InAppLayout>
        );
      case 'recycle':
        return (
          <InAppLayout>
            <RecycleBin />
          </InAppLayout>
        );
      case 'invoices':
        return (
          <InAppLayout>
            <Invoices />
          </InAppLayout>
        );
      case 'transactions':
        return (
          <InAppLayout>
            <Transactions />
          </InAppLayout>
        );
      case 'transactions-core':
        return (
          <InAppLayout>
            <TransactionsCorePage />
          </InAppLayout>
        );
      case 'reports':
        return (
          <InAppLayout>
            <Reports />
          </InAppLayout>
        );
      case 'leases':
        return (
          <InAppLayout>
            <Leases />
          </InAppLayout>
        );
      case 'leases-core':
        return (
          <InAppLayout>
            <LeasesCorePage />
          </InAppLayout>
        );
      case 'print':
        return (
          <InAppLayout>
            <Print />
          </InAppLayout>
        );
      case 'diag':
        return (
          <InAppLayout>
            <Diagnostic />
          </InAppLayout>
        );
      case 'logs':
        return (
          <InAppLayout>
            <Logs />
          </InAppLayout>
        );
      case 'signin':
        return <SignInComponent />;
      case 'terms':
        return (
          <UserBasedLayout>
            <TermsOfUse />
          </UserBasedLayout>
        );
      case 'shops-core':
        return (
          <InAppLayout>
            <ShopsCorePage />
          </InAppLayout>
        );
      default:
        return (
          <InAppLayout>
            <Shops />
          </InAppLayout>
        );
    }
  };

  return renderPage();
}

export default QueryRouter;
