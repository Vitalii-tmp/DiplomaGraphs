const colors = [
    'red',
    'blue',
    'green',
    'orange',
    'purple',
    'yellow',
    'pink',
    'cyan',
    'magenta',
    'lime'
];
const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let map;
let markers = [];
var directionsRenderer;
// Зберігання посилань на всі DirectionsRenderer
const directionsRenderers = [];
let trafficLayer;



// Ініціалізація карти
function initMap() {
    // Створення карти, центрованої на заданих координатах (Сідней, Австралія)
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13,
        mapTypeControl: false,
        zoomControl: false,
        fullscreenControl: false
    });

    // Ініціалізація DirectionsRenderer один раз
    // Ініціалізація DirectionsRenderer
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        polylineOptions: {
            strokeColor: 'red', // Колір лінії маршруту
            strokeOpacity: 0.6, // Прозорість лінії маршруту
            strokeWeight: 6 // Товщина лінії маршруту
        }
    });

    //   // Ініціалізація TrafficLayer для відображення пробок
    //   trafficLayer = new google.maps.TrafficLayer();
    //   trafficLayer.setMap(map);
    autocompleteInit();

    var input = document.getElementById('finishPoint');
    var routeBuilderItem = input.closest('.route-builder-item');
    var suggestionsList = routeBuilderItem.querySelector('.sb-suggestions');

    rb_autocompleteInit(input,suggestionsList, 'uk'); // Для української
    rb_autocompleteInit(input,suggestionsList, 'en'); // Для англійської

    // const controlDiv = document.createElement('div');
    // createCustomControl(controlDiv, map);
    // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);

    // switchMap();
}


// Функція автозаповнення для стандартного поля
function autocompleteInit() {
    var autocompleteService = new google.maps.places.AutocompleteService();
    var input = document.getElementById('startPoint');
    var routeBuilderItem = input.closest('.route-builder-item');
    var suggestionsList = routeBuilderItem.querySelector('.sb-suggestions');

    input.addEventListener('input', function () {   
        var query = input.value;    
        
        // Виклик автозаповнення    
        autocompleteService.getPlacePredictions({ input: query, types: ['geocode', 'establishment'] }, function (predictions, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Очищення попередніх підказок
                suggestionsList.innerHTML = '';

                // Створення нових підказок і додавання їх до списку
                predictions.forEach(function (prediction) {
                    var listItem = document.createElement('li');
                    listItem.textContent = prediction.description;
                    suggestionsList.appendChild(listItem);

                    // Обробник кліка для вибору підказки
                    listItem.addEventListener('click', function () {
                        input.value = prediction.description;
                        searchPlace(input.value);
                        
                    });
                });
            } else {
                // Якщо немає підказок, відображаємо повідомлення
                suggestionsList.innerHTML = '';
                var notFoundItem = document.createElement('li');
                notFoundItem.textContent = "Не знайдено";
                suggestionsList.appendChild(notFoundItem);
            }
        });
    });
}

// Функція автозаповнення для створених полів

function rb_autocompleteInit(input, suggestions, lang) {
    var autocompleteService = new google.maps.places.AutocompleteService();

    input.addEventListener('input', function () {
        var query = input.value;

        // Виклик автозаповнення з параметром мови
        autocompleteService.getPlacePredictions({
            input: query,
            types: ['geocode', 'establishment'],
            language: lang // Додаємо параметр мови
        }, function (predictions, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Очищення попередніх підказок
                suggestions.innerHTML = '';

                // Створення нових підказок і додавання їх до списку
                predictions.forEach(function (prediction) {
                    var listItem = document.createElement('li');
                    listItem.textContent = prediction.description;
                    suggestions.appendChild(listItem);

                    // Обробник кліка для вибору підказки
                    listItem.addEventListener('click', function () {
                        input.value = prediction.description;
                        searchPlace(input.value);
                        // suggestions.innerHTML = '';
                    });
                });
            } else {
                // Якщо немає підказок, відображаємо повідомлення
                suggestions.innerHTML = '';
                var notFoundItem = document.createElement('li');
                notFoundItem.textContent = "Не знайдено";
                suggestions.appendChild(notFoundItem);
            }
        });
    });
}


// Функція пошуку місця
function searchPlace(address) {
    const input = address;
    const service = new google.maps.places.PlacesService(map);

    // Очистка старих маркерів
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // Перевірка, чи введено координати
    const coordinatePattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (coordinatePattern.test(input)) {
        const coords = input.split(',');
        const latLng = new google.maps.LatLng(parseFloat(coords[0]), parseFloat(coords[1]));
        const marker = new google.maps.Marker({
            map,
            position: latLng,
            title: "Custom Location"
        });
        markers.push(marker);
        map.setCenter(latLng);
        map.setZoom(15);
    } else {
        // Пошук по текстовому запиту
        service.textSearch({ query: input }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                if (results.length == 0) {
                    return;
                }

                // Створення маркерів для знайдених місць
                const bounds = new google.maps.LatLngBounds();
                results.forEach(place => {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    const marker = new google.maps.Marker({
                        map,
                        position: place.geometry.location,
                        title: place.name
                    });
                    saveCoordinates(1, 1);
                    markers.push(marker);

                    // Розширення меж карти для відображення всіх маркерів
                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                map.fitBounds(bounds);
            } else {
                console.error('Error occurred: ', status);
            }
        });
    }

}

// Функція для збереження координат ТЕСТ AJAX
function saveCoordinates(latitude, longitude) {
    $.ajax({
        url: '/Coordinates/Save',
        method: 'POST',
        data: { latitude: latitude, longitude: longitude },
        success: function (response) {
            if (response.success) {
                console.log(response.message);
            } else {
                alert('Помилка при збереженні координат');
            }
        },
        error: function (xhr, status, error) {
            console.error('Помилка при збереженні координат:', error);
        }
    });
}

//Функція для малювання маршруту ТЕСТОВА
function drawRoute(coords) {
    // Створення DirectionsService
    const directionsService = new google.maps.DirectionsService();

    // Створення масиву точок призначення
    const waypoints = [];
    for (let i = 0; i < coords.length; i++) {
        waypoints.push({
            location: new google.maps.LatLng(coords[i].lat, coords[i].lng),
            stopover: true,
        });
    }

    // Запит маршруту з точками призначення
    const request = {
        origin: new google.maps.LatLng(coords[0].lat, coords[0].lng), // Початкова точка
        destination: new google.maps.LatLng(coords[coords.length - 1].lat, coords[coords.length - 1].lng), // Кінцева точка
        waypoints: waypoints.slice(1, -1), // Проміжні точки (відкидаємо початкову та кінцеву)
        travelMode: 'DRIVING', // Режим переміщення (DRIVING - автомобіль),
        provideRouteAlternatives: true, // Надання альтернативних маршрутів
    };

    // Очищення попереднього маршруту
    directionsRenderer.set('directions', null);

    // Відправка запиту маршруту
    directionsService.route(request, function (result, status) {
        if (status === 'OK') {
            // Відображення маршруту на карті
            directionsRenderer.setDirections(result);


        }
    });

}



// Функція для додавання маркера з буквою
function addMarker(position, label, map, markersArray) {
    const marker = new google.maps.Marker({
        position: position,
        label: label,
        map: map
    });
    markers.push(marker); // Додаємо маркер до масиву
}

//Функція для малювання частини маршруту (між двома точками)
function drawRouteSegment(start, end, color, map, labelStart, labelEnd) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // Вимкнення автоматичних маркерів
        polylineOptions: {
            strokeColor: color,
            strokeOpacity: 0.6,
            strokeWeight: 6
        }
    });
    directionsRenderers.push(directionsRenderer); // Додавання до масиву для подальшого очищення
    const request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    };

    directionsService.route(request, function (result, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);

            // Додаємо маркери з буквами
            addMarker(start, labelStart, map);
            addMarker(end, labelEnd, map);
        }
    });
}

//Функція для малювання всього маршруту різними кольорами
function drawMultiColoredRoute(coords, colors, map) {
    clearMarkers();
    clearAllDirectionsRenderers();
    for (let i = 0; i < coords.length - 1; i++) {
        const start = new google.maps.LatLng(coords[i].lat, coords[i].lng);
        const end = new google.maps.LatLng(coords[i + 1].lat, coords[i + 1].lng);
        const color = colors[i % colors.length]; // Використовуйте кольори по колу
        const labelStart = labels[i % labels.length]; // Використовуйте букви по колу
        const labelEnd = labels[(i + 1) % labels.length]; // Наступна буква

        drawRouteSegment(start, end, color, map, labelStart, labelEnd);
    }
    
}

//видалення всіх маркерів
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

//очищення всіх рендерерів
function clearAllDirectionsRenderers() {
    directionsRenderers.forEach(renderer => {
        renderer.setMap(null); // Видалення DirectionsRenderer з карти
    });
    directionsRenderers.length = 0; // Очищення масиву посилань
}

