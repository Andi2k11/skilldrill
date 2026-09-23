const fs = require('fs');
const path = require('path');

const exercisesDir = path.resolve(__dirname, '..', 'exercises');
const outDir = path.resolve(__dirname, '..', 'pages');
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function readExercises(){
  const files = fs.readdirSync(exercisesDir).filter(f=>f.endsWith('.json'));
  return files.map(f=>{
    const p = path.join(exercisesDir,f);
    const json = JSON.parse(fs.readFileSync(p,'utf8'));
    return Object.assign({ _file: f }, json);
  });
}

function buildManifest(exs){
  const manifest = exs.map(e=>{
    const filename = e._file;
    const slug = filename.replace(/\.json$/i,'');
    return { id: e.id, slug: slug, title: e.title, book: e.book, chapter: e.chapter, path: 'exercises/'+filename };
  });
  fs.writeFileSync(path.join(exercisesDir,'manifest.json'), JSON.stringify(manifest,null,2),'utf8');
  return manifest;
}

function buildHtml(manifest){
  // Group by book -> chapter
  const byBook = {};
  manifest.forEach(item=>{
    byBook[item.book] = byBook[item.book] || {};
    byBook[item.book][item.chapter] = byBook[item.book][item.chapter] || [];
    byBook[item.book][item.chapter].push(item);
  });

  let html = `<!doctype html><html><head><meta charset="utf-8"><title>Exercise links</title><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-4"><div class="container"><h1>Övningar</h1>`;
  Object.keys(byBook).sort().forEach(book=>{
    html += `<h2 class="mt-4">${book}</h2>`;
    Object.keys(byBook[book]).sort((a,b)=>a-b).forEach(ch=>{
      html += `<h3>Kapitel ${ch}</h3><div class="row">`;
      byBook[book][ch].forEach(item=>{
        // Link should open the exercise viewer with a query param, not the raw JSON file.
        // Use the original JSON filename (without .json) as the exercise param so viewer receives the filename
        var filename = item.path.replace(/\\/g,'/').split('/').pop();
        var slug = filename.replace(/\.json$/i,'');
        // pages/exercises.html lives in /pages/, so link to the site index with a ../ prefix
        const viewerUrl = `../?exercise=${encodeURIComponent(slug)}`;
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(viewerUrl)}`;
        html += `<div class="col-md-4 mb-3"><div class="card"><div class="card-body"><h5 class="card-title">${item.title}</h5><p class="card-text"><a target="_blank" rel="noopener noreferrer" href="${viewerUrl}">Öppna</a></p><img src="${qr}" alt="QR for ${item.id}" /></div></div></div>`;
      });
      html += `</div>`;
    });
  });
  html += `</div></body></html>`;
  fs.writeFileSync(path.join(outDir,'exercises.html'), html, 'utf8');
}

function main(){
  const exs = readExercises();
  const manifest = buildManifest(exs);
  buildHtml(manifest);
  console.log('Built exercises/manifest.json and pages/exercises.html');
}

main();
