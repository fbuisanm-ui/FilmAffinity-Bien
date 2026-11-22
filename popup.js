// Función para cargar el estado de los checkboxes desde el almacenamiento local
document.addEventListener('DOMContentLoaded', () => {


  // Cargar el estado del checkbox para ocultar películas bloqueadas
  chrome.storage.sync.get('hideBlockedMovies', (data) => {
    document.getElementById('toggleEffects').checked = data.hideBlockedMovies;
  });

  // Cargar el estado del checkbox para ocultar películas valoradas
  chrome.storage.sync.get('hideValoradasMovies', (data) => {
    document.getElementById('toggleValoradas').checked = data.hideValoradasMovies;
  });

  // Cargar el estado del checkbox para ocultar por crítica
  chrome.storage.sync.get('hideCriticaMovies', (data) => {
    document.getElementById('toggleCritica').checked = data.hideCriticaMovies;
  });
});




// Guardar el estado del checkbox y enviar un mensaje al contenido para aplicar el cambio (películas bloqueadas)
document.getElementById('toggleEffects').addEventListener('change', (event) => {
  const hideBlockedMovies = event.target.checked;
  chrome.storage.sync.set({ hideBlockedMovies: hideBlockedMovies }, () => {
    // Enviar un mensaje al contenido para aplicar el cambio inmediatamente
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'updateVisibilityBlocked' });
    });
  });
});

// Guardar el estado del checkbox y enviar un mensaje al contenido para aplicar el cambio (películas valoradas)
document.getElementById('toggleValoradas').addEventListener('change', (event) => {
  const hideValoradasMovies = event.target.checked;
  chrome.storage.sync.set({ hideValoradasMovies: hideValoradasMovies }, () => {
    // Enviar un mensaje al contenido para aplicar el cambio inmediatamente
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'updateVisibilityValoradas' });
    });
  });
});

// Guardar el estado del checkbox y enviar un mensaje al contenido para aplicar el cambio (ocultar por crítica)
document.getElementById('toggleCritica').addEventListener('change', (event) => {
  const hideCriticaMovies = event.target.checked;
  chrome.storage.sync.set({ hideCriticaMovies: hideCriticaMovies }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'updateVisibilityCritica' });
    });
  });
});
