let activeProject=null;
let activeFloorId=null;
let planScale=1;
let planPanX=0;
let planPanY=0;

function getProject(){return cloneProject(activeProject||window.TRIPT_PROJECT);}
function initPlan(){
  activeProject=cloneProject(window.TRIPT_PROJECT);
  activeFloorId=activeProject.floors[0]?.id;
  populateFloors();
  renderPlan();
  setupPlanGestures();
}
function populateFloors(){
  const select=document.getElementById('floorSelect');
  select.innerHTML='';
  activeProject.floors.forEach(floor=>{
    const option=document.createElement('option');
    option.value=floor.id;
    option.textContent=floor.name;
    select.appendChild(option);
  });
  select.value=activeFloorId;
  select.onchange=()=>{
    activeFloorId=select.value;
    resetPlanTransform();
    renderPlan();
  };
}
function renderPlan(){
  const floor=getFloor(activeProject,activeFloorId);
  const viewport=document.getElementById('planViewport');
  const stage=document.getElementById('planCanvas');
  const image=document.getElementById('planImage');

  image.src=floor.plan;
  image.onerror=()=>document.getElementById('planEmpty').classList.remove('hidden');
  image.onload=()=>{
    document.getElementById('planEmpty').classList.add('hidden');
    fitPlanToViewport();
  };

  const layer=document.getElementById('markerLayer');
  layer.innerHTML='';

  (floor.views||[]).forEach(view=>{
    const scene=getScene(view.sceneId);
    if(!scene)return;

    const marker=document.createElement('button');
    marker.className='plan-marker';
    marker.style.left=`${view.x}%`;
    marker.style.top=`${view.y}%`;
    marker.title=view.title;
    marker.dataset.sceneId=view.sceneId;
    marker.innerHTML=
      `<span class="marker-arrow" style="transform:rotate(${Number(view.heading||0)}deg)">▲</span>`+
      `<span class="marker-dot"></span>`+
      `<span class="marker-label">${escapeHtml(view.title)}</span>`;

    marker.addEventListener('click',()=>openPlanScene(view));
    layer.appendChild(marker);
  });

  applyPlanTransform();
}

function fitPlanToViewport(){
  const viewport=document.getElementById('planViewport');
  const image=document.getElementById('planImage');
  if(!image.naturalWidth)return;

  const maxW=viewport.clientWidth-24;
  const maxH=viewport.clientHeight-24;
  const fit=Math.min(maxW/image.naturalWidth,maxH/image.naturalHeight);
  planScale=clamp(fit,0.1,4);
  planPanX=0;
  planPanY=0;

  const stage=document.getElementById('planCanvas');
  stage.style.width=image.naturalWidth+'px';
  stage.style.height=image.naturalHeight+'px';
  applyPlanTransform();
}

function openPlanScene(view){
  document.getElementById('planScreen').classList.add('hidden');
  document.getElementById('viewerScreen').classList.remove('hidden');
  openViewer(view.sceneId,view.heading);
}

function resetPlanTransform(){
  planScale=1;
  planPanX=0;
  planPanY=0;
  fitPlanToViewport();
}

function applyPlanTransform(){
  const stage=document.getElementById('planCanvas');
  if(!stage)return;
  stage.style.transform=`translate(${planPanX}px,${planPanY}px) scale(${planScale})`;
}

function setupPlanGestures(){
  const viewport=document.getElementById('planViewport');
  let dragging=false,startX=0,startY=0,startPanX=0,startPanY=0;
  let pinchStartDistance=null,pinchStartScale=1;

  viewport.addEventListener('wheel',e=>{
    e.preventDefault();
    const factor=e.deltaY<0?1.08:0.92;
    planScale=clamp(planScale*factor,0.25,5);
    applyPlanTransform();
  },{passive:false});

  viewport.addEventListener('pointerdown',e=>{
    if(e.target.closest('.plan-marker'))return;
    if(e.pointerType==='mouse'&&e.button!==0&&e.button!==1)return;
    dragging=true;
    startX=e.clientX;
    startY=e.clientY;
    startPanX=planPanX;
    startPanY=planPanY;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove',e=>{
    if(!dragging)return;
    planPanX=startPanX+e.clientX-startX;
    planPanY=startPanY+e.clientY-startY;
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
      planScale=clamp(pinchStartScale*d/pinchStartDistance,0.25,5);
      applyPlanTransform();
    }
  },{passive:true});

  viewport.addEventListener('touchend',()=>pinchStartDistance=null);

  window.addEventListener('resize',()=>{
    clearTimeout(window.__planResizeTimer);
    window.__planResizeTimer=setTimeout(()=>{
      const wasAtBase=planScale<=1.01;
      if(wasAtBase)fitPlanToViewport();
    },120);
  });
}

function distance(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function showPlan(){
  document.getElementById('viewerScreen').classList.add('hidden');
  document.getElementById('planScreen').classList.remove('hidden');
  renderPlan();
}
