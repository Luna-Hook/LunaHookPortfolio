"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plugin, plugins, searchText } from "./data/plugins";

const discord = "https://discord.com/users/1344843044905685004";
const paradoxDiscord = "https://discord.gg/buQ9t6y3tf";
const pluginSections = [
  ["overview", "Overview"],
  ["features", "Features"],
  ["setup", "Setup"],
  ["commands", "Commands"],
  ["permissions", "Permissions"],
  ["workflows", "GUIs & workflows"],
  ["config", "Configuration"],
  ["mechanics", "Recipes & mechanics"],
  ["examples", "Examples"],
  ["limits", "Limits & caveats"],
] as const;
const goals = [
  {
    label: "Survival",
    keywords: [
      "survival",
      "quality of life",
      "homes",
      "teleportation",
      "lifesteal",
      "progression",
    ],
  },
  {
    label: "Raiding",
    keywords: ["raiding", "territory", "pvp", "explosives", "combat"],
  },
  {
    label: "Claims",
    keywords: ["claims", "territory", "civilization", "factions"],
  },
  {
    label: "Discord integration",
    keywords: ["discord", "role sync", "account linking", "emoji", "whitelist"],
  },
  {
    label: "Custom items",
    keywords: ["custom item", "weapons", "bows", "pickaxes", "recipes"],
  },
  { label: "Teams", keywords: ["teams", "minigame", "simulation", "team"] },
  {
    label: "Server management",
    keywords: [
      "administration",
      "staff",
      "monitoring",
      "console",
      "automation",
      "audit",
    ],
  },
] as const;

type Recipe = {
  name: string;
  output: string;
  cells: (string | null)[];
  note: string;
  shapeless?: boolean;
};
const fullGrid = (item: string) => Array<string>(9).fill(item);
const ring = (outer: string, center: string) => [
  outer,
  outer,
  outer,
  outer,
  center,
  outer,
  outer,
  outer,
  outer,
];
const recipes: Record<string, Recipe[]> = {
  "easy-stuff": [
    {
      name: "Golden Apple",
      output: "Golden Apple",
      cells: [
        null,
        "Gold Ingot",
        null,
        "Gold Ingot",
        "Apple",
        "Gold Ingot",
        null,
        "Gold Ingot",
        null,
      ],
      note: "Four gold ingots form a plus around an apple.",
    },
    {
      name: "Cobweb Duplication",
      output: "2 Cobwebs",
      cells: [
        "String",
        null,
        "String",
        null,
        "Cobweb",
        null,
        "String",
        null,
        "String",
      ],
      note: "Four corner string around one cobweb yields two cobwebs.",
    },
  ],
  "hard-netherite": [
    {
      name: "Netherite Nugget",
      output: "Tagged Netherite Nugget",
      cells: fullGrid("Netherite Scrap"),
      note: "Nine netherite scrap craft one tagged Netherite Nugget.",
    },
    {
      name: "Netherite Ingot",
      output: "Netherite Ingot",
      cells: [
        "Netherite Nugget",
        "Gold Block",
        "Netherite Nugget",
        "Gold Block",
        null,
        "Gold Block",
        "Netherite Nugget",
        "Gold Block",
        "Netherite Nugget",
      ],
      note: "Shapeless: four exact tagged Netherite Nuggets plus four gold blocks. Arrangement does not matter.",
      shapeless: true,
    },
  ],
  redsteal: [
    {
      name: "Heart",
      output: "Heart",
      cells: [
        "Diamond Block",
        "Netherite Ingot",
        "Diamond Block",
        "Netherite Ingot",
        "Totem",
        "Netherite Ingot",
        "Diamond Block",
        "Netherite Ingot",
        "Diamond Block",
      ],
      note: "Documented pattern: DND / NTN / DND.",
    },
  ],
  supertnt: [
    {
      name: "T2",
      output: "T2",
      cells: fullGrid("Vanilla TNT"),
      note: "Nine vanilla TNT compress into T2.",
    },
    {
      name: "T3",
      output: "T3",
      cells: fullGrid("T2"),
      note: "Nine T2 compress into T3.",
    },
    {
      name: "T4",
      output: "T4",
      cells: fullGrid("T3"),
      note: "Nine T3 compress into T4.",
    },
    {
      name: "T5",
      output: "T5",
      cells: fullGrid("T4"),
      note: "Nine T4 compress into T5.",
    },
    {
      name: "T6",
      output: "T6",
      cells: fullGrid("T5"),
      note: "Nine T5 compress into T6.",
    },
    {
      name: "ST1",
      output: "ST1",
      cells: ring("Obsidian", "T4"),
      note: "An obsidian ring surrounds T4.",
    },
    {
      name: "ST2",
      output: "ST2",
      cells: ring("Obsidian", "T5"),
      note: "An obsidian ring surrounds T5.",
    },
    {
      name: "ST3",
      output: "ST3",
      cells: ring("Obsidian", "T6"),
      note: "An obsidian ring surrounds T6.",
    },
    {
      name: "ST4",
      output: "ST4",
      cells: ring("ST1", "ST2"),
      note: "Eight ST1 surround ST2.",
    },
    {
      name: "ST5",
      output: "ST5",
      cells: ring("ST3", "ST4"),
      note: "Eight ST3 surround ST4.",
    },
  ],
  paradoxweapons: [
    {
      name: "Slippy Sword",
      output: "Slippy Sword",
      cells: [
        "Slime Ball",
        "Honeycomb",
        "Slime Ball",
        "Honeycomb",
        "Diamond Sword",
        "Honeycomb",
        "Slime Ball",
        "Honeycomb",
        "Slime Ball",
      ],
      note: "Verified pattern SHS / HDH / SHS. The other five legendary weapons have no registered crafting recipe.",
    },
  ],
  pickaxes: [
    {
      name: "Moon Pickaxe",
      output: "Moon Pickaxe",
      cells: [
        "Moon Shard",
        "Breeze Rod",
        "Moon Shard",
        "Breeze Rod",
        "Iron Pickaxe",
        "Breeze Rod",
        "Moon Shard",
        "Breeze Rod",
        "Moon Shard",
      ],
      note: "Default Moon Pickaxe pattern SRS / RPR / SRS.",
    },
    {
      name: "Moon Shovel",
      output: "Moon Shovel",
      cells: [
        "Moon Shard",
        "Breeze Rod",
        "Moon Shard",
        "Breeze Rod",
        "Iron Shovel",
        "Breeze Rod",
        "Moon Shard",
        "Breeze Rod",
        "Moon Shard",
      ],
      note: "Default Moon Shovel pattern SRS / RPR / SRS.",
    },
    {
      name: "Sun Pickaxe",
      output: "Sun Pickaxe",
      cells: [
        "Sun Shard",
        "Blaze Rod",
        "Sun Shard",
        "Blaze Rod",
        "Golden Pickaxe",
        "Blaze Rod",
        "Sun Shard",
        "Blaze Rod",
        "Sun Shard",
      ],
      note: "Default Sun Pickaxe pattern SRS / RPR / SRS.",
    },
    {
      name: "Sun Shovel",
      output: "Sun Shovel",
      cells: [
        "Sun Shard",
        "Blaze Rod",
        "Sun Shard",
        "Blaze Rod",
        "Golden Shovel",
        "Blaze Rod",
        "Sun Shard",
        "Blaze Rod",
        "Sun Shard",
      ],
      note: "Default Sun Shovel pattern SRS / RPR / SRS.",
    },
    {
      name: "Upgrade Tool",
      output: "Matching Upgraded Tool",
      cells: [
        "Custom Default Tool",
        "Netherite Ingot",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      note: "Shapeless: one valid custom Default tool plus one Netherite Ingot. Arrangement does not matter.",
      shapeless: true,
    },
    {
      name: "Max Tool",
      output: "Matching Max Tool",
      cells: [
        "Netherite Ingot",
        null,
        "Netherite Ingot",
        null,
        "Custom Upgraded Tool",
        null,
        "Netherite Ingot",
        null,
        "Netherite Ingot",
      ],
      note: "Four Netherite Ingots in the corners surround one valid Upgraded custom tool.",
    },
  ],
  valexismace: [
    {
      name: "Mace",
      output: "Mace",
      cells: [
        "Heavy Core",
        "Heavy Core",
        "Heavy Core",
        "Heavy Core",
        "Heavy Core",
        "Heavy Core",
        null,
        "Breeze Rod",
        null,
      ],
      note: "Verified replacement recipe HHH / HHH / _B_.",
    },
  ],
};

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function Shell({
  children,
  showContact = true,
}: {
  children: React.ReactNode;
  showContact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="nav-wrap">
        <nav className="nav" aria-label="Main navigation">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              LH
            </span>
            <span>
              Luna Hook<small>Developer portfolio</small>
            </span>
          </Link>
          <button
            className="menu-button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            Menu
          </button>
          <div className={`nav-links ${open ? "open" : ""}`}>
            <Link href="/">Home</Link>
            <Link href="/plugins">Plugins</Link>
            <Link href="/servers">
              Servers <i>Beta</i>
            </Link>
            <Link href="/contact">Contact</Link>
          </div>
          <CommandPalette />
        </nav>
      </header>
      <main id="main" key={pathname} className="route-enter">
        {children}
      </main>
      {showContact && <Contact />}
      <footer>
        <div>
          <b>Luna Hook</b>
          <span>
            Developer • Minecraft Server Owner • Server Administrator •
            Community Systems Designer
          </span>
        </div>
        <p>Built for clarity, safety, and real server work.</p>
      </footer>
    </div>
  );
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openedRef = useRef(false);
  const results = useMemo(
    () =>
      query.trim()
        ? plugins
            .map((p) => ({ p, s: score(p, query) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
            .slice(0, 7)
            .map((x) => x.p)
        : [],
    [query],
  );
  const showPalette = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) closePalette();
        else showPalette();
      }
      if (event.key === "Escape") closePalette();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [closePalette, open, showPalette]);
  useEffect(() => {
    if (open) {
      openedRef.current = true;
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (openedRef.current)
      requestAnimationFrame(() => triggerRef.current?.focus());
  }, [open]);
  const inputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      document.getElementById(`palette-result-${active}`)?.click();
    }
  };
  return (
    <>
      <button
        ref={triggerRef}
        className="palette-trigger"
        onClick={showPalette}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <span>Search</span>
        <kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="palette-backdrop" onMouseDown={closePalette}>
          <section
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-labelledby="palette-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="palette-head">
              <div>
                <b id="palette-title">Search all plugin guides</b>
                <span>
                  Names, features, commands, tags and documented mechanics
                </span>
              </div>
              <button onClick={closePalette} aria-label="Close search">
                Esc
              </button>
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={inputKey}
              placeholder="Try emoji skin, claims, or Discord roles"
              aria-controls="palette-results"
              aria-activedescendant={
                results[active] ? `palette-result-${active}` : undefined
              }
            />
            <div
              id="palette-results"
              className="palette-results"
              role="listbox"
            >
              {query && !results.length && (
                <p>No documented plugin matches that search.</p>
              )}
              {results.map((plugin, index) => (
                <Link
                  id={`palette-result-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={index === active ? "active" : undefined}
                  href={`/plugins/${plugin.slug}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={closePalette}
                  key={plugin.slug}
                >
                  <span>
                    <b>{plugin.name}</b>
                    <small>
                      {plugin.category} · {plugin.scale}
                    </small>
                  </span>
                  <span>→</span>
                </Link>
              ))}
            </div>
            <p className="palette-note">
              The normal gallery filters remain available for deeper browsing.
            </p>
          </section>
        </div>
      )}
    </>
  );
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div>
        <Mark>Custom work & commissions</Mark>
        <h2>Have an idea worth building?</h2>
        <p>
          Message me to discuss an idea, request a plugin, ask a question, or
          get a quick quote. Many requests are free; if a project needs paid
          work, we’ll discuss it upfront at an accessible price.
        </p>
      </div>
      <div className="contact-actions">
        <a
          className="button primary"
          href={discord}
          target="_blank"
          rel="noreferrer"
        >
          Message Luna on Discord <span>↗</span>
        </a>
        <a href="mailto:2.luna.hook@gmail.com">2.luna.hook@gmail.com</a>
        <a
          href="https://www.tiktok.com/@luna.hook"
          target="_blank"
          rel="noreferrer"
        >
          TikTok @luna.hook ↗
        </a>
        <span className="handle">Discord · lunahook</span>
      </div>
    </section>
  );
}

function PluginCard({ plugin }: { plugin: Plugin }) {
  return (
    <article className="plugin-card">
      <div className="card-top">
        <span
          className={`status ${plugin.status.toLowerCase().replaceAll(" ", "-")}`}
        >
          {plugin.status === "Private"
            ? "Private • Available on Request"
            : plugin.status === "Security Hold"
              ? "Public • Security Hold"
              : plugin.status === "Availability Paused"
                ? "Private • Availability Paused"
                : "Public"}
        </span>
        {plugin.beta && <span className="beta">Beta</span>}
      </div>
      <h3>
        <Link href={`/plugins/${plugin.slug}`}>{plugin.name}</Link>
      </h3>
      <p>{plugin.summary}</p>
      <div className="chips">
        <span>{plugin.category}</span>
        <span>{plugin.scale}</span>
      </div>
      <Link className="text-link" href={`/plugins/${plugin.slug}`}>
        Open complete guide <span>→</span>
      </Link>
    </article>
  );
}

function Stats() {
  return (
    <section className="metrics section" aria-label="Portfolio statistics">
      <div>
        <strong>57</strong>
        <span>complete plugin guides</span>
      </div>
      <div>
        <strong>47</strong>
        <span>public repositories</span>
      </div>
      <div>
        <strong>10</strong>
        <span>request-only builds</span>
      </div>
      <div>
        <strong>4</strong>
        <span>Build Scale levels</span>
      </div>
    </section>
  );
}

function GoalMatcher() {
  const [selected, setSelected] = useState<(typeof goals)[number] | null>(null);
  const matches = useMemo(() => {
    if (!selected) return [];
    return plugins
      .filter((plugin) => plugin.requestable !== false)
      .map((plugin) => ({
        plugin,
        score: selected.keywords.reduce(
          (total, term) => total + (searchText(plugin).includes(term) ? 1 : 0),
          0,
        ),
      }))
      .filter((match) => match.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.plugin.name.localeCompare(b.plugin.name),
      )
      .slice(0, 4)
      .map((match) => match.plugin);
  }, [selected]);
  return (
    <section className="goal-matcher" aria-labelledby="goal-title">
      <div>
        <Mark>Quick matcher</Mark>
        <h2 id="goal-title">What are you building?</h2>
        <p>
          Choose a goal to surface plugins whose documented tags and
          descriptions match that need.
        </p>
      </div>
      <div className="goal-options" aria-label="Project goals">
        {goals.map((goal) => (
          <button
            className={selected?.label === goal.label ? "active" : undefined}
            aria-pressed={selected?.label === goal.label}
            onClick={() => setSelected(goal)}
            key={goal.label}
          >
            {goal.label}
          </button>
        ))}
      </div>
      {selected && (
        <div className="goal-results" aria-live="polite">
          <div>
            <b>Matches for {selected.label}</b>
            <span>
              Deterministically ranked from existing portfolio documentation.
            </span>
          </div>
          <div>
            {matches.map((plugin) => (
              <Link href={`/plugins/${plugin.slug}`} key={plugin.slug}>
                <span>
                  <b>{plugin.name}</b>
                  <small>{plugin.summary}</small>
                </span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RecipeViewer({ slug }: { slug: string }) {
  const available = recipes[slug];
  const [selected, setSelected] = useState(0);
  if (!available?.length) return null;
  const recipe = available[selected] ?? available[0];
  const initials = (item: string) =>
    item
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  const grid = (item: Recipe) => (
    <div className="recipe-card" key={item.name}>
      <h3>
        {item.name}
        {item.shapeless && <span className="recipe-kind">Shapeless</span>}
      </h3>
      <div className="recipe-workbench">
        <div
          className="recipe-grid"
          role="img"
          aria-label={`${item.name} recipe: ${item.cells.map((cell) => cell ?? "empty").join(", ")}`}
        >
          {item.cells.map((cell, index) => (
            <span
              className={cell ? "filled" : undefined}
              title={cell ?? "Empty slot"}
              key={index}
            >
              {cell && (
                <>
                  <b>{initials(cell)}</b>
                  <small>{cell}</small>
                </>
              )}
            </span>
          ))}
        </div>
        <span className="recipe-arrow" aria-hidden="true">
          →
        </span>
        <div className="recipe-output">
          <span>{initials(item.output)}</span>
          <b>{item.output}</b>
        </div>
      </div>
      <p>{item.note}</p>
    </div>
  );
  if (slug === "supertnt")
    return (
      <div className="recipe-viewer recipe-tier-viewer">
        <div className="recipe-heading">
          <div>
            <b>Complete verified crafting progression</b>
            <span>
              Every registered T-Series and Super TNT recipe is shown tier by
              tier. Nuker TNT has no registered recipe.
            </span>
          </div>
        </div>
        <div className="recipe-tier-grid">{available.map(grid)}</div>
      </div>
    );
  return (
    <div className="recipe-viewer">
      <div className="recipe-heading">
        <div>
          <b>Verified crafting viewer</b>
          <span>
            Only source-backed ingredients and grid positions are shown.
          </span>
        </div>
        {available.length > 1 && (
          <label>
            <span>Recipe</span>
            <select
              value={selected}
              onChange={(event) => setSelected(Number(event.target.value))}
            >
              {available.map((item, index) => (
                <option value={index} key={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {grid(recipe)}
    </div>
  );
}

export function HomePage() {
  const featured = [
    "supertnt",
    "civilizations",
    "discordconsole",
    "simplebots",
  ].map((s) => plugins.find((p) => p.slug === s)!);
  const blobFrame = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (blobFrame.current !== null) cancelAnimationFrame(blobFrame.current);
    },
    [],
  );
  const moveBlob = (event: React.PointerEvent<HTMLElement>) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const hero = event.currentTarget;
    const bounds = hero.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width),
    );
    const y = Math.max(
      0,
      Math.min(1, (event.clientY - bounds.top) / bounds.height),
    );
    if (blobFrame.current !== null) cancelAnimationFrame(blobFrame.current);
    blobFrame.current = requestAnimationFrame(() => {
      hero.style.setProperty("--blob-x", `${64 + x * 16}%`);
      hero.style.setProperty("--blob-y", `${12 + y * 18}%`);
      blobFrame.current = null;
    });
  };
  const resetBlob = (event: React.PointerEvent<HTMLElement>) => {
    if (blobFrame.current !== null) cancelAnimationFrame(blobFrame.current);
    event.currentTarget.style.removeProperty("--blob-x");
    event.currentTarget.style.removeProperty("--blob-y");
    blobFrame.current = null;
  };
  return (
    <Shell>
      <section
        className="hero section"
        onPointerMove={moveBlob}
        onPointerLeave={resetBlob}
      >
        <div className="hero-copy">
          <Mark>Available for developer work</Mark>
          <h1>
            Systems built to feel <em>obvious</em> in use.
          </h1>
          <p className="lede">
            I’m Luna Hook, a high-school developer focused on dependable
            Minecraft plugins, Discord integrations, server operations, and
            community systems that solve real problems.
          </p>
          <div className="hero-actions">
            <a
              className="button primary"
              href={discord}
              target="_blank"
              rel="noreferrer"
            >
              Discuss a project <span>↗</span>
            </a>
            <Link className="button ghost" href="/plugins">
              Explore 57 plugins
            </Link>
          </div>
          <div className="availability">
            <span></span>Open to custom plugin work, developer work &
            commissions
          </div>
        </div>
        <div className="craft-panel" aria-label="Portfolio highlights">
          <div className="craft-grid">
            {[
              "Paper",
              "Java",
              "Discord",
              "SQLite",
              "Systems",
              "UX",
              "Config",
              "Security",
              "Ops",
            ].map((x, i) => (
              <span key={x} className={i === 4 ? "center" : ""}>
                {x}
              </span>
            ))}
          </div>
          <p>
            <b>Professional first.</b> Minecraft-flavored by craft, not costume.
          </p>
        </div>
      </section>
      <section className="section about-home" aria-labelledby="about-luna">
        <div>
          <Mark>About me</Mark>
          <h2 id="about-luna">Luna (/ˈluːnə/ “LOO-nuh”)</h2>
          <div className="about-facts" aria-label="About Luna">
            <span><b>Age</b> 17 years old</span>
            <span><b>DOB</b> May 6, 2009</span>
          </div>
          <p>
            I build and operate Minecraft server systems, from focused gameplay
            plugins to the tooling, integrations, and documentation that keep a
            community running smoothly.
          </p>
        </div>
        <aside className="ai-notice">
          <h3>AI Notice:</h3>
          <p>
            There are dozens of children and other players that bring disgrace
            to the position of developer by making plugins entirely with AI.
            While I am <strong>not</strong> one of those people, I still use AI
            to code efficiently. The main things I utalize AI for:
          </p>
          <ol>
            <li>Format user-documents, like setup.md and config.yml</li>
            <li>Easily find documentation for complicated plug</li>
            <li>Catch bugs in the code and notify me</li>
          </ol>
        </aside>
      </section>
      <Stats />
      <section className="section split">
        <div>
          <Mark>Technical focus</Mark>
          <h2>From gameplay mechanic to operating system.</h2>
        </div>
        <div className="prose">
          <p>
            I design configurable systems with the full operator experience in
            mind: commands, permissions, safe defaults, workflows, persistence,
            feedback, recovery, and the edge cases that appear after launch.
          </p>
          <p>
            My work ranges from focused quality-of-life mechanics to large
            combat suites, event engines, Discord bridges, staff tooling,
            territory systems, analytics, and simulated-player workflows.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <Mark>Selected work</Mark>
            <h2>Featured builds</h2>
          </div>
          <Link className="text-link" href="/plugins">
            View all plugins <span>→</span>
          </Link>
        </div>
        <div className="plugin-grid featured">
          {featured.map((p) => (
            <PluginCard key={p.slug} plugin={p} />
          ))}
        </div>
      </section>
    </Shell>
  );
}

function score(plugin: Plugin, raw: string) {
  const q = raw.toLowerCase().trim();
  if (!q) return 1;
  const text = searchText(plugin);
  const terms = q.split(/\s+/);
  let result = terms.every((t) => text.includes(t)) ? 50 : 0;
  if (plugin.name.toLowerCase().includes(q)) result += 100;
  if (plugin.aliases.some((a) => a.toLowerCase().includes(q))) result += 80;
  for (const term of terms) {
    if (text.includes(term)) result += 10;
    else if (
      [...new Set(text.split(/\W+/))].some(
        (w) => w.startsWith(term) || term.startsWith(w),
      )
    )
      result += 2;
  }
  return result;
}

export function PluginsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [scale, setScale] = useState("All");
  const [status, setStatus] = useState("All");
  const [beta, setBeta] = useState("All");
  const [sort, setSort] = useState("Relevance");
  const categories = [
    "All",
    ...Array.from(new Set(plugins.map((p) => p.category))).sort(),
  ];
  const results = useMemo(
    () =>
      plugins
        .map((p) => ({ p, s: score(p, query) }))
        .filter(
          ({ p, s }) =>
            s > 0 &&
            (category === "All" || p.category === category) &&
            (scale === "All" || p.scale === scale) &&
            (status === "All" ||
              (status === "Public"
                ? p.status === "Public"
                : status === "Private"
                  ? p.status === "Private"
                  : p.status === status)) &&
            (beta === "All" || (beta === "Beta" ? p.beta : !p.beta)),
        )
        .sort((a, b) =>
          sort === "Name"
            ? a.p.name.localeCompare(b.p.name)
            : sort === "Build Scale"
              ? ["Simple", "Standard", "Advanced", "Large"].indexOf(b.p.scale) -
                ["Simple", "Standard", "Advanced", "Large"].indexOf(a.p.scale)
              : b.s - a.s,
        )
        .map(({ p }) => p),
    [query, category, scale, status, beta, sort],
  );
  return (
    <Shell>
      <section className="page-hero section">
        <Mark>Plugin index</Mark>
        <h1>Find the right system.</h1>
        <p>
          Search every documented command, permission, item, recipe, mechanic,
          workflow, config key, integration and limitation, not just plugin
          names.
        </p>
      </section>
      <section className="section catalog">
        <GoalMatcher />
        <div className="search-box">
          <label htmlFor="plugin-search">Search all 57 complete guides</label>
          <div>
            <span>⌕</span>
            <input
              id="plugin-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “emoji skin”, “3×3 mining”, or “discord roles”"
            />
            <kbd>/</kbd>
          </div>
        </div>
        <div className="filters">
          <Select
            label="Category"
            value={category}
            set={setCategory}
            items={categories}
          />
          <Select
            label="Build Scale"
            value={scale}
            set={setScale}
            items={["All", "Simple", "Standard", "Advanced", "Large"]}
          />
          <Select
            label="Status"
            value={status}
            set={setStatus}
            items={[
              "All",
              "Public",
              "Private",
              "Security Hold",
              "Availability Paused",
            ]}
          />
          <Select
            label="Release"
            value={beta}
            set={setBeta}
            items={["All", "Beta", "Stable"]}
          />
          <Select
            label="Sort"
            value={sort}
            set={setSort}
            items={["Relevance", "Name", "Build Scale"]}
          />
        </div>
        <div className="results-line">
          <b>
            {results.length} plugin{results.length === 1 ? "" : "s"}
          </b>
          <span>
            Build Scale reflects footprint and integrations, never quality.
          </span>
        </div>
        <div className="plugin-grid">
          {results.map((p) => (
            <PluginCard key={p.slug} plugin={p} />
          ))}
        </div>
        {!results.length && (
          <div className="empty">
            <h2>No matches yet.</h2>
            <p>
              Clear a filter or try a broader mechanic, command, or integration.
            </p>
          </div>
        )}
      </section>
    </Shell>
  );
}

function Select({
  label,
  value,
  set,
  items,
}: {
  label: string;
  value: string;
  set: (x: string) => void;
  items: string[];
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        {items.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}

function CopyButton({
  text,
  label = "Copy",
  compact = false,
}: {
  text: string;
  label?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="copy"
      style={compact ? { marginTop: 0 } : undefined}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
function ListSection({
  id,
  title,
  items,
  intro,
}: {
  id: string;
  title: string;
  items: string[];
  intro?: string;
}) {
  return (
    <section id={id} className="doc-section">
      <h2>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
      <ul>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function sectionIntro(plugin: Plugin, id: string) {
  const dependencyText = plugin.dependencies.length
    ? plugin.dependencies.join(", ")
    : "the listed runtime";
  const copy: Record<string, string> = {
    features: `These are the source-reviewed capabilities that define ${plugin.name}. Operational controls, recipes, and known boundaries remain separated below so each claim can be checked in context.`,
    setup: `Confirm access to ${dependencyText}, back up the server, and follow these steps in order. Use a disposable or staging server for the first run whenever the plugin changes worlds, inventories, permissions, external services, or persistent data.`,
    commands:
      "Angle brackets mark required values. Square brackets mark optional values, and a vertical bar separates accepted choices. Test administrative or destructive commands with a harmless target before granting wider access.",
    permissions:
      "Grant the narrowest node that supports the intended job. Public and OP defaults are called out only where the reviewed metadata confirms them. Administrative nodes should remain limited to trusted operators.",
    workflows: `The sequences below describe how ${plugin.name} is intended to be operated after installation. Complete setup and permission checks first, then follow the relevant workflow without skipping its validation step.`,
    mechanics:
      "These mechanics and item behaviors come from the reviewed source inventory. A visual recipe appears only when every ingredient and grid position was verified; command-only items are not presented as craftable.",
    examples:
      "Use these as controlled starting points, then substitute only values documented by the command or configuration reference. Examples are synthetic and contain no live server or player data.",
    limits:
      "Read these notes before production use. They distinguish confirmed behavior from integration, performance, provenance, or runtime questions that still require testing in the target environment.",
  };
  return copy[id];
}

export function PluginDetail({ plugin }: { plugin: Plugin }) {
  const configText = Object.entries(plugin.config)
    .map(
      ([section, keys]) =>
        `${section}:\n${keys.map((k) => `  # ${k}`).join("\n")}`,
    )
    .join("\n\n");
  const statusText =
    plugin.status === "Public"
      ? "Public"
      : plugin.status === "Private"
        ? plugin.slug === "paradoxweapons"
          ? "Private • Not for Sale"
          : "Private • Available on Request"
        : plugin.status === "Security Hold"
          ? "Public • Security Hold"
          : "Private • Availability Paused";
  const [activeSection, setActiveSection] = useState("overview");
  useEffect(() => {
    const update = () => {
      let current: string = pluginSections[0][0];
      for (const [id] of pluginSections) {
        const section = document.getElementById(id);
        if (
          section &&
          section.getBoundingClientRect().top <= window.innerHeight * 0.3
        )
          current = id;
      }
      setActiveSection(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <Shell>
      <article className="plugin-page">
        <header className="plugin-hero section">
          <div className="plugin-meta">
            <Link className="back" href="/plugins">
              ← All plugins
            </Link>
            <div className="card-top">
              <span
                className={`status ${plugin.status.toLowerCase().replaceAll(" ", "-")}`}
              >
                {statusText}
              </span>
              {plugin.beta && <span className="beta">Beta</span>}
              <span className="scale">{plugin.scale} Build</span>
            </div>
            <div className="chips">
              {plugin.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="plugin-intro">
            <h1>{plugin.name}</h1>
            <p>{plugin.summary}</p>
            <div className="hero-actions">
              {plugin.github && (
                <a
                  className="button ghost"
                  href={plugin.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source on GitHub ↗
                </a>
              )}
              {plugin.requestable !== false && (
                <a
                  className="button primary"
                  href={discord}
                  target="_blank"
                  rel="noreferrer"
                >
                  {plugin.slug === "paradoxweapons"
                    ? "Ask about this plugin"
                    : "Request JAR or help"}{" "}
                  ↗
                </a>
              )}{" "}
              {plugin.requestable === false && (
                <span className="disabled-action">
                  Distribution currently disabled
                </span>
              )}
            </div>
          </div>
        </header>
        <div className="doc-layout section">
          <aside aria-label="Plugin guide sections">
            <b>On this page</b>
            {pluginSections.map(([id, x]) => (
              <a
                href={`#${id}`}
                className={activeSection === id ? "active" : undefined}
                aria-current={activeSection === id ? "location" : undefined}
                key={id}
              >
                {x}
              </a>
            ))}
          </aside>
          <div className="docs">
            <section id="overview" className="doc-section">
              <Mark>{plugin.category}</Mark>
              <h2>Overview</h2>
              <p>{plugin.summary}</p>
              <div className="requirements">
                <b>Requirements & integrations</b>
                <div>
                  {plugin.dependencies.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
              </div>
              {plugin.attribution && (
                <div className="notice attribution">
                  <b>Attribution</b>
                  <p>{plugin.attribution}</p>
                </div>
              )}
            </section>
            <ListSection
              id="features"
              title="Features"
              items={plugin.features}
              intro={sectionIntro(plugin, "features")}
            />
            <ListSection
              id="setup"
              title="Setup"
              items={plugin.setup}
              intro={sectionIntro(plugin, "setup")}
            />
            <ListSection
              id="commands"
              title="Commands & arguments"
              items={plugin.commands}
              intro={sectionIntro(plugin, "commands")}
            />
            <ListSection
              id="permissions"
              title="Permissions & access"
              items={plugin.permissions}
              intro={sectionIntro(plugin, "permissions")}
            />
            <ListSection
              id="workflows"
              title="GUIs & workflows"
              items={plugin.workflows}
              intro={sectionIntro(plugin, "workflows")}
            />
            <section id="config" className="doc-section">
              <div className="doc-heading">
                <h2>Safe configuration reference</h2>
                <CopyButton text={configText} label="Copy whole reference" />
              </div>
              <p className="muted">
                Keys and behavior labels only. Secrets, live IDs, player data,
                private endpoints and operational values are excluded.
              </p>
              {Object.entries(plugin.config).map(([section, keys]) => (
                <div className="config-block" key={section}>
                  <div>
                    <b>{section}</b>
                    <CopyButton
                      text={`${section}:\n${keys.map((k) => `  # ${k}`).join("\n")}`}
                    />
                  </div>
                  <pre>
                    {section}:
                    {keys.map((k) => (
                      <code key={k}>{`\n  # ${k}`}</code>
                    ))}
                  </pre>
                </div>
              ))}
            </section>
            <section id="mechanics" className="doc-section">
              <h2>Recipes, items & mechanics</h2>
              <p className="section-intro">
                {sectionIntro(plugin, "mechanics")}
              </p>
              <RecipeViewer slug={plugin.slug} />
              <ul>
                {plugin.mechanics.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            <ListSection
              id="examples"
              title="Worked examples"
              items={plugin.examples}
              intro={sectionIntro(plugin, "examples")}
            />
            <section id="limits" className="doc-section">
              <h2>Limits, caveats & verification</h2>
              <p className="section-intro">{sectionIntro(plugin, "limits")}</p>
              <div className="notice">
                <b>Source-backed, not overclaimed</b>
                <p>
                  Details reflect the reviewed source inventory. Anything
                  requiring a live server, external service, load test, or
                  unresolved provenance is stated as a limitation.
                </p>
              </div>
              <ul>
                {plugin.limits.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </article>
    </Shell>
  );
}

export function ServersPage() {
  type ServerCardData = {
    name: string;
    state: string;
    kind: string;
    members?: string;
    role?: string;
    body: string;
    action?: string;
    value?: string;
    discordHref?: string;
    href?: string;
  };
  const activeServers: ServerCardData[] = [
    {
      name: "Mineverse Events",
      state: "Open",
      kind: "Public event server",
      members: "150 members",
      body: "A live events server built around community competitions and special Minecraft experiences.",
      action: "Copy join IP",
      value: "relicevents.net",
      discordHref: "https://discord.gg/jmNcMt2zxn",
    },
    {
      name: "Crunchie's SMP",
      state: "Open",
      kind: "Public survival",
      members: "800 members",
      body: "Crunchie's main survival server, featuring custom systems, progression, and an active community.",
      action: "Copy join IP",
      value: "crunchie.lol",
      discordHref: "https://discord.gg/crunchie",
    },
    {
      name: "Crunchie's Events",
      state: "Open",
      kind: "Public event server",
      members: "800 members",
      body: "The dedicated event side of Crunchie's network for competitions, community games, and special releases.",
      action: "Copy join IP",
      value: "crunchie.lol",
      discordHref: "https://discord.gg/crunchie",
    },
    {
      name: "Imperial SMP",
      state: "Open",
      kind: "Community survival",
      members: "2,600 members",
      body: "A civilization-focused survival server with custom territory, power, progression, and raiding systems.",
      action: "IP coming soon",
      discordHref: "https://discord.gg/RB44zDRh5N",
    },
    {
      name: "Illicit SMP",
      state: "Applications only",
      kind: "Private survival",
      members: "150 members",
      body: "A curated survival community. Access is available through an application in the official Discord.",
      action: "Apply through Discord",
      href: "https://discord.gg/N357y2fX9g",
    },
  ];
  const previousServers: ServerCardData[] = [
    {
      name: "Paradox FFA",
      state: "Temporarily discontinued",
      kind: "Server archive",
      members: "250 members",
      body: "The public free-for-all server is temporarily discontinued. Its community Discord remains available for updates.",
      action: "Open Discord",
      href: paradoxDiscord,
    },
    {
      name: "Paradox SMP",
      state: "Temporarily discontinued",
      kind: "Server archive",
      members: "250 members",
      body: "The Paradox survival server is temporarily discontinued. Its community Discord remains available for updates.",
      action: "Open Discord",
      href: paradoxDiscord,
    },
    {
      name: "Valexis",
      state: "Temporarily discontinued",
      kind: "Server archive",
      members: "200 members",
      body: "Not currently operating. The community Discord remains available for updates and history.",
      action: "Open Discord",
      href: "https://discord.gg/UU47qda5Wu",
    },
    {
      name: "Corrupted",
      state: "Inactive",
      kind: "Previous community project",
      members: "2,600 members",
      body: "A previous community project retained as part of Luna's server development history.",
      action: "Open Discord",
      href: "https://discord.gg/d5JXDF7HRY",
    },
    {
      name: "Shatter SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "2,800 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Red SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "50 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Foreign SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "200 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Frost SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "100 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Nova SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "100 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Hollow SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "50 members",
      role: "Developer",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Doom Events",
      state: "Inactive",
      kind: "Previous community project",
      members: "100 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Essence SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "215 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
    {
      name: "Eternal SMP",
      state: "Inactive",
      kind: "Previous community project",
      members: "50 members",
      body: "A previous community project retained as part of Luna's server development history.",
    },
  ];
  const serverCard = (s: ServerCardData, i: number) => (
    <article key={s.name}>
      <div className="server-number">{String(i + 1).padStart(2, "0")}</div>
      <div className="card-top">
        <span className={s.state === "Open" ? "live" : "beta"}>{s.state}</span>
        <span>{s.kind}</span>
      </div>
      <h2>{s.name}</h2>
      <div className="server-meta">
        {s.members ? <span>{s.members}</span> : null}
        {s.role ? <span>Role: {s.role}</span> : null}
      </div>
      <p>{s.body}</p>
      {s.value || s.href || s.discordHref ? (
        <div className="hero-actions">
          {s.value ? (
            <>
              <CopyButton text={s.value} label={`${s.action}: ${s.value}`} compact />
              {s.discordHref ? (
                <a className="button ghost" href={s.discordHref} target="_blank" rel="noreferrer">Join Discord ↗</a>
              ) : null}
            </>
          ) : s.href ? (
            <a className="button ghost" href={s.href} target="_blank" rel="noreferrer">{s.action} ↗</a>
          ) : (
            <>
              <span className="button ghost" aria-disabled="true">{s.action}</span>
              <a className="button ghost" href={s.discordHref} target="_blank" rel="noreferrer">Join Discord ↗</a>
            </>
          )}
        </div>
      ) : null}
    </article>
  );
  return (
    <Shell>
      <section className="page-hero section">
        <div className="card-top">
          <Mark>Servers</Mark>
          <span className="beta">Beta · more coming later</span>
        </div>
        <h1>Communities are where systems get real.</h1>
        <p>
          Listed below are some of the other server(s) that I have worked for in
          the past. This list would normally include 50-60 different servers, so
          instead I am just going to list the most recent servers.
        </p>
      </section>
      <section className="section server-grid">
        {activeServers.map(serverCard)}
      </section>
      <section className="section previous-servers">
        <div className="section-head">
          <div>
            <Mark>Archive</Mark>
            <h2>Previous & inactive community projects</h2>
          </div>
        </div>
        <div className="server-grid">
          {previousServers.map((server, index) => serverCard(server, activeServers.length + index))}
        </div>
      </section>
    </Shell>
  );
}

export function ContactPage() {
  return (
    <Shell showContact={false}>
      <section className="page-hero section">
        <Mark>Contact & commissions</Mark>
        <h1>Let’s turn the idea into a dependable system.</h1>
        <p>
          Message me to discuss an idea, request a plugin, ask a question, or
          get a quick quote. There is no form or sales funnel, just a direct
          conversation about what you need.
        </p>
        <div className="hero-actions">
          <a
            className="button primary"
            href={discord}
            target="_blank"
            rel="noreferrer"
          >
            Message Luna on Discord ↗
          </a>
          <a className="button ghost" href="mailto:2.luna.hook@gmail.com">
            Email Luna
          </a>
          <a
            className="button ghost"
            href="https://www.tiktok.com/@luna.hook"
            target="_blank"
            rel="noreferrer"
          >
            TikTok @luna.hook ↗
          </a>
        </div>
      </section>
      <section className="section split">
        <div>
          <Mark>Technical partnership</Mark>
          <h2>Clear communication before, during, and after the build.</h2>
        </div>
        <div className="prose">
          <p>
            I’m Luna Hook, a high-school developer building Minecraft plugins,
            Discord integrations, server tooling, and community systems around
            real operational needs.
          </p>
          <p>
            My focus is the complete experience: reliable mechanics, practical
            commands, permissions, safe configuration, useful feedback,
            maintainable workflows, and documentation that helps a server team
            run the result confidently. I also operate servers and communities,
            so I approach development from both the player and administrator
            sides.
          </p>
          <p>
            If the idea is still rough, that is fine. We can define the goal,
            identify the important edge cases, and work out the smallest useful
            version before anything is built.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <Mark>Ways to work together</Mark>
            <h2>Start with the outcome.</h2>
          </div>
        </div>
        <div className="plugin-grid">
          <article className="plugin-card">
            <div className="card-top">
              <span className="status public">Custom work</span>
            </div>
            <h3>Plugin development</h3>
            <p>
              New mechanics, server utilities, administration tools, Discord
              connections, or careful changes to an existing system. Share the
              problem, the server context, and what success should look like.
            </p>
          </article>
          <article className="plugin-card">
            <div className="card-top">
              <span className="status private">Commissions</span>
            </div>
            <h3>Scoped developer work</h3>
            <p>
              For work that needs a formal scope, we will agree on the
              deliverable and expectations first. Many requests are free; paid
              work is always discussed upfront at an accessible price.
            </p>
          </article>
          <article className="plugin-card">
            <div className="card-top">
              <span className="beta">Open conversation</span>
            </div>
            <h3>Requests, help & questions</h3>
            <p>
              You can ask about a public plugin, request a JAR, suggest a free
              plugin idea, get help with setup, or simply talk through a
              technical problem. A polished specification is not required.
            </p>
          </article>
        </div>
      </section>
      <section className="contact">
        <div>
          <Mark>Direct contact</Mark>
          <h2>Tell me what you want to build.</h2>
          <p>
            Message me to discuss an idea, request a plugin, ask a question, or
            get a quick quote. Discord is the quickest option, and email is
            available when more detail is useful.
          </p>
        </div>
        <div className="contact-actions">
          <a
            className="button primary"
            href={discord}
            target="_blank"
            rel="noreferrer"
          >
            Direct Discord DM <span>↗</span>
          </a>
          <a href="mailto:2.luna.hook@gmail.com">2.luna.hook@gmail.com</a>
          <a
            href="https://www.tiktok.com/@luna.hook"
            target="_blank"
            rel="noreferrer"
          >
            TikTok @luna.hook ↗
          </a>
          <span className="handle">Discord · lunahook</span>
        </div>
      </section>
    </Shell>
  );
}
