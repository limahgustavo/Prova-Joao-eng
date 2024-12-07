let map;
let autocomplete;
let savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];
let markers = [];

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

function addMarker(lat, lng, description, updateSidebarFlag = true) {
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

    if (updateSidebarFlag) {
        updateSidebar();
    }
}

function generateInfoContent(lat, lng, description) {

    return `
        <div>
            <h3 id="title-${lat}-${lng}">${description}</h3>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lng}</p>
            
        </div>
    `;
}

function saveLocation(lat, lng, description) {
    savedLocations.push({ lat, lng, description });
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    updateSidebar();
}

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

function clearMap() {
    if (confirm("Deseja limpar todos os dados?")) {
        markers.forEach((marker) => marker.setMap(null));
        markers = [];
        savedLocations = [];
        localStorage.removeItem("savedLocations");
        updateSidebar();
    }
}

function exportLocations() {
    
    if(savedLocations == '') {
        window.alert('Não exite endereços cadastrados')
    } else {
        const dataStr = JSON.stringify(savedLocations, null, 2);

        // Cria um blob a partir da string JSON
        const blob = new Blob([dataStr], { type: 'application/json' });
    
        // Cria uma URL para o blob
        const url = URL.createObjectURL(blob);
    
        // Cria um elemento de link para download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'saved_locations.json';
    
        // Simula o clique para iniciar o download
        document.body.appendChild(a);
        a.click();
    
        // Remove o link do DOM após o clique
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
}


window.onload = initMap;
