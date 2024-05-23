let map;
let markers = [];

function initMap() {
    // Создание карты, центрированной на заданных координатах (Сидней, Австралия)
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13
    });
}

function searchPlace() {
    const input = $('#searchInput').val();
    const service = new google.maps.places.PlacesService(map);

    // Очистка старых маркеров
    // markers.forEach(marker => marker.setMap(null));
    // markers = [];

    // Если ввод в формате координат
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
        map.setZoom(15); // Устанавливаем масштаб для координат
    } else {
        // Поиск по текстовому запросу
        service.textSearch({ query: input }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                if (results.length == 0) {
                    return;
                }

                // Для каждого найденного места создаем маркер на карте
                const bounds = new google.maps.LatLngBounds();
                results.forEach(place => {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    // Создание маркера для места
                    const marker = new google.maps.Marker({
                        map,
                        position: place.geometry.location,
                        title: place.name
                    });

                    markers.push(marker);

                    // Расширение границ карты до включения местоположения
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

$(document).ready(function() {
    // Обработчик события keydown для поля ввода
    $('#searchInput').keydown(function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // предотвратить стандартное поведение формы при нажатии Enter
            searchPlace();
        }
    });

    // Обработчик события click для кнопки поиска
    $('#searchButton').click(function() {
        searchPlace();
    });
});

$('.menu-btn').on('click', function(e){
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');
})

$('.close-menu-btn').on('click', function(e){
    e.preventDefault();
    $('.menu').toggleClass('menu-active');
    $('.overlay').toggleClass('overlay-active');
    
})

$('.overlay').click(function() {
    $('.overlay').toggleClass('overlay-active');
    $('.menu').toggleClass('menu-active');
});




