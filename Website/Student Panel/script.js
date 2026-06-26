/* new tab for attendance */
function openTab(tabName) {
  var i, x;
  x = document.getElementsByClassName("containerTab");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  document.getElementById(tabName).style.display = "block";
}
/* end */


/* event page */
var calApp;
calApp = angular.module('calApp', ['ngAnimate'])
calApp.controller('calCtrl', function ($scope, $sce) {

  $scope.eventsVisible = 3; // How many events should be shown?

  $scope.events = [
    {
      title: "Australia Day Service",
      date: 1453786245352,
      location: "Corner Cross and Hocking St West Footscray",
    },
    {
      title: "BBQ in the park",
      date: 1456813856559,
      location: "16 Ferdinando Gardens Hampton",
    },
    {
      title: "Good Friday",
      date: 1459290634807,
      location: "Flinders St, Melbourne",
    },
    {
      title: "Family Day",
      date: 1459290634807,
      location: "Collins St, Melbourne",
    },
    {
      title: "Concert In Altona",
      date: 1461990642447,
      location: "Altona Beach",
    }
  ];

  $scope.getMap = function (event) {
    // Creates a Google Map URL
    return "https://maps.google.com/?q=" + event.location;
  };

  $scope.getEvents = function () {
    // Gets x number of events , using scope.eventsVisible 
    // to determine how many events to show
    var events = [];
    for (x = 0; x < $scope.eventsVisible; x++) {
      events.push($scope.events[x]);
    }
    return events;
  }

  $scope.hiddenEvents = function () {
    // Calculates how many events are hidden
    var remaining;
    if ($scope.events.length - $scope.eventsVisible > 0) {
      remaining = $scope.events.length - $scope.eventsVisible;
    } else {
      remaining = 0;
    }

    return remaining;
  }

  $scope.showHidden = function () {
    // Show hidden events
    $scope.eventsVisible = $scope.events.length;
  }
  $scope.hideEvents = function () {
    // Hide events
    $scope.eventsVisible = 3;
  }


});


/* end */









/* id data update */

function updateFields() {
  // For each field, prompt the user for input and update the corresponding paragraph
  var year = prompt("Enter Academic Year:", "2023-24");
  if (year !== null) document.querySelector(".fcay").innerHTML = year;

  var name = prompt("Enter Name:", "Vikram Mahabala Devadiga");
  if (name !== null) document.querySelector(".fcname").innerHTML = name;

  var uid = prompt("Enter UID:", "GCSE1012023000");
  if (uid !== null) document.querySelector(".fcuid").innerHTML = uid;

  var branch = prompt("Enter Branch:", "CSE (AI & ML)");
  if (branch !== null) document.querySelector(".fcbranch").innerHTML = branch;

  var dob = prompt("Enter Date of Birth:", "16/03/2003");
  if (dob !== null) document.querySelector(".fcdob").innerHTML = dob;

  var contact = prompt("Enter Contact Number:", "79777 89000");
  if (contact !== null) document.querySelector(".fccon").innerHTML = contact;

  var address = prompt("Enter Address:", "2, 9/10, Kanchanganga Towers, 4 Bungalows, Manish Nagar, Andheri (West), Mumbai, Maharashtra, 02226371093");
  if (address !== null) document.querySelector(".fcadd").innerHTML = address;

  // Prompt the user to enter an image URL
  /* var imageUrl = prompt("Please enter the image URL:");
  if (imageUrl !== null && imageUrl !== "") {
    // Create a new image element and set its src attribute
    var img = document.createElement("img");
    img.src = imageUrl;

    // Display the image in the container div
    var container = document.getElementById("fcimg");
    container.innerHTML = ""; // Clear the container first
    container.appendChild(img);
  } */
}