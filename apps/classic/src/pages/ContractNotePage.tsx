import { TopNav } from '../components/shell/TopNav';
import { FamilyBar } from '../components/shell/FamilyBar';
import { NavRow } from '../components/shell/NavRow';
import { Sidebar } from '../components/shell/Sidebar';
import { ContractNoteForm } from '../components/transactions/ContractNoteForm';
import { OverlayHost } from '../overlays/OverlayHost';

// Transaction-entry screen. Live keeps the whole shell and only swaps the right-hand pane,
// so the asset strip and holdings table are replaced by the contract-note form.
export function ContractNotePage() {
  return (
    <div className="shell">
      <TopNav />
      <FamilyBar />
      <NavRow onAssetSearch={() => undefined} />
      <div className="shell-body">
        <Sidebar />
        <main className="right-container">
          <ContractNoteForm />
        </main>
      </div>
      <OverlayHost />
    </div>
  );
}
