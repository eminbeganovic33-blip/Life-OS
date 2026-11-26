const puppeteer=require(process.argv[2]); const fs=require('fs'); const svgs=JSON.parse(fs.readFileSync(process.argv[3])); const OUT=process.argv[4];
fs.mkdirSync(OUT,{recursive:true});
(async()=>{ const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',timeout:120000,protocolTimeout:300000});
 const p=await b.newPage(); await p.goto('about:blank'); let total=0;
 for (const [name,svg] of Object.entries(svgs)){
   const data=await p.evaluate(async svg=>{ const img=new Image(); img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); await img.decode(); const c=document.createElement('canvas'); c.width=c.height=128; c.getContext('2d').drawImage(img,0,0,128,128); return c.toDataURL('image/webp',0.86); }, svg);
   const buf=Buffer.from(data.split(',')[1],'base64'); total+=buf.length; fs.writeFileSync(`${OUT}/${name}.webp`,buf);
 }
 console.log('wrote',Object.keys(svgs).length,'files, total KB',Math.round(total/1024)); await b.close(); })().catch(e=>{console.error(e);process.exit(1)});
