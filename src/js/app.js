// VARIABLES
let fromInput = document.querySelector("#fromInput"),
    toInput = document.querySelector("#toInput"),
    showRouteBtn = document.querySelector("#showRoute"),
    routesHistory = document.querySelector("#routesHistory"),
    alertsBox = document.querySelector("#alerts-box"),
    modalTitle = document.querySelector("#mapModalLabel");

// HANDLERS
const handlers = {
  showRoute: (from, to) => {
    let start  = fromInput.value;
    let finish = toInput.value;
    if(start === "" || finish === "") {
      let alert = document.createElement("div");
      alert.classList = 'alert alert-danger';
      alert.setAttribute("role", "alert");
      alert.innerHTML = `
        Please fill in the fields.<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true" style="color: black">&times;</span>
      </button>
      `;
      alertsBox.appendChild(alert);
      handlers.alertTimeout();
      showRouteBtn.removeAttribute("data-toggle");
    } else {
      modalTitle.textContent = `Route from ${start} to ${finish}`;
      initMap(start, finish);
      handlers.addToLocalStorage(start, finish);
      fromInput.value = "";
      toInput.value = "";
    }
  },
  openHistory: (e) => {
    let from = e.parentElement.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.textContent;
    let to = e.parentElement.previousSibling.textContent;
    handlers.openModal(from, to);
  },
  openModal: (start, finish) => {
    modalTitle.textContent = `Route from ${start} to ${finish}`;
    initMap(start, finish);
    $('#mapModal').modal('show');
  },
  removeHistory: (e) => {
    let from = e.parentElement.previousSibling.previousSibling.previousSibling.previousSibling.previousSibling.textContent;
    let to = e.parentElement.previousSibling.textContent;
    let card = e.parentElement.parentElement.parentElement.parentElement;
    handlers.removeFromLocalStorage(from, to);
    card.remove();
  },
  removeFromLocalStorage: (from, to) => {
    let savedData = JSON.parse(localStorage.getItem("history"));
    for(var i=0; i < savedData.length; i++) {
      if(savedData[i].from === from && savedData[i].to === to)
      {
        savedData.splice(i,1);
      }
    }
    if (savedData.length < 1){
      localStorage.clear();
    } else {
      localStorage.setItem("history", JSON.stringify(savedData));
    }
  },
  addToLocalStorage: (start, finish) => {
    let args = {
      from: start,
      to: finish
    };
    let newData = [];
    if(start === "" || finish === "") {
      let alert = document.createElement("div");
      alert.classList = 'alert alert-danger';
      alert.setAttribute("role", "alert");
      alert.innerHTML = `
        Please fill in the fields.<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true" style="color: black">&times;</span>
      </button>
      `;
      alertsBox.appendChild(alert);
      handlers.alertTimeout();
      showRouteBtn.removeAttribute("data-toggle");
    } else {
      showRouteBtn.setAttribute("data-toggle", "modal");
      if (localStorage.getItem("history") === null) {
        newData.push(args);
        localStorage.setItem("history", JSON.stringify(newData));
      } else {
        let savedData = JSON.parse(localStorage.getItem("history"));
        for (data in savedData) {
          if (data.from === start && data.to === finish) {
            return null;
          } else {
            savedData.push(args);
            localStorage.setItem("history", JSON.stringify(savedData));
          }
        };
      }  
    }  
  },
  alertTimeout: () => {
    setTimeout(() => {
      $(".alert").fadeTo(500, 0).slideUp(500, function(){
        $(this).remove(); 
      });
    }, 3000)
  },
  displayHistory: () => {
    if (localStorage.getItem("history") === null) {
      let alert = document.createElement("div");
      alert.classList = 'alert alert-warning';
      alert.setAttribute("role", "alert");
      alert.innerHTML = `
        Your Routes History is empty.<button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true" style="color: black">&times;</span>
      </button>
      `;
      alertsBox.appendChild(alert);
      handlers.alertTimeout();
    } else {
      let savedData = JSON.parse(localStorage.getItem("history"));
      routesHistory.innerHTML = '';
      savedData.forEach(data => {
        routesHistory.innerHTML += `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title"><span class="from">${data.from}</span> <i class="fa fa-chevron-right"></i> <span class="to">${data.to}</span><span class="pull-right"><i class="fa fa-road" onclick="handlers.openHistory(this)"></i> <i class="fa fa-times" onclick="handlers.removeHistory(this)"></i></span></h5>
            </div>
          </div>
        `;
      });
    }
  }
}

// GOOGLE MAP INIT
function initMap(from, to) {
  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer();
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    maxZoom: 15,
    minZoom: 8
  });

  directionsDisplay.setMap(map);

  let request = {
    origin: String(from), 
    destination: String(to),
    travelMode: google.maps.DirectionsTravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.IMPERIAL
  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      // Display the distance:
      document.getElementById('distance').textContent = "Distance: " +
      Math.round(response.routes[0].legs[0].distance.value / 1000) + " km";

      // Display the duration:
      document.getElementById('duration').textContent = "Duration: " + 
      Math.round(response.routes[0].legs[0].duration.value / 60) + " minutes";

      directionsDisplay.setDirections(response);
    }
  });
}

// EVENT LISTENERS
showRouteBtn.addEventListener('click', () => {
  handlers.showRoute();
  handlers.displayHistory();
  handlers.alertTimeout();
});
document.addEventListener("DOMContentLoaded", handlers.displayHistory);