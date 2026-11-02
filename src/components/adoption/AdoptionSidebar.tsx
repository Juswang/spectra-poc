// Left sidebar: product tab navigation (Zoom, Teams, Exchange, Overview).
"use client";

interface AdoptionSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdoptionSidebar({ activeTab, onTabChange }: AdoptionSidebarProps) {
  return (
    <aside className="sa-aside">
      <div className="sa-nav-label">WORKSPACE</div>
      <nav className="sa-nav">
        <div className="sa-nav-label sa-products">PRODUCT ANALYTICS</div>
        <button
          className={activeTab === "zoom" ? "active" : ""}
          onClick={() => onTabChange("zoom")}
        >
          ◉ <span>SG-Zoom</span>
        </button>
      </nav>
      <div className="sa-sidebar-bottom">
        <span className="sa-sample-dot" /> All systems, one perspective
        <p>
          Understand adoption.
          <br />
          Make informed decisions.
        </p>
      </div>
    </aside>
  );
}
