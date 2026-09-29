function createNavigation() {
  const bottomNav = document.getElementById('bottomNav');
  const navLeft = document.getElementById('navLeft');
  const navRight = document.getElementById('navRight');
  bottomNav.innerHTML = '';
  (window.PANORAMA_SCENES || []).forEach(scene => {
    const button = document.createElement('button');
    button.className = 'nav-btn';
    button.dataset.sceneId = scene.id;
    button.textContent = scene.title;
    button.onclick = () => openViewer(scene.id, 0);
    bottomNav.appendChild(button);
  });
  navLeft.onclick = () => bottomNav.scrollBy({ left: -250, behavior: 'smooth' });
  navRight.onclick = () => bottomNav.scrollBy({ left: 250, behavior: 'smooth' });
  bottomNav.addEventListener('wheel', e => { e.preventDefault(); bottomNav.scrollLeft += e.deltaY; }, { passive: false });
}
