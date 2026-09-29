let project=null,panoViewer=null;
let planScale=1,planPanX=0,planPanY=0;
let currentFloorIndex=0;
let currentViewId=null;

const $=id=>document.getElementById(id);

async function loadProject(){
  const r=await fetch('data/project.json?ts='+Date.now());
  if(!r.ok)throw new Error('Cannot load data/project.json');
  project=await r.json();
  $('projectTitle').textContent=project.title||'TRIPT 360';
  const logo=$('logo');
  if(logo){
    logo.src=project.logo||'assets/logos/tript-logo-circle.webp';
    logo.onerror=()=>logo.style.display='none';
  }
  setupFloors();
  renderPlan();
  setupPlanGestures();
}

function setupFloors(){
  const s=$('floorSelect');
  s.innerHTML='';
  (project.floors||[]).forEach((f,i)=>{
    const o=document.createElement('option');
    o.value=i;
    o.textContent=f.name||f.id;
    s.appendChild(o);
  });
  s.value=String(currentFloorIndex);
  s.onchange=()=>{
    currentFloorIndex=Number(s.value)||0;
    resetPlan();
    renderPlan();
  };
}

function renderPlan(){
  const f=project.floors[currentFloorIndex];
  if(!f)return;

  const image=$('planImage');
  image.src=f.plan;

  image.onload=()=>{
    fitPlan();
  };

  const layer=$('markerLayer');
  layer.innerHTML='';

  const views=f.views||[];
  $('planEmpty').classList.toggle('hidden',!views.length);

  views.forEach(v=>{
    const b=document.createElement('button');
    b.className='plan-marker';
    b.style.left=v.x+'%';
    b.style.top=v.y+'%';
    b.title=v.name||'360 View';

    b.innerHTML=
      `<span class="marker-arrow" style="transform:rotate(${Number(v.heading||0)}deg)">▲</span>`+
      `<span class="marker-dot"></span>`+
      `<span class="marker-label">${esc(v.name||'360 View')}</span>`;

    b.onclick=()=>openView(v);
    layer.appendChild(b);
  });

  applyPlanTransform();
}

function fitPlan(){
  const viewport=$('planViewport');
  const canvas=$('planCanvas');
  const image=$('planImage');
  if(!image.naturalWidth||!image.naturalHeight)return;

  const availableW=Math.max(80,viewport.clientWidth-16);
  const availableH=Math.max(80,viewport.clientHeight-16);
  const scale=Math.min(
    availableW/image.naturalWidth,
    availableH/image.naturalHeight
  );

  canvas.style.width=image.naturalWidth+'px';
  canvas.style.height=image.naturalHeight+'px';

  planScale=Math.min(scale,1);
  planPanX=0;
  planPanY=0;
  applyPlanTransform();
}

function resetPlan(){
  fitPlan();
}

function applyPlanTransform(){
  const canvas=$('planCanvas');
  canvas.style.transform=
    `translate(${planPanX}px,${planPanY}px) scale(${planScale})`;
}

function setupPlanGestures(){
  const viewport=$('planViewport');

  let dragging=false;
  let startX=0,startY=0;
  let baseX=0,baseY=0;
  let pinchStartDistance=null;
  let pinchStartScale=1;

  viewport.addEventListener('wheel',e=>{
    e.preventDefault();
    planScale=clamp(
      planScale*(e.deltaY<0?1.08:0.92),
      0.25,
      5
    );
    applyPlanTransform();
  },{passive:false});

  viewport.addEventListener('pointerdown',e=>{
    if(e.target.closest('.plan-marker'))return;
    if(e.pointerType==='mouse'&&e.button!==0&&e.button!==1)return;

    dragging=true;
    startX=e.clientX;
    startY=e.clientY;
    baseX=planPanX;
    baseY=planPanY;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove',e=>{
    if(!dragging)return;
    planPanX=baseX+e.clientX-startX;
    planPanY=baseY+e.clientY-startY;
    applyPlanTransform();
  });

  viewport.addEventListener('pointerup',()=>dragging=false);
  viewport.addEventListener('pointercancel',()=>dragging=false);

  viewport.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      pinchStartDistance=distance(e.touches[0],e.touches[1]);
      pinchStartScale=planScale;
    }
  },{passive:true});

  viewport.addEventListener('touchmove',e=>{
    if(e.touches.length===2&&pinchStartDistance){
      const d=distance(e.touches[0],e.touches[1]);
      planScale=clamp(
        pinchStartScale*d/pinchStartDistance,
        0.25,
        5
      );
      applyPlanTransform();
    }
  },{passive:true});

  viewport.addEventListener('touchend',()=>pinchStartDistance=null);

  window.addEventListener('resize',()=>{
    clearTimeout(window.__triptResizeTimer);
    window.__triptResizeTimer=setTimeout(()=>{
      if(planScale<=1.01)fitPlan();
    },120);
  });
}

function openView(v){
  if(!v)return;

  currentViewId=v.id||null;
  $('planScreen').classList.add('hidden');
  $('viewerScreen').classList.remove('hidden');
  $('backPlan').classList.remove('hidden');

  $('viewTitle').textContent=v.name||'360 View';
  buildViewerNavigation();

  const path=v.panorama;
  if(!path){
    console.error('No panorama assigned to view:',v);
    alert(`No panorama is assigned to "${v.name||'this view'}".`);
    return;
  }

  if(panoViewer){
    panoViewer.destroy();
    panoViewer=null;
  }

  panoViewer=pannellum.viewer('pano',{
    type:'equirectangular',
    panorama:path,
    autoLoad:true,
    showControls:true,
    yaw:Number(v.heading)||0,
    pitch:0,
    hfov:100
  });
}

function buildViewerNavigation(){
  const nav=$('bottomNav');
  if(!nav)return;

  nav.innerHTML='';
  const floor=project?.floors?.[currentFloorIndex];
  const views=floor?.views||[];

  const planButton=document.createElement('button');
  planButton.className='nav-btn plan-nav-btn';
  planButton.textContent='Plan';
  planButton.onclick=showPlan;
  nav.appendChild(planButton);

  views.forEach(v=>{
    const button=document.createElement('button');
    button.className='nav-btn';
    if((v.id||null)===currentViewId)button.classList.add('active');
    button.dataset.viewId=v.id||'';
    button.textContent=v.name||'360 View';
    button.onclick=()=>openView(v);
    nav.appendChild(button);
  });

  nav.scrollLeft=0;
}

function showPlan(){
  if(panoViewer){
    panoViewer.destroy();
    panoViewer=null;
  }
  currentViewId=null;
  $('viewerScreen').classList.add('hidden');
  $('planScreen').classList.remove('hidden');
  $('backPlan').classList.add('hidden');
  renderPlan();
}

$('backPlan').onclick=showPlan;

function distance(a,b){
  return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
}
function clamp(n,a,b){
  return Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
}
function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

window.addEventListener('load',()=>loadProject().catch(e=>{
  console.error(e);
  alert(e.message);
}));
