import { notFound } from "next/navigation";
import { pluginBySlug, plugins } from "../../data/plugins";
import { PluginDetail } from "../../ui";
export function generateStaticParams(){ return plugins.map(({slug})=>({slug})); }
export default async function Page({params}:{params:Promise<{slug:string}>}){ const {slug}=await params; const plugin=pluginBySlug.get(slug); if(!plugin) notFound(); return <PluginDetail plugin={plugin}/>; }
