const BASE_URL = import.meta.env.BASE_URL;

const TOOLS = [
  {
    id: 'labels',
    title: 'Label Generator',
    description: 'Build and print custom whisky bottle labels.',
    href: `${BASE_URL}labels/`,
    available: true,
  },
  {
    id: 'prototype',
    title: 'Site Prototype',
    description: 'Reference prototype for the Whisky Blender Shopify store.',
    href: `${BASE_URL}prototype/`,
    available: true,
  },
];

export default function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero__inner">
          <p className="hero__eyebrow">Drewnotweird</p>
          <h1 className="hero__title">Whisky Blender</h1>
          <p className="hero__desc">Drew's toolkit for crafting</p>
        </div>
      </header>

      <main className="main">
        <div className="tools-grid">
          {TOOLS.map(tool => (
            tool.available ? (
              <a key={tool.id} href={tool.href} className="tool-card tool-card--active">
                <h2 className="tool-card__title">{tool.title}</h2>
                <p className="tool-card__desc">{tool.description}</p>
                <span className="tool-card__cta">Open →</span>
              </a>
            ) : (
              <div key={tool.id} className="tool-card tool-card--soon">
                <h2 className="tool-card__title">{tool.title}</h2>
                <p className="tool-card__desc">{tool.description}</p>
                <span className="tool-card__badge">Coming soon</span>
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  );
}
