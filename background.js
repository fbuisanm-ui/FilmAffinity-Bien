// Crear un menú contextual al hacer clic derecho
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToBlockedMovies",
    title: "Añadir a BlockedMovies",
    contexts: ["all"]
  });
});

// Escuchar cuando se selecciona la opción en el menú contextual
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToBlockedMovies") {
    // Enviar un mensaje al contenido de la pestaña activa
    chrome.tabs.sendMessage(tab.id, { action: "addToBlockedMovies" });
  }
});



