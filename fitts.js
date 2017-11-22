var elems = document.getElementsByClassName("icon");
var increase = Math.PI * 2 / elems.length;
var x = 0;
var y = 0;
var angle = 0;
var radius = 200;
var width = 25;
var height = 25;
var center_top = ($("#slider-1").height() - $("#icon-1").height()) / 2;
var center_left = ($("#slider-1").width() - $("#icon-1").width()) / 2;
var clickCounter;
var currentTimeStamp;
var nextTimeStamp;
var movementTime;
var elementClickDistances;
var selectedWidth;
var selectedDistance;
var experimentData = [];

$("#btnExport").click(function (e) {
  e.preventDefault();

  //getting data from our table
  var data_type = 'data:application/vnd.ms-excel';
  var table_div = document.getElementById('experimentTable');
  var table_html = table_div.outerHTML.replace(/ /g, '%20');
  var a = document.createElement('a');
  a.href = data_type + ', ' + table_html;
  a.download = 'experiment_data' + Math.floor((Math.random() * 9999999) + 1000000) + '.xls';
  a.click();
});


function start() {
  selectedWidth = $('input[name=width]:checked').val();
  selectedDistance = $('input[name=distance]:checked').val();

  if (!selectedWidth || !selectedDistance) {
    if (selectedDistance) {
      alert('please select width');
    } else if (selectedWidth) {
      alert('please select distance');
    } else {
      alert('please select both width & distance');
    }
  }

  console.log('selectedDistance & selectedDistance:', selectedWidth, selectedDistance);

  $('.icon').css({
    'top': center_top + 'px',
    'left': center_left + 'px'
  });

  $(elems).css('opacity', '0').each(function (i) {
    elem = elems[i];

    x = selectedDistance * Math.cos(angle) + center_left; //selectedDistance = radius
    y = selectedDistance * Math.sin(angle) + center_top; //selectedDistance = radius

    $(elem).css("background-color", "greenyellow");
    $(elem).off("click");

    $(elem).animate({
      'position': 'absolute',
      'width': selectedWidth + 'px', //selectedWidth = width
      'height': selectedWidth + 'px', // selectedWidth == height
      'left': x + 'px',
      'top': y + 'px',
      'opacity': '1'
    });

    angle += increase;
  });

  $('.start_note').css('visibility', 'hidden');
  $('.experiment_note').css('visibility', 'visible');
  clickCounter = 0;
  movementTime = [];
  elementClickDistances = [];
  startExperiment();
}

function startExperiment(pastElement) {
  currentTimeStamp = Date.now();

  //console.log(clickCounter);
  if (clickCounter === 15) {
    calculateIndexOfDifficulty(movementTime, elementClickDistances, selectedWidth, selectedDistance);
    alert('experiment ended.');
    $('.experiment_note').css('visibility', 'hidden');
    $('.start_note').css('visibility', 'visible');
  } else {
    var filteredElems = _.without(elems, pastElement);
    var x = Math.floor(Math.random() * filteredElems.length);
    var randomElement = filteredElems[x];

    if (pastElement) {
      elementClickDistances.push(calculateDistanceBetweenElements(pastElement, randomElement));
    }

    $(randomElement).css("background-color", "red");
    $(randomElement).click(function () {
      clickCounter++;
      $(randomElement).off("click");
      $(randomElement).css("background-color", "greenyellow");
      nextTimeStamp = Date.now();
      movementTime.push(nextTimeStamp - currentTimeStamp);
      startExperiment(randomElement);
    });
  }
}

function calculateDistanceBetweenElements(past, current) {
  var element1 = past.getBoundingClientRect();
  var element2 = current.getBoundingClientRect();
  var dx = (element1.left + (element1.right - element1.left) / 2) - (element2.left + (element2.right - element2.left) / 2);
  var dy = (element1.top + (element1.bottom - element1.top) / 2) - (element2.top + (element2.bottom - element2.top) / 2);
  var dist = Math.sqrt(dx * dx + dy * dy);

  return dist;
}

function calculateIndexOfDifficulty(time, clickDistances, width, distance) {
  var indexOfDifficulty;
  var indexOfPerformance;
  var distSum = 0;
  var distanceMean = getMean(clickDistances);
  var movementTimeMean = getMean(movementTime) / 1000;

  indexOfDifficulty = Math.log2((parseInt(distanceMean) / (width)) + 1);

  indexOfPerformance = indexOfDifficulty / movementTimeMean;

  experimentData.push({
    field1: movementTimeMean,
    field2: distanceMean,
    field3: indexOfDifficulty,
    field4: indexOfPerformance
  });

  console.log('experiment findings:');
  console.log('movementTimeMean:', movementTimeMean);
  console.log('distanceMean:', distanceMean);
  console.log('indexOfDifficulty:', indexOfDifficulty);
  console.log('indexOfPerformance: or ThroughPut:', indexOfPerformance);
  loadTable('experimentTable', ['field1', 'field2','field3', 'field4'], experimentData);
  $('#experimentTable tr:last').remove();

 // displayExport();
}

function getMean(values) {
  var valuesSum = 0;
  for (var i = 0; i < values.length; i++) {
    valuesSum += parseInt(values[i], 10); //don't forget to add the base
  }

  return valuesSum / values.length;
}

function loadTable(tableId, fields, data) {
 // $('#' + tableId).empty(); //not really necessary
  var rows = '';
  $.each(data, function (index, item) {
    var row = '<tr>';
    $.each(fields, function (index, field) {
      row += '<td>' + item[field + ''] + '</td>';
    });
    rows += row + '<tr>';
  });
  $('#' + tableId + ' tbody').html(rows);
}

// function displayExport(){
//     $(document).ready(function () {
//         $('#experimentTable').DataTable({
//           dom: 'Bfrtip',
//           "bFilter": false,
//           buttons: [
//             'copy', 'csv', 'excel'
//           ]
//         });

//         $('.buttons-copy').addClass('btn btn-default btn-sm pull-right');
//         $('.buttons-csv').addClass('btn btn-default btn-sm pull-right');
//         $('.buttons-excel').addClass('btn btn-default btn-sm pull-right');
//       });
// }
