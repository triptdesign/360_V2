function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'view';
}

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}

function getFloor(project, floorId) {
  return project.floors.find(floor => floor.id === floorId) || project.floors[0];
}

function getScene(sceneId) {
  return (window.PANORAMA_SCENES || []).find(scene => scene.id === sceneId);
}

function downloadText(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
