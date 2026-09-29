async function initializeApp() {
  try {
    const response = await fetch('data/project.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    window.TRIPT_PROJECT = await response.json();
  } catch (error) {
    if (!window.TRIPT_PROJECT) {
      alert('data/project.json is missing or invalid.');
      return;
    }
  }
  if (!Array.isArray(window.TRIPT_PROJECT.floors)) {
    alert('Project data is invalid.');
    return;
  }
  document.getElementById('projectTitle').textContent = window.TRIPT_PROJECT.title || 'TRIPT 360';
  createViewer();
  createNavigation();
  initPlan();
  document.getElementById('backToPlan').onclick = showPlan;
}

document.addEventListener('DOMContentLoaded', initializeApp);
