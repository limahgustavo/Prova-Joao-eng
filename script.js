let map, autocomplete;
let savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];
let markers = [];

/**
 * Inicializa o mapa e configurações iniciais.
 */
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -3.1, lng: -60.02 }, // Manaus
    zoom: 12,
  });

  savedLocations.forEach(({ lat, lng, description }) => addMarker(lat, lng, description, false));

  const addressInput = document.getElementById("addressInput");
  autocomplete = new google.maps.places.Autocomplete(addressInput, {
    types: ["geocode"],
    componentRestrictions: { country: "BR" },
  });

  autocomplete.addListener("place_changed", handlePlaceSelection);
  updateSidebar();
}

/**
 * Lida com a seleção de um local no autocomplete.
 */
function handlePlaceSelection() {
  const place = autocomplete.getPlace();
  if (place.geometry) {
    const { lat, lng } = place.geometry.location.toJSON();
    const description = place.formatted_address || "Local selecionado";

    if (confirm("Deseja adicionar este endereço?")) {
      addMarker(lat, lng, description);
      saveLocation(lat, lng, description);
      document.getElementById("addressInput").value = "";
    }
  }
}

/**
 * Atualiza a barra lateral com os endereços salvos.
 */
function updateSidebar() {
  const sidebar = document.getElementById("savedLocationsList");
  sidebar.innerHTML = savedLocations
    .map(
      ({ lat, lng, description }, index) => `
      <div class="address-item">
        <h4>${description || "Sem título"}</h4>
        <button onclick="focusLocation(${lat}, ${lng})">Centralizar</button>
        <button onclick="removeLocation(${lat}, ${lng})">Remover</button>
      </div>`
    )
    .join("");
}

/**
 * Adiciona um marcador no mapa e configura sua janela de informações.
 */
function addMarker(lat, lng, description) {
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    title: description,
  });

  markers.push(marker);
  marker.addListener("click", () =>
    new google.maps.InfoWindow({
      content: `<h3>${description}</h3><p>Latitude: ${lat}</p><p>Longitude: ${lng}</p>`,
    }).open(map, marker)
  );

  map.setCenter({ lat, lng });
  map.setZoom(15);
}

/**
 * Salva uma localização no localStorage.
 */
function saveLocation(lat, lng, description) {
  savedLocations.push({ lat, lng, description });
  localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  updateSidebar();
}

/**
 * Remove uma localização do mapa e localStorage.
 */
function removeLocation(lat, lng) {
  markers = markers.filter((marker) => {
    if (marker.getPosition().equals(new google.maps.LatLng(lat, lng))) {
      marker.setMap(null);
      return false;
    }
    return true;
  });

  savedLocations = savedLocations.filter((loc) => loc.lat !== lat || loc.lng !== lng);
  localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  updateSidebar();
}

/**
 * Centraliza o mapa na localização especificada.
 */
function focusLocation(lat, lng) {
  map.setCenter({ lat, lng });
  map.setZoom(15);
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
 * Exporta as localizações salvas como JSON.
 */
function exportLocations() {
  if (!savedLocations.length) {
    return alert("Não há endereços cadastrados.");
  }
  const blob = new Blob([JSON.stringify(savedLocations, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "saved_locations.json";
  a.click();
  URL.revokeObjectURL(url);
}

window.onload = initMap();
