import { Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider, useSession } from '../state/SessionContext';
import { OverlayProvider } from '../state/OverlayContext';
import { WorkspaceProvider } from '../state/WorkspaceContext';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LandingRedirect } from '../pages/LandingRedirect';
import { PortfolioPage } from '../pages/PortfolioPage';
import { ContractNotePage } from '../pages/ContractNotePage';
import { LOGIN_PATH, FORGOT_PATH } from './routes';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { status } = useSession();
  if (status === 'loading') return <div className="boot-screen" />;
  if (status === 'anonymous') return <Navigate to={LOGIN_PATH} replace />;
  return children;
}

export function App() {
  return (
    <SessionProvider>
      <OverlayProvider>
        <Routes>
          <Route path={LOGIN_PATH} element={<LoginPage />} />
          <Route path={FORGOT_PATH} element={<ForgotPasswordPage />} />
          <Route path="/app/db/:dbId/f/:familyId/pms/:portfolioId/sum" element={<RequireAuth><WorkspaceProvider><PortfolioPage /></WorkspaceProvider></RequireAuth>} />
          <Route path="/app/db/:dbId/f/:familyId/pms/:portfolioId/trans/:assetCode/cn" element={<RequireAuth><WorkspaceProvider><ContractNotePage /></WorkspaceProvider></RequireAuth>} />
          <Route path="/app/*" element={<RequireAuth><LandingRedirect /></RequireAuth>} />
          <Route path="*" element={<RequireAuth><LandingRedirect /></RequireAuth>} />
        </Routes>
      </OverlayProvider>
    </SessionProvider>
  );
}
