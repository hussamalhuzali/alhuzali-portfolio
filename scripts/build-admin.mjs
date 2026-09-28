import {readFile,writeFile,cp,mkdir,rm} from 'node:fs/promises';
const root=new URL('../studio-dist/',import.meta.url);await rm(root,{recursive:true,force:true});await mkdir(root,{recursive:true});await cp(new URL('../studio/',import.meta.url),root,{recursive:true});
for(const name of ['github.mjs','start.mjs']){const u=new URL(name,root);await writeFile(u,(await readFile(u,'utf8')).replaceAll('../src/','./'));}
for(const name of ['schema.mjs','render.mjs'])await cp(new URL('../src/'+name,import.meta.url),new URL(name,root));
for(const name of ['style.css','favicon.svg'])await cp(new URL('../public/'+name,import.meta.url),new URL(name,root));
await cp(new URL('../admin/admin.css',import.meta.url),new URL('admin.css',root));
let js=await readFile(new URL('../admin/admin.js',import.meta.url),'utf8');
js=js.replace("async function api(path,options={}){", "async function api(path,options={}){if(window.portfolioBackend)return window.portfolioBackend.api(path,options);");
js=js.replace("if(w)w.location.href=projectIndex!==null?`/preview/${encodeURIComponent(doc.projects[projectIndex].slug)}/`:'/preview/';", "if(w)await window.portfolioBackend.preview(w,projectIndex!==null?doc.projects[projectIndex].slug:null);");
js=js.replaceAll('Draft saved','Draft saved on this device').replaceAll('Save privately. Preview your changes. Publish when ready.','Drafts stay on this device. Publishing sends selected content and files to the public repository.').replaceAll('Uploaded. Save the draft to keep this reference.','Staged on this device. Save the draft; the file becomes public when referenced in a publication.');
js=js.replaceAll('Last submitted to GitHub:', 'Last publication:').replaceAll('Publishing updates the repository. GitHub builds the public site afterward; the live update can take a few minutes.', 'Your changes may take a few minutes to appear online.').replaceAll('will be sent to GitHub.', 'will be published.').replaceAll('Sent to GitHub. The live site will update after the build completes.', 'Publication started. Your changes will appear shortly.').replaceAll('Drafts stay on this device. Publishing sends selected content and files to the public repository.', 'Save your changes, preview, then publish.');
await writeFile(new URL('admin.js',root),js);await writeFile(new URL('CNAME',root),'admin.alhuzali.com\n');await writeFile(new URL('.nojekyll',root),'');
console.log('Built GitHub-only admin with memory-only credentials and device-local drafts.');
