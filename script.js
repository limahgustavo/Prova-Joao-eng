let map;
let autocomplete;
let savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];
let markers = [];

/**
 * Inicializa o mapa, configura o autocomplete para o campo de endereço,
 * e exibe os marcadores previamente salvos no localStorage.
 * 
 * Exemplo:
 * - Carrega um mapa centralizado em Manaus.
 * - Preenche o mapa com marcadores salvos e permite adicionar novos endereços.
 */
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -3.1, lng: -60.02 }, // Manaus
    zoom: 13,
  });

  savedLocations.forEach((location) => {
    addMarker(location.lat, location.lng, location.description, false);
  });

  const addressInput = document.getElementById("addressInput");
  autocomplete = new google.maps.places.Autocomplete(addressInput);

  autocomplete.setOptions({
    types: ["geocode"],
    componentRestrictions: { country: "BR" },
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const description = place.formatted_address || "Local selecionado";

      if (confirm("Deseja adicionar este endereço?")) {
        addMarker(lat, lng, description);
        saveLocation(lat, lng, description);
        addressInput.value = "";
      }
    }
  });
  updateSidebar();
}

/**
 * Atualiza a lista de endereços salvos exibida na barra lateral.
 * 
 * Exemplo:
 * - Exibe uma lista de endereços com opções de centralizar o mapa ou remover o endereço.
 */
function updateSidebar() {
  const sidebar = document.getElementById("savedLocationsList");
  sidebar.innerHTML = "";

  savedLocations.forEach((location, index) => {
    const addressDiv = document.createElement("div");
    addressDiv.classList.add("address-item");

    const addressTitle = document.createElement("h4");
    addressTitle.textContent = location.description || "Sem título";
    addressDiv.appendChild(addressTitle);

    const centerButton = document.createElement("button");
    centerButton.textContent = "Centralizar";
    centerButton.onclick = () => {
      map.setCenter({ lat: location.lat, lng: location.lng });
      map.setZoom(15);
    };
    addressDiv.appendChild(centerButton);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remover";
    removeButton.onclick = () => {
      removeMarker(location.lat, location.lng);
    };
    addressDiv.appendChild(removeButton);

    sidebar.appendChild(addressDiv);
  });
}

/**
 * Adiciona um marcador no mapa na localização especificada.
 * 
 * @param {number} lat - Latitude do local.
 * @param {number} lng - Longitude do local.
 * @param {string} description - Descrição do marcador.
 * 
 * Exemplo:
 * - Adiciona um marcador com descrição "Escritório" em (-3.1, -60.02).
 */
function addMarker(lat, lng, description) {
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: map,
    title: description,
  });

  markers.push(marker);

  const infoWindow = new google.maps.InfoWindow({
    content: generateInfoContent(lat, lng, description),
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });

  map.setCenter({ lat, lng });
  map.setZoom(15);
  updateSidebar();
}

/**
 * Gera o conteúdo para a janela de informações de um marcador.
 * 
 * @param {number} lat - Latitude do marcador.
 * @param {number} lng - Longitude do marcador.
 * @param {string} description - Descrição do marcador.
 * 
 * Exemplo:
 * - Exibe informações detalhadas como latitude, longitude e descrição.
 */
function generateInfoContent(lat, lng, description) {
  return `
        <div>
            <h3>Informações sobre localização</h3>
            <h3 id="title-${lat}-${lng}">${description}</h3>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lng}</p>
        </div>
    `;
}

/**
 * Salva a localização no localStorage e atualiza a barra lateral.
 * 
 * @param {number} lat - Latitude do local.
 * @param {number} lng - Longitude do local.
 * @param {string} description - Descrição do local.
 */
function saveLocation(lat, lng, description) {
  savedLocations.push({ lat, lng, description });
  localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  updateSidebar();
}

/**
 * Remove um marcador do mapa e do localStorage.
 * 
 * @param {number} lat - Latitude do marcador a ser removido.
 * @param {number} lng - Longitude do marcador a ser removido.
 */
function removeMarker(lat, lng) {
  const markerIndex = markers.findIndex(
    (marker) =>
      marker.position.lat() === parseFloat(lat) &&
      marker.position.lng() === parseFloat(lng)
  );

  if (markerIndex !== -1) {
    markers[markerIndex].setMap(null);
    markers.splice(markerIndex, 1);
  }

  const locationIndex = savedLocations.findIndex(
    (loc) => loc.lat == lat && loc.lng == lng
  );

  if (locationIndex !== -1) {
    savedLocations.splice(locationIndex, 1);
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  }

  updateSidebar();
}

/**
 * Remove todos os marcadores e limpa os dados salvos.
 */
function clearMap() {
  if (confirm("Deseja limpar todos os dados?")) {
    markers.forEach((marker) => marker.setMap(null));
    markers = [];
    savedLocations = [];
    localStorage.removeItem("savedLocations");
    updateSidebar();
  }
}


/**
 * Exporta as localizações salvas como um arquivo JSON.
 */
function exportLocations() {
  if (savedLocations == "") {
    window.alert("Não exite endereços cadastrados");
  } else {
    const dataStr = JSON.stringify(savedLocations, null, 2);

    // Cria um blob a partir da string JSON
    const blob = new Blob([dataStr], { type: "application/json" });

    // Cria uma URL para o blob
    const url = URL.createObjectURL(blob);

    // Cria um elemento de link para download
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved_locations.json";

    // Simula o clique para iniciar o download
    document.body.appendChild(a);
    a.click();

    // Remove o link do DOM após o clique
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

window.onload = initMap;
