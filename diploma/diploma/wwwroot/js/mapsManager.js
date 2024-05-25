let map;
let markers = [];

// Ініціалізація карти
function initMap() {
    // Створення карти, центрованої на заданих координатах (Сідней, Австралія)
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13
    });

    // Ініціалізація автозаповнення для всіх існуючих полів
    document.querySelectorAll('.search-input').forEach(function(input) {
        rb_autocompleteInit(input);
    });

    autocompleteInit();
}

// Функція автозаповнення для стандартного поля
function autocompleteInit() {
    var autocompleteService = new google.maps.places.AutocompleteService();
    var input = document.getElementById('searchInput');
    var suggestionsList = document.getElementById('sb-suggestions');

    input.addEventListener('input', function() {
        var query = input.value;
        
        // Виклик автозаповнення
        autocompleteService.getPlacePredictions({ input: query, types: ['geocode', 'establishment'] }, function(predictions, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Очищення попередніх підказок
                suggestionsList.innerHTML = '';

                // Створення нових підказок і додавання їх до списку
                predictions.forEach(function(prediction) {
                    var listItem = document.createElement('li');
                    listItem.textContent = prediction.description;
                    suggestionsList.appendChild(listItem);

                    // Обробник кліка для вибору підказки
                    listItem.addEventListener('click', function() {
                        input.value = prediction.description;
                        searchPlace(input.value);
                        $('.route-builder').toggleClass('route-builder-active');
                        var inputValue = $('#searchInput').val(); // Отримання значення поля вводу
                         $('.route-builder .search-input:first').val(inputValue);
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

// Функція автозаповнення для динамічних полів
function rb_autocompleteInit(input) {
    var autocompleteService = new google.maps.places.AutocompleteService();
    var suggestionsList = document.querySelector('.rb-suggestions');

    input.addEventListener('input', function() {
        var query = input.value;

        // Виклик автозаповнення
        autocompleteService.getPlacePredictions({ input: query, types: ['geocode', 'establishment'] }, function(predictions, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Очищення попередніх підказок
                suggestionsList.innerHTML = '';

                // Створення нових підказок і додавання їх до списку
                predictions.forEach(function(prediction) {
                    var listItem = document.createElement('li');
                    listItem.textContent = prediction.description;
                    suggestionsList.appendChild(listItem);

                    // Обробник кліка для вибору підказки
                    listItem.addEventListener('click', function() {
                        input.value = prediction.description;
                        searchPlace(input.value);
                        suggestionsList.innerHTML = '';
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
                    saveCoordinates(1,1);
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

$(document).ready(function () {
    // Обробник події keydown для стандартного поля вводу
    $('.search-box-input').keydown(function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            var inputValue = $('#searchInput').val(); // Отримання значення поля вводу
            searchPlace(inputValue);
            $('.route-builder').toggleClass('route-builder-active');
        }
    });

    // Обробник події click для кнопки пошуку
    $('.search-box-btn').click(function (e) {
        e.preventDefault();
        var inputValue = $('#searchInput').val(); // Отримання значення поля вводу
        searchPlace(inputValue);
        $('.route-builder').toggleClass('route-builder-active');
    });
});

$(document).on('keydown', '.search-input', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var inputValue = $(this).val(); // Отримання значення поточного поля вводу
        searchPlace(inputValue);
    }
});

// Функція для збереження координат
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


function drawRoute(coords){

    // Создание DirectionsService и DirectionsRenderer
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer({
      map: map
    });
  
    // Создание массива точек назначения
    var waypoints = [];
    for (var i = 0; i < coords.length; i++) {
      waypoints.push({
        location: new google.maps.LatLng(coords[i].lat, coords[i].lng),
        stopover: true
      });
    }
  
    // Запрос маршрута с точками назначения
    var request = {
      origin: new google.maps.LatLng(coords[0].lat, coords[0].lng), // Начальная точка
      destination: new google.maps.LatLng(coords[coords.length - 1].lat, coords[coords.length - 1].lng), // Конечная точка
      waypoints: waypoints.slice(1, -1), // Промежуточные точки (отбрасываем начальную и конечную)
      travelMode: 'DRIVING' // Режим перемещения (DRIVING - автомобиль)
    };
  
    // Отправка запроса маршрута
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        // Отображение маршрута на карте
        directionsRenderer.setDirections(result);
      }
    });
  }
  