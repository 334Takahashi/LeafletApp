var mapElement = document.getElementById('map');

// 初期座標
var center = [35.16066808015237, 136.92640764889583];
// 初期ズームレベル
var zoom_level = 14;

var map = L.map(mapElement,{closePopupOnClick: false}).setView(center, zoom_level);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

const redIcon = L.icon({
  iconUrl: "https://esm.sh/leaflet@1.9.2/dist/images/marker-icon.png",
  iconRetinaUrl: "https://esm.sh/leaflet@1.9.2/dist/images/marker-icon-2x.png",
  shadowUrl: "https://esm.sh/leaflet@1.9.2/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  className: "icon-red",
});

var points = [];
var startPoint = [];
var endPoint = [];
var markerType = "start";
var startMarker;
var endMarker;
var button1Active = false;

// マウスクリックで緯度経度の取得とマーカー設置
function onMapClick(e) {
  switch(markerType) {
    case "start":
      if(startMarker) {
        map.removeLayer(startMarker);
      }
      startMarker = L.marker(e.latlng,{ icon: redIcon }).on('click', onStartMarkerClick).addTo(map)
                      .bindPopup('出発地点',{autoClose:false}).openPopup();
      startPoint = [e.latlng.lat, e.latlng.lng];
      break;
    case "location":
      L.marker(e.latlng).on('click', onMarkerClick).addTo(map);
      points.push([e.latlng.lat, e.latlng.lng]);
      break;
    case "end":
      if(endMarker) {
          map.removeLayer(endMarker);
        }
        endMarker = L.marker(e.latlng,{ icon: redIcon }).on('click', onEndMarkerClick).addTo(map)
                      .bindPopup('到着地点',{autoClose:false}).openPopup();
        endPoint = [e.latlng.lat, e.latlng.lng];
      break;
    default:
      break;
  }
}
map.on('click', onMapClick);

//マーカーをクリックしたら削除
function onMarkerClick(e) {
  var index = points.findIndex( item => JSON.stringify( item ) ===
                                  JSON.stringify([e.target.getLatLng().lat, e.target.getLatLng().lng]));
  console.log(index);
  if (index > -1){
    points.splice(index, 1)
  }
  map.removeLayer(e.target);
}

function onStartMarkerClick(e) {
  startPoint = [];
  map.removeLayer(e.target);
}

function onEndMarkerClick(e) {
  endPoint = [];
  map.removeLayer(e.target);
}

// ボタン1のクリックイベント
$('#button1').click(function() {
  button1Active = !button1Active; // 状態を反転させる

  if (button1Active) {
    $(this).addClass('active'); // ボタンが押されている表示にする
    var requestData = {
            points:points,
            startPoint:startPoint,
            endPoint:endPoint
        };
    $.ajax({
        url: '/process_ajax',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        success: function(response) {
            var path = response.path;
            // 経路を表示
            polyline = L.polyline(path, { color: 'red' })
            polyline.addTo(map);
        }
    });

  } else {
    $(this).removeClass('active'); // ボタンが押されていない表示にする
    if (polyline) {
      map.removeLayer(polyline); // polyline を地図から削除
    }
  }
});

var mamlistboxdiv;
var mamlistboxa;
var mamlistbox;
var mamlistbox_active=false;
window.addEventListener("load",function(){
  mamlistboxdiv=document.querySelector(".mamListBox>a>div");
  mamlistboxa=document.querySelector(".mamListBox>a");
  mamlistbox=document.querySelector(".mamListBox>select");
  mamlistboxa.addEventListener("click",function(event){
    if(mamlistbox_active==false){
      mamlistbox.style.display = "block";
      mamlistbox_active=true;
      mamlistbox.focus();
    }else{
      mamlistbox_active=false;
    }
  });
  mamlistbox.addEventListener("blur",function(){
    mamlistbox.style.display = "none";
  });
  mamlistbox.addEventListener("click",function(){
    mamlistboxdiv.innerHTML = mamlistbox.querySelectorAll('option')[mamlistbox.selectedIndex].innerHTML;
    mamlistbox_active=false;
    mamlistbox.blur();
    markerType = mamlistbox.value;
  });
  document.documentElement.addEventListener("click",mamListboxOtherClick);
});
function mamListboxOtherClick(event){
  if(event.target==mamlistboxdiv){return;}
  if(event.target==mamlistboxa){return;}
  if(event.target==mamlistbox){return;}
  mamlistbox_active=false;
}
