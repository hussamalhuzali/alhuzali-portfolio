import {readFile,mkdir,writeFile,cp,rm} from 'node:fs/promises';
import {home,projects,detail,shell,e} from '../src/render.mjs';
import {validatePortfolio,publicPortfolio} from '../src/schema.mjs';
const source=JSON.parse(await readFile(new URL('../content/portfolio.json',import.meta.url),'utf8'));
validatePortfolio(source);const d=publicPortfolio(source);
const base=(process.env.SITE_BASE_PATH||'').replace(/\/$/,'');
if(base&&!/^\/[a-zA-Z0-9_/-]+$/.test(base))throw new Error('Invalid site base path');
const root=new URL('../dist/',import.meta.url);await rm(root,{recursive:true,force:true});await mkdir(new URL('assets/',root),{recursive:true});
await cp(new URL('../public/',import.meta.url),new URL('assets/',root),{recursive:true});
const write=async(path,body)=>{const u=new URL(path,root);await mkdir(new URL('./',u),{recursive:true});await writeFile(u,path.endsWith('.html')&&base?body.replace(/(href|src)="\/(?!\/)/g,`$1="${base}/`).replace(/content="0;url=\//g,`content="0;url=${base}/`):body)};
await write('index.html',shell(d,home(d),`${d.profile.name} — Business, Data & Delivery`,d.profile.summary));
await write('projects/index.html',shell(d,projects(d),`Projects — ${d.profile.name}`,'Explore professional case studies and interactive reports.','/projects/'));
for(const p of d.projects){await write(`${p.slug}/index.html`,shell(d,detail(d,p),`${p.title} — ${d.profile.name}`,p.brief,`/${p.slug}/`));for(const old of p.previousSlugs||[])await write(`${old}/index.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/${e(p.slug)}/"><link rel="canonical" href="https://alhuzali.com/${e(p.slug)}/"><title>Project moved</title></head><body><a href="/${e(p.slug)}/">Continue to ${e(p.title)}</a></body></html>`)}
await write('404.html',shell(d,`<main class="container section"><span class="eyebrow">PAGE NOT FOUND</span><h1>Let’s find your way.</h1><p>This page may have moved or is no longer available.</p><a class="button primary" href="/projects/">Explore projects</a> <a class="button secondary" href="/">Portfolio home</a></main>`,`Page not found — ${d.profile.name}`,'Explore the portfolio.'));
await write('robots.txt','User-agent: *\nAllow: /\nSitemap: https://alhuzali.com/sitemap.xml\n');
await write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','projects/',...d.projects.map(p=>p.slug+'/')].map(p=>`<url><loc>https://alhuzali.com/${e(p)}</loc></url>`).join('')}</urlset>`);
await write('.nojekyll','');
await mkdir(new URL('../admin/assets/',import.meta.url),{recursive:true});await cp(new URL('../public/style.css',import.meta.url),new URL('../admin/assets/style.css',import.meta.url));await cp(new URL('../public/site.js',import.meta.url),new URL('../admin/assets/site.js',import.meta.url));await cp(new URL('../public/favicon.svg',import.meta.url),new URL('../admin/assets/favicon.svg',import.meta.url));
console.log(`Built homepage, project library, ${d.projects.length} project pages, redirects, sitemap and admin assets.`);

// GitHub-only studio is also reachable from the main domain.
await import('./build-admin.mjs');
await cp(new URL('../studio-dist/',import.meta.url),new URL('admin/',root),{recursive:true});
await rm(new URL('admin/CNAME',root));
