const http=require('node:http'), fs=require('node:fs'),path=require('node:path');
const {compile}=require('./renderer.cjs');
const handler=require('./handler.cjs');
compile();
const root=path.resolve(__dirname,'../..');
const mime={'.css':'text/css','.js':'text/javascript','.webp':'image/webp','.ttf':'font/ttf','.txt':'text/plain'};
const port=Number(process.env.PORT || 9393);
http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const mappings={'/assets/':'assets','/preview-fonts/':'tools/preview/fonts','/demo/':'tools/demo/client'};
  for(const [prefix,folder] of Object.entries(mappings)) if(pathname.startsWith(prefix)) {
    const directory=path.resolve(root,folder),file=path.resolve(directory,decodeURIComponent(pathname.slice(prefix.length)));
    if(!file.startsWith(directory+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end('Not found');}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');return fs.createReadStream(file).pipe(res);
  }
  if(pathname==='/robots.txt'){res.setHeader('Content-Type','text/plain');return res.end('User-agent: *\nDisallow: /\n');}
  return handler(req,res);
}).listen(port,'127.0.0.1',()=>console.log('Eloir demo: http://127.0.0.1:'+port));
