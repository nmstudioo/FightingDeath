(()=>{
'use strict';
const BANDCAMP_ALBUM_ID='';
const BANDCAMP_URL='https://limoon.bandcamp.com/album/fighting-death';
const YT_PLAYLIST='PLE7xqQB69sf6MtY6PxdStT8oVcuOkUtPK';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const desktop=matchMedia('(min-width:900px)');

const header=$('#topnav');
const toggle=$('#navToggle');
const nav=$('#chapterNav');
const readingBar=$('#readingBar');
const backTop=$('#backTop');
const links=$$('a[data-s]',nav||document);
const targets=links.map(a=>document.getElementById(a.dataset.s)).filter(Boolean);
let currentId=null;
let ticking=false;

const setOpen=open=>{
if(!toggle||!nav)return;
toggle.classList.toggle('open',open);
nav.classList.toggle('open',open);
toggle.setAttribute('aria-expanded',String(open));
toggle.setAttribute('aria-label',open?'Close chapters menu':'Open chapters menu');
};

const activate=id=>{
if(id===currentId)return;
currentId=id;
links.forEach(a=>{
const on=a.dataset.s===id;
a.classList.toggle('active',on);
if(on)a.setAttribute('aria-current','true');
else a.removeAttribute('aria-current');
});
const a=links.find(l=>l.dataset.s===id);
if(a&&desktop.matches){
nav.scrollTo({left:a.offsetLeft-(nav.clientWidth-a.offsetWidth)/2,behavior:reduce.matches?'auto':'smooth'});
}
};

const onScroll=()=>{
const max=document.documentElement.scrollHeight-innerHeight;
if(readingBar)readingBar.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';
if(backTop)backTop.classList.toggle('visible',scrollY>innerHeight*.8);
if(header)header.classList.toggle('scrolled',scrollY>8);
const line=(header?header.offsetHeight:0)+innerHeight*.25;
let id=targets[0]&&targets[0].id;
for(const t of targets){if(t.getBoundingClientRect().top<=line)id=t.id}
if(scrollY<innerHeight*.5)id=null;
activate(id);
};

const requestTick=()=>{
if(ticking)return;
ticking=true;
requestAnimationFrame(()=>{onScroll();ticking=false});
};

if(toggle&&nav){
toggle.addEventListener('click',()=>setOpen(!nav.classList.contains('open')));
links.forEach(a=>a.addEventListener('click',()=>{if(!desktop.matches)setOpen(false)}));
document.addEventListener('keydown',e=>{
if(e.key==='Escape'&&nav.classList.contains('open')){setOpen(false);toggle.focus()}
});
document.addEventListener('click',e=>{
if(nav.classList.contains('open')&&!header.contains(e.target))setOpen(false);
});
desktop.addEventListener('change',e=>{if(e.matches)setOpen(false)});
}

if(header&&'ResizeObserver' in window){
const setHeight=()=>document.documentElement.style.setProperty('--nav-live',header.offsetHeight+'px');
setHeight();
new ResizeObserver(setHeight).observe(header);
}

addEventListener('scroll',requestTick,{passive:true});
addEventListener('resize',requestTick);
onScroll();

const revealEls=$$('.reveal');
const show=el=>{
el.classList.add('visible');
if(el.classList.contains('chapter-head'))el.classList.add('vis');
};
if('IntersectionObserver' in window&&!reduce.matches){
const io=new IntersectionObserver(entries=>{
entries.forEach(e=>{
if(e.isIntersecting){show(e.target);io.unobserve(e.target)}
});
},{rootMargin:'0px 0px -8% 0px',threshold:.08});
revealEls.forEach(el=>io.observe(el));
}else{
revealEls.forEach(show);
}

const listen=$('#listen');
const playerTitle=$('#playerTitle');
const playerNow=$('#playerNow');
const tabs={bandcamp:$('#tab-bandcamp'),youtube:$('#tab-youtube')};
const panes={bandcamp:$('#pane-bandcamp'),youtube:$('#pane-youtube')};
const trackBtns=$$('.track');
const stage=$('.player-stage');
const frames={};

const setPlaying=(on,label,btn)=>{
if(playerTitle)playerTitle.classList.toggle('playing',on);
if(listen)listen.classList.toggle('is-playing',on);
if(label&&playerNow)playerNow.textContent=label;
trackBtns.forEach(b=>b.classList.toggle('playing',on&&b===btn));
};

const showTab=key=>{
Object.keys(tabs).forEach(k=>{
const on=k===key;
if(tabs[k]){
tabs[k].classList.toggle('active',on);
tabs[k].setAttribute('aria-pressed',String(on));
}
if(panes[k])panes[k].classList.toggle('active',on);
});
};

const makeFrame=(src,title)=>{
const f=document.createElement('iframe');
f.src=src;
f.title=title;
f.loading='lazy';
f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
f.setAttribute('allowfullscreen','');
f.referrerPolicy='strict-origin-when-cross-origin';
return f;
};

const loadBandcamp=()=>{
showTab('bandcamp');
if(!BANDCAMP_ALBUM_ID){
window.open(BANDCAMP_URL,'_blank','noopener');
return;
}
if(!frames.bandcamp){
frames.bandcamp=makeFrame('https://bandcamp.com/EmbeddedPlayer/album='+BANDCAMP_ALBUM_ID+'/size=large/bgcol=0c0a0a/linkcol=d2432f/tracklist=false/artwork=small/transparent=true/','Fighting Death on Bandcamp');
panes.bandcamp.replaceChildren(frames.bandcamp);
}
setPlaying(true,'Fighting Death — full album',null);
if(stage)stage.scrollIntoView({block:'nearest',behavior:reduce.matches?'auto':'smooth'});
};

const ytSrc=id=>'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1&modestbranding=1';
const ytListSrc='https://www.youtube-nocookie.com/embed/videoseries?list='+YT_PLAYLIST+'&autoplay=1&rel=0&playsinline=1';

const loadYouTube=(src,label,btn)=>{
showTab('youtube');
if(frames.youtube){
frames.youtube.src=src;
}else{
frames.youtube=makeFrame(src,'Fighting Death on YouTube');
panes.youtube.replaceChildren(frames.youtube);
}
setPlaying(true,label||'Fighting Death — YouTube playlist',btn||null);
if(stage)stage.scrollIntoView({block:'nearest',behavior:reduce.matches?'auto':'smooth'});
};

if(tabs.bandcamp)tabs.bandcamp.addEventListener('click',()=>showTab('bandcamp'));
if(tabs.youtube)tabs.youtube.addEventListener('click',()=>showTab('youtube'));

const facadeB=$('#facadeBandcamp');
const facadeY=$('#facadeYouTube');
const coverPlay=$('#coverPlay');
if(facadeB)facadeB.addEventListener('click',loadBandcamp);
if(facadeY)facadeY.addEventListener('click',()=>loadYouTube(ytListSrc));
if(coverPlay)coverPlay.addEventListener('click',loadBandcamp);

$$('[data-yt]').forEach(el=>{
el.addEventListener('click',()=>{
const label=(el.dataset.np||'').replace(/^Now playing\s*—\s*/,'');
loadYouTube(ytSrc(el.dataset.yt),label,el.classList.contains('track')?el:null);
});
});

document.addEventListener('keydown',e=>{
if(e.key!=='Escape'&&e.key!=='Enter')return;
});
})();
