//		DB y ObjectStores				  __________________


//Control de la visibilidad

function applyPluginChanges() {
    updateVisibilityBlocked();
    updateVisibilityValoradas();
    updateVisibilityCritica();
}
// Create a MutationObserver instance
const observer = new MutationObserver((mutationsList, observer) => {
    applyPluginChanges(); //Call applyPluginChanges when changes are detected
});

// Configure the observer
const config = {
    childList: true, // Watch for additions/removals of children
    subtree: true, // Watch for changes in all descendants
};

// Start observing the target node (the body) for configured mutations
observer.observe(document.body, config);

// Modify the functions to call applyPluginChanges
function updateVisibilityBlocked() {
  chrome.storage.sync.get('hideBlockedMovies', (data) => {
    if (data.hideBlockedMovies) {
      getBlockedTitles(hideBlockedMovies);  // Ocultar bloqueadas
    } else {
      getBlockedTitles(showBlockedMovies);  // Mostrar bloqueadas
    }
  });
}

function updateVisibilityValoradas() {
  chrome.storage.sync.get('hideValoradasMovies', (data) => {
    if (data.hideValoradasMovies) {
      hideValoradasMovies();	// Ocultar Valoradas
    } else {
      showValoradasMovies();	// Mostrar Valoradas
    }
  });
}

function updateVisibilityCritica() {
  chrome.storage.sync.get('hideCriticaMovies', (data) => {
    if (data.hideCriticaMovies) {
      hideCriticaMovies();  // Ocultar por crítica
    } else {
      showMoviesByCritica();  // Mostrar películas ocultadas por crítica
    }
  });
}

// Add the call to applyPluginChanges at the end of the file
applyPluginChanges()





// Llamar a la función para crear la base de datos al cargar el plugin

createDatabase();

function createDatabase() {
  if (!window.indexedDB) {
    console.log("IndexedDB no está soportado por tu navegador.");
    return;
  }

  const request = indexedDB.open("FilmAffinityDB", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    // Verificar si no existe "BlockedMovies" y crearlo

    if (!db.objectStoreNames.contains("BlockedMovies")) {
      db.createObjectStore("BlockedMovies", { keyPath: "id", autoIncrement: true });
      console.log("ObjectStore 'BlockedMovies' creado.");
    }

    // Verificar si no existe "ProRate" y crearlo

    if (!db.objectStoreNames.contains("ProRate")) {
      db.createObjectStore("ProRate", { keyPath: "title" });  // Usamos 'title' como keyPath
      console.log("ObjectStore 'ProRate' creado.");
    }
  };

  request.onsuccess = function (event) {
    console.log("Base de datos 'FilmAffinityDB' abierta correctamente.");
  };

  request.onerror = function (event) {
    console.error("Error al abrir la base de datos:", event.target.errorCode);
  };
}







//		Agregar a IndexedDB				__________________




// Variable Clic BlockedMovies

let clickedElement = null;

// Captura Clic BlockedMovies

document.addEventListener("contextmenu", function (event) {
  const movieElement = event.target.closest(".movie-card");
  if (movieElement) {
    clickedElement = movieElement; // Guardar el elemento de la película
  }
});

// Agregar a BlockedMovies

function addBlockedMovie(movieTitle) {
  const request = indexedDB.open("FilmAffinityDB", 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(["BlockedMovies"], "readwrite");
    const store = transaction.objectStore("BlockedMovies");

    const movie = { title: movieTitle };
    const addRequest = store.add(movie);

    addRequest.onsuccess = function () {
      console.log(`Película "${movieTitle}" añadida a BlockedMovies.`);
    };

    addRequest.onerror = function () {
      console.error("Error al añadir la película:", addRequest.error);
    };
  };

  request.onerror = function (event) {
    console.error("Error al abrir la base de datos:", event.target.errorCode);
  };
}





//		Obtención de IndexedDB				__________________





// Obtener títulos BlockedMovies

function getBlockedTitles(callback) {
  const request = indexedDB.open("FilmAffinityDB", 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(["BlockedMovies"], "readonly");
    const store = transaction.objectStore("BlockedMovies");

    // Obtener todos los registros
    const allTitlesRequest = store.getAll();

    allTitlesRequest.onsuccess = function () {
      const titles = allTitlesRequest.result.map(record => record.title.trim()); // Trim para asegurar coincidencias exactas
      callback(titles);
    };
    allTitlesRequest.onerror = function () {
      console.error("Error al obtener los títulos de la base de datos:", allTitlesRequest.error);
    };
  };

  request.onerror = function (event) {
    console.error("Error al abrir la base de datos:", event.target.errorCode);
  };
}


// Obtener títulos ProRate

function hideCriticaMovies() {
  const request = indexedDB.open("FilmAffinityDB", 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(["ProRate"], "readonly");
    const store = transaction.objectStore("ProRate");

    const allRatingsRequest = store.getAll();

    allRatingsRequest.onsuccess = function () {
      const records = allRatingsRequest.result;
      const titlesToHide = records
        .filter(record => record.WeightResult <= 0)
        .map(record => record.title.trim());

      hideMoviesByCritica(titlesToHide);
    };

    allRatingsRequest.onerror = function () {
      console.error("Error al obtener los títulos de la base de datos:", allRatingsRequest.error);
    };
  };

  request.onerror = function (event) {
    console.error("Error al abrir la base de datos:", event.target.errorCode);
  };
}





//		Funciones de ocultar / mostrar				__________________





// Ocultar Valoradas

function hideValoradasMovies() {
  // Condition 1: Hide parent 'ul' elements of elements with class 'avgrat-box-ur'
  const peliculasValoradas = document.querySelectorAll('.avgrat-box-ur');
  peliculasValoradas.forEach((element) => {
    const peliculaItem = element.closest('ul');
    if (peliculaItem) {
      peliculaItem.style.display = 'none';
    }
  });

  // Condition 2: Hide parent elements with 'data-movie-id' of elements with class 'ms-auto ms-md-3'
  const elementsWithMsAuto = document.querySelectorAll('.ms-auto.ms-md-3');
  elementsWithMsAuto.forEach((element) => {
    const movieElement = element.closest('li[data-movie-id]');
    if (movieElement) {
      movieElement.style.display = 'none';
    }
  });
}


// Mostrar Valoradas

function showValoradasMovies() {
  // Condition 1: Show parent 'ul' elements of elements with class 'avgrat-box-ur'
  const peliculasValoradas = document.querySelectorAll('.avgrat-box-ur');
  peliculasValoradas.forEach((element) => {
    const peliculaItem = element.closest('ul');
    if (peliculaItem) {
      peliculaItem.style.display = '';
    }
  });

  // Condition 2: Show parent elements with 'data-movie-id' of elements with class 'ms-auto ms-md-3'
  const elementsWithMsAuto = document.querySelectorAll('.ms-auto.ms-md-3');
  elementsWithMsAuto.forEach((element) => {
    const movieElement = element.closest('li[data-movie-id]');
    if (movieElement) {
      movieElement.style.display = '';
    }
  });
}




// Ocultar Bloqueadas

function hideBlockedMovies(titles) {
  const topMoviesContainer = document.getElementById("top-movies");
  if (!topMoviesContainer) {
    console.error("No se encontró el contenedor de películas con id='top-movies'");
    return;
  }
  const movieLists = topMoviesContainer.querySelectorAll("ul");
  movieLists.forEach(ul => {
    const titleElement = ul.querySelector(".mc-title a");

    if (titleElement) {
      const movieTitle = titleElement.textContent.trim();
      if (titles.includes(movieTitle)) {
        ul.style.display = "none";
      }
    }
  });
}

// Mostrar Bloqueadas

function showBlockedMovies(titles) {
  // Seleccionar el contenedor <ul id="top-movies">
  const topMoviesContainer = document.getElementById("top-movies");

  if (!topMoviesContainer) {
    console.error("No se encontró el contenedor de películas con id='top-movies'");
    return;
  }
  // Seleccionar todos los elementos <ul> individuales dentro del contenedor
  const movieLists = topMoviesContainer.querySelectorAll("ul");

  movieLists.forEach(ul => {
    // Verificar si el <ul> tiene un título de película
    const titleElement = ul.querySelector(".mc-title a");

    if (titleElement) {
      const movieTitle = titleElement.textContent.trim(); // Obtener y limpiar el título de la película

      // Si el título de la película está en la lista de títulos bloqueados, mostrar el <ul>
      if (titles.includes(movieTitle)) {
        ul.style.display = ""; // Restablecer el estilo para mostrar el <ul> que fue bloqueado
        console.log(`Mostrando película bloqueada: ${movieTitle}`); // Depuración
      }
    }
  });
}



//Ocultar por Crítica 

function hideMoviesByCritica(titles) {
  const topMoviesContainer = document.getElementById("top-movies");

  if (!topMoviesContainer) {
    console.error("No se encontró el contenedor de películas con id='top-movies'");
    return;
  }

  const movieLists = topMoviesContainer.querySelectorAll("ul");

  movieLists.forEach(ul => {
    const titleElement = ul.querySelector(".mc-title a");

    if (titleElement) {
      const movieTitle = titleElement.textContent.trim();

      if (titles.includes(movieTitle)) {
        ul.dataset.hiddenByCritica = "true";  // Marcar el elemento como oculto por crítica
        ul.style.display = "none"; // Ocultar el elemento
        console.log(`Ocultando película por mala crítica: ${movieTitle}`);
      }
    }
  });
}

// Mostrar por Crítica 

function showMoviesByCritica() {
  const topMoviesContainer = document.getElementById("top-movies");

  if (!topMoviesContainer) {
    console.error("No se encontró el contenedor de películas con id='top-movies'");
    return;
  }

  const movieLists = topMoviesContainer.querySelectorAll("ul");

  movieLists.forEach(ul => {
    if (ul.dataset.hiddenByCritica === "true") {
      ul.style.display = ""; // Restaurar visibilidad
      delete ul.dataset.hiddenByCritica;  // Eliminar el marcado de oculto
      console.log(`Mostrando película ocultada por crítica: ${ul.querySelector(".mc-title a").textContent.trim()}`);
    }
  });
}





// 		Actualizar estado de los Checkbox			__________________________


// Inicializar el estado de visibilidad de los checkboxes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  updateVisibilityBlocked();  // Verifica el estado del checkbox de películas bloqueadas
  updateVisibilityValoradas();  // Verifica el estado del checkbox de películas valoradas
  updateVisibilityCritica();  // Verifica el estado del checkbox de películas con mala crítica
});


// Checkbox Bloqueadas

function updateVisibilityBlocked() {
  chrome.storage.sync.get('hideBlockedMovies', (data) => {
    if (data.hideBlockedMovies) {
      getBlockedTitles(hideBlockedMovies);  // Ocultar bloqueadas
    } else {
      getBlockedTitles(showBlockedMovies);  // Mostrar bloqueadas
    }
  });
}


// Checkbox Valoradas

function updateVisibilityValoradas() {
  chrome.storage.sync.get('hideValoradasMovies', (data) => {
    if (data.hideValoradasMovies) {
      hideValoradasMovies();	// Ocultar Valoradas
    } else {
      showValoradasMovies();	// Mostrar Valoradas
    }
  });
}


// Checkbox de Crítica

function updateVisibilityCritica() {
  chrome.storage.sync.get('hideCriticaMovies', (data) => {
    if (data.hideCriticaMovies) {
      hideCriticaMovies();  // Ocultar por crítica
    } else {
      showMoviesByCritica();  // Mostrar películas ocultadas por crítica
    }
  });
}







//		Escuchar mensajes desde background.js y el popup		________________________





chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "addToBlockedMovies" && clickedElement) {
    const movieTitle = clickedElement.querySelector(".mc-title a").textContent.trim();
    addBlockedMovie(movieTitle);
    clickedElement = null;
  } else if (message.action === "updateVisibilityBlocked") {
    updateVisibilityBlocked();
  } else if (message.action === "updateVisibilityValoradas") {
    updateVisibilityValoradas();
  } else if (message.action === "updateVisibilityCritica") {
    updateVisibilityCritica();
  }
});
