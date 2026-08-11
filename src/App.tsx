import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { TopologyCanvas } from './components/TopologyCanvas';
import { PricingSummary } from './components/PricingSummary';
import { Inspector } from './components/Inspector';
import { PriceCatalogEditor } from './components/PriceCatalogEditor';
import { useDesignStore } from './store/designStore';
import './App.css';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export default function App() {
  const selection = useDesignStore((s) => s.selection);
  const deleteDataCenter = useDesignStore((s) => s.deleteDataCenter);
  const deleteLink = useDesignStore((s) => s.deleteLink);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (isTypingTarget(e.target)) return;
      if (!selection) return;
      e.preventDefault();
      if (selection.type === 'datacenter') {
        deleteDataCenter(selection.id);
      } else {
        deleteLink(selection.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selection, deleteDataCenter, deleteLink]);

  return (
    <div className="app">
      <Toolbar />
      <main className="app-main">
        <section className="canvas-pane">
          <TopologyCanvas />
        </section>
        <aside className="side-pane">
          <PricingSummary />
          <Inspector />
        </aside>
      </main>
      <PriceCatalogEditor />
    </div>
  );
}
