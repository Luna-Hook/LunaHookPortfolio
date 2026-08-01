"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plugin, plugins, searchText } from "./data/plugins";

const discord = "https://discord.com/users/1344843044905685004";

function Mark({ children }: { children: React.ReactNode }) { return <span className="eyebrow">{children}</span>; }

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="nav-wrap">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">LH</span><span>Luna Hook<small>Developer portfolio</small></span></Link>
        <button className="menu-button" aria-expanded={open} onClick={() => setOpen(!open)}>Menu</button>
        <div className={`nav-links ${open ? "open" : ""}`}>
          <Link href="/">Home</Link><Link href="/plugins">Plugins</Link><Link href="/servers">Servers <i>Beta</i></Link><a href="#contact">Contact</a>
        </div>
      </nav>
    </header>
    <main id="main">{children}</main>
    <Contact />
    <footer><div><b>Luna Hook</b><span>Developer • Minecraft Server Owner • Server Administrator • Community Systems Designer</span></div><p>Built for clarity, safety, and real server work.</p></footer>
  </div>;
}

function Contact() { return <section className="contact" id="contact">
  <div><Mark>Custom work & commissions</Mark><h2>Have an idea worth building?</h2><p>Message me to discuss an idea, request a plugin, ask a question, or get a quick quote. Many requests are free; if a project needs paid work, we’ll discuss it upfront at an accessible price.</p></div>
  <div className="contact-actions"><a className="button primary" href={discord} target="_blank" rel="noreferrer">Message Luna on Discord <span>↗</span></a><a href="mailto:2.luna.hook@gmail.com">2.luna.hook@gmail.com</a><a href="https://www.tiktok.com/@luna.hook" target="_blank" rel="noreferrer">TikTok @luna.hook ↗</a><span className="handle">Discord · lunahook</span></div>
  </section>; }

function PluginCard({ plugin }: { plugin: Plugin }) { return <article className="plugin-card">
  <div className="card-top"><span className={`status ${plugin.status.toLowerCase().replaceAll(" ", "-")}`}>{plugin.status === "Private" ? "Private • Available on Request" : plugin.status === "Security Hold" ? "Public • Security Hold" : plugin.status === "Availability Paused" ? "Private • Availability Paused" : "Public"}</span>{plugin.beta && <span className="beta">Beta</span>}</div>
  <h3><Link href={`/plugins/${plugin.slug}`}>{plugin.name}</Link></h3><p>{plugin.summary}</p>
  <div className="chips"><span>{plugin.category}</span><span>{plugin.scale}</span></div>
  <Link className="text-link" href={`/plugins/${plugin.slug}`}>Open complete guide <span>→</span></Link>
  </article>; }

export function HomePage() {
  const featured = ["supertnt","civilizations","discordconsole","simplebots"].map(s => plugins.find(p => p.slug === s)!);
  return <Shell>
    <section className="hero section"><div className="hero-copy"><Mark>Available for developer work</Mark><h1>Systems built to feel <em>obvious</em> in use.</h1><p className="lede">I’m Luna Hook — a high-school developer focused on dependable Minecraft plugins, Discord integrations, server operations, and community systems that solve real problems.</p><div className="hero-actions"><a className="button primary" href={discord} target="_blank" rel="noreferrer">Discuss a project <span>↗</span></a><Link className="button ghost" href="/plugins">Explore 43 plugins</Link></div><div className="availability"><span></span>Open to custom plugin work, developer work & commissions</div></div>
    <div className="craft-panel" aria-label="Portfolio highlights"><div className="craft-grid">{["Paper","Java","Discord","SQLite","Systems","UX","Config","Security","Ops"].map((x,i)=><span key={x} className={i===4?"center":""}>{x}</span>)}</div><p><b>Professional first.</b> Minecraft-flavored by craft, not costume.</p></div></section>
    <section className="metrics section"><div><strong>43</strong><span>complete plugin guides</span></div><div><strong>32</strong><span>public repositories</span></div><div><strong>11</strong><span>request-only builds</span></div><div><strong>4</strong><span>Build Scale levels</span></div></section>
    <section className="section split"><div><Mark>Technical focus</Mark><h2>From gameplay mechanic to operating system.</h2></div><div className="prose"><p>I design configurable systems with the full operator experience in mind: commands, permissions, safe defaults, workflows, persistence, feedback, recovery, and the edge cases that appear after launch.</p><p>My work ranges from focused quality-of-life mechanics to large combat suites, event engines, Discord bridges, staff tooling, territory systems, analytics, and simulated-player workflows.</p></div></section>
    <section className="section"><div className="section-head"><div><Mark>Selected work</Mark><h2>Featured builds</h2></div><Link className="text-link" href="/plugins">View all plugins <span>→</span></Link></div><div className="plugin-grid featured">{featured.map(p=><PluginCard key={p.slug} plugin={p}/>)}</div></section>
  </Shell>;
}

function score(plugin: Plugin, raw: string) {
  const q = raw.toLowerCase().trim(); if (!q) return 1;
  const text = searchText(plugin); const terms = q.split(/\s+/);
  let result = terms.every(t => text.includes(t)) ? 50 : 0;
  if (plugin.name.toLowerCase().includes(q)) result += 100;
  if (plugin.aliases.some(a => a.toLowerCase().includes(q))) result += 80;
  for (const term of terms) { if (text.includes(term)) result += 10; else if ([...new Set(text.split(/\W+/))].some(w => w.startsWith(term) || term.startsWith(w))) result += 2; }
  return result;
}

export function PluginsPage() {
  const [query,setQuery]=useState(""); const [category,setCategory]=useState("All"); const [scale,setScale]=useState("All"); const [status,setStatus]=useState("All"); const [beta,setBeta]=useState("All"); const [sort,setSort]=useState("Relevance");
  const categories=["All",...Array.from(new Set(plugins.map(p=>p.category))).sort()];
  const results = useMemo(() => plugins
    .map((p) => ({ p, s: score(p, query) }))
    .filter(({ p, s }) => s > 0
      && (category === "All" || p.category === category)
      && (scale === "All" || p.scale === scale)
      && (status === "All" || (status === "Public" ? p.status === "Public" : status === "Private" ? p.status === "Private" : p.status === status))
      && (beta === "All" || (beta === "Beta" ? p.beta : !p.beta)))
    .sort((a, b) => sort === "Name"
      ? a.p.name.localeCompare(b.p.name)
      : sort === "Build Scale"
        ? ["Simple", "Standard", "Advanced", "Large"].indexOf(b.p.scale) - ["Simple", "Standard", "Advanced", "Large"].indexOf(a.p.scale)
        : b.s - a.s)
    .map(({ p }) => p), [query, category, scale, status, beta, sort]);
  return <Shell><section className="page-hero section"><Mark>Plugin index</Mark><h1>Find the right system.</h1><p>Search every documented command, permission, item, recipe, mechanic, workflow, config key, integration and limitation — not just plugin names.</p></section>
  <section className="section catalog"><div className="search-box"><label htmlFor="plugin-search">Search all 43 complete guides</label><div><span>⌕</span><input id="plugin-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder='Try “emoji skin”, “3×3 mining”, or “discord roles”'/><kbd>/</kbd></div></div>
  <div className="filters"><Select label="Category" value={category} set={setCategory} items={categories}/><Select label="Build Scale" value={scale} set={setScale} items={["All","Simple","Standard","Advanced","Large"]}/><Select label="Status" value={status} set={setStatus} items={["All","Public","Private","Security Hold","Availability Paused"]}/><Select label="Release" value={beta} set={setBeta} items={["All","Beta","Stable"]}/><Select label="Sort" value={sort} set={setSort} items={["Relevance","Name","Build Scale"]}/></div>
  <div className="results-line"><b>{results.length} plugin{results.length===1?"":"s"}</b><span>Build Scale reflects footprint and integrations, never quality.</span></div><div className="plugin-grid">{results.map(p=><PluginCard key={p.slug} plugin={p}/>)}</div>{!results.length&&<div className="empty"><h2>No matches yet.</h2><p>Clear a filter or try a broader mechanic, command, or integration.</p></div>}</section></Shell>;
}

function Select({label,value,set,items}:{label:string,value:string,set:(x:string)=>void,items:string[]}) { return <label><span>{label}</span><select value={value} onChange={e=>set(e.target.value)}>{items.map(x=><option key={x}>{x}</option>)}</select></label>; }

function CopyButton({text,label="Copy"}:{text:string,label?:string}) { const [copied,setCopied]=useState(false); return <button className="copy" onClick={async()=>{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1200)}}>{copied?"Copied":label}</button>; }
function ListSection({id,title,items}:{id:string,title:string,items:string[]}) { return <section id={id} className="doc-section"><h2>{title}</h2><ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul></section>; }

export function PluginDetail({ plugin }: { plugin: Plugin }) {
  const configText=Object.entries(plugin.config).map(([section,keys])=>`${section}:\n${keys.map(k=>`  # ${k}`).join("\n")}`).join("\n\n");
  const statusText=plugin.status==="Public"?"Public":plugin.status==="Private"?(plugin.slug==="paradoxweapons"?"Private • Not for Sale":"Private • Available on Request"):plugin.status==="Security Hold"?"Public • Security Hold":"Private • Availability Paused";
  return <Shell><article className="plugin-page"><header className="plugin-hero section"><Link className="back" href="/plugins">← All plugins</Link><div className="card-top"><span className={`status ${plugin.status.toLowerCase().replaceAll(" ", "-")}`}>{statusText}</span>{plugin.beta&&<span className="beta">Beta</span>}<span className="scale">{plugin.scale} Build</span></div><h1>{plugin.name}</h1><p>{plugin.summary}</p><div className="chips">{plugin.tags.map(t=><span key={t}>{t}</span>)}</div><div className="hero-actions">{plugin.github&&<a className="button ghost" href={plugin.github} target="_blank" rel="noreferrer">View source on GitHub ↗</a>}{plugin.requestable!==false&&<a className="button primary" href={discord} target="_blank" rel="noreferrer">{plugin.slug==="paradoxweapons"?"Ask about this plugin":"Request JAR or help"} ↗</a>} {plugin.requestable===false&&<span className="disabled-action">Distribution currently disabled</span>}</div></header>
  <div className="doc-layout section"><aside><b>On this page</b>{[["overview","Overview"],["setup","Setup"],["commands","Commands"],["permissions","Permissions"],["workflows","GUIs & workflows"],["config","Configuration"],["mechanics","Items & mechanics"],["examples","Examples"],["limits","Limits & caveats"]].map(([id,x])=><a href={`#${id}`} key={id}>{x}</a>)}</aside>
  <div className="docs"><section id="overview" className="doc-section"><Mark>{plugin.category}</Mark><h2>Overview & features</h2><p>{plugin.summary}</p><ul>{plugin.features.map((x,i)=><li key={i}>{x}</li>)}</ul><div className="requirements"><b>Requirements & integrations</b><div>{plugin.dependencies.map(x=><span key={x}>{x}</span>)}</div></div>{plugin.attribution&&<div className="notice attribution"><b>Attribution</b><p>{plugin.attribution}</p></div>}</section>
  <ListSection id="setup" title="Setup" items={plugin.setup}/><ListSection id="commands" title="Commands & arguments" items={plugin.commands}/><ListSection id="permissions" title="Permissions & access" items={plugin.permissions}/><ListSection id="workflows" title="GUIs & workflows" items={plugin.workflows}/>
  <section id="config" className="doc-section"><div className="doc-heading"><h2>Safe configuration reference</h2><CopyButton text={configText} label="Copy whole reference"/></div><p className="muted">Keys and behavior labels only. Secrets, live IDs, player data, private endpoints and operational values are excluded.</p>{Object.entries(plugin.config).map(([section,keys])=><div className="config-block" key={section}><div><b>{section}</b><CopyButton text={`${section}:\n${keys.map(k=>`  # ${k}`).join("\n")}`}/></div><pre>{section}:{keys.map(k=><code key={k}>{`\n  # ${k}`}</code>)}</pre></div>)}</section>
  <ListSection id="mechanics" title="Recipes, items & mechanics" items={plugin.mechanics}/><ListSection id="examples" title="Worked examples" items={plugin.examples}/><section id="limits" className="doc-section"><h2>Limits, caveats & verification</h2><div className="notice"><b>Source-backed, not overclaimed</b><p>Details reflect the reviewed source inventory. Anything requiring a live server, external service, load test, or unresolved provenance is stated as a limitation.</p></div><ul>{plugin.limits.map((x,i)=><li key={i}>{x}</li>)}</ul></section>
  </div></div></article></Shell>;
}

export function ServersPage() { const servers=[
  {name:"Paradox FFA",state:"Online",kind:"Public free-for-all",body:"A public combat server and the live home of Paradox Weapons gameplay.",action:"Copy join IP",value:"PARADOXFFA.SERV.CX",href:"#"},
  {name:"Paradox SMP",state:"Applications",kind:"Community survival",body:"Application-based SMP access and community onboarding through Discord.",action:"Apply through Discord",href:"https://discord.gg/buQ9t6y3tf"},
  {name:"Velexis",state:"Temporarily discontinued",kind:"Server archive",body:"Not currently operating. The community Discord remains available for updates and history.",action:"Open Discord",href:"https://discord.gg/UU47qda5Wu"},
  {name:"Corrupted",state:"Temporarily discontinued",kind:"Formerly Shatter",body:"A previous community project retained here as a brief part of Luna's server history.",action:"Open Discord",href:"https://discord.gg/d5JXDF7HRY"},
  ]; return <Shell><section className="page-hero section"><div className="card-top"><Mark>Servers</Mark><span className="beta">Beta · more coming later</span></div><h1>Communities are where systems get real.</h1><p>Selected public servers and a short operational history. Plugin work comes first; this page will grow as active projects do.</p></section><section className="section server-grid">{servers.map((s,i)=><article key={s.name}><div className="server-number">0{i+1}</div><div className="card-top"><span className={s.state==="Online"?"live":"beta"}>{s.state}</span><span>{s.kind}</span></div><h2>{s.name}</h2><p>{s.body}</p>{s.value?<CopyButton text={s.value} label={`${s.action}: ${s.value}`}/>:<a className="button ghost" href={s.href} target="_blank" rel="noreferrer">{s.action} ↗</a>}</article>)}</section></Shell>; }
