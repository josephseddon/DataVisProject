console.log('DataVis application starting');
var data;
var dataColumns;
var i;
var dataSummary = [];
var filterOn = 'Country';
var qSelectorArray;
var filterArray;
var filterCount;
var pieLegend;


/**
* Represents a column.
* @@class
* @@param {string} title - The title of the column
* @@param {number[]} values - The value of the column
*/
function column(title, values) {
	this.title = title;
	this.values = values;
}

/**
* Represents a data object for a group bar visulisation.
* @@class
* @@param {string[]} x - Array of values
* @@param {number[]} y - Array of value counts
* @@param {string} name - The name of the column
* @@param {string} type - The type of chart    */
function groupbarData(x, y, name, type) {
	this.x = x;
	this.y = y;
	this.name = name;
	this.type = type;
}

/**
* Readding depracated d3.js function necessary for parsets
* @@function d3.rebind
*/
d3.rebind = function (target, source) {
	var i = 1, n = arguments.length, method;
	while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
	return target;
};

/**
* Readding depracated d3.js function necessary for parsets
* @@function d3_rebind
*/
function d3_rebind(target, source, method) {
	return function () {
		var value = method.apply(source, arguments);
		return value === source ? target : value;
	};
}

/**
* Readding depracated d3.js function necessary for parsets
* @@function d3.functor
*/
d3.functor = function functor(v) {
	return typeof v === "function" ? v : function () {
		return v;
	};
};

/**
* Adds click events to visualisation elements
* @@function filterEvents
*/
function filterEvents() {
	$('.filter-list-item').click(function () {
		$(this).parent().parent().toggleClass('filter-selected')
	})

	$('.filter-show').click(function () {
		$(this).parent().parent().toggleClass('visible')
		var text = $(this).text();
		$(this).text(
			text == "[Show]" ? "[Hide]" : "[Show]");
	})
}

/**
* Contructs data filter and data selection lists in web interface
* @@function filterSelectConstructor
*/
function filterSelectConstructor() {

	d3.csv('All_data_with_dates_and_filtered.csv', function (error, csv) {
		dataColumns = d3.keys(csv[0]);
		dataColumnsSize = dataColumns.length;

		for (i = 2; i < dataColumns.length; i++) {
			var columnName = dataColumns[i];
			var columnUniques = d3.map(csv, function (d) { return d[dataColumns[i]]; }).keys();
			console.log(columnName);
			console.log(columnUniques);
			var columnSummary = new column(columnName, columnUniques)
			console.log(columnSummary);
			dataSummary.push(columnSummary);
		}
		console.log('Data summary has ' + dataSummary.length + ' objects');
		console.log(dataSummary);

		var collator = new Intl.Collator(undefined, {
			numeric: true,
			sensitivity: 'base'
		});

		for (i = 2; i < dataColumnsSize; i++) {

			$('.csvcolumn-list').append('<li class="list-group-item" draggable="true"> <label class="filter-label filter-label-check" for= "check-' + dataColumns[i] + '">' + dataColumns[i] + '<input class="filter-list-item" type="checkbox" name="qSelector" id="check-' + dataColumns[i] + '" value="' + dataColumns[i] + '"><span class="checkmark"></span></label ></li>');
		}

		$('.list-group-sortable').sortable({
			placeholderClass: 'list-group-item'
		});

		$('.filter-list-item').change(generateChart);

		for (i = 0; i < dataSummary.length; i++) {

			var filterTitle = dataSummary[i].title;
			console.log('Beginning build of' + filterTitle + ' filter');
			var filterUniques = dataSummary[i].values;

			$("#filter-container").append('<select class="js-example-basic-multiple ' + filterTitle + '-filter" multiple="" style="width:320px;""></select>');
			$("." + filterTitle + "-filter").append('<option value="">' + filterTitle + '</option>');

			for (j = 0; j < filterUniques.length; j++) {
				$("." + filterTitle + "-filter").append('<option value="' + filterUniques[j] + '">' + filterUniques[j] + '</option>');
			}

			$('.' + filterTitle + "-filter").select2({
				width: '100%',
				placeholder: filterTitle,
				tags: true
			});

			$('.' + filterTitle + "-filter").on('change.select2', function (e) {
				console.log('Select 2 change event triggered');
				filterSelect();
				if (qSelectorArray.length > 0) { generateChart(); }
			});
		}


		filterEvents();
	});


};


/**
* Fetchs all dimensions selected by the user and updates global variable
* @@function qSelector
*/
function qSelector() {
	qSelectorArray = [];
	console.log("qSelectorArray reset");
	$("input:checkbox[name=qSelector]:checked").each(function () {
		qSelectorArray.push($(this).val());
		console.log("qSelectorArray array added")
	});
}

/**
* Fetchs all filter options selected by the user and updates global variable
* @@function filterSelect
*/
function filterSelect() {
	filterArray = [];
	filterCount = 0;
	for (i = 0; i < dataSummary.length; i++) {
		var filterSelected = [];
		$('.' + dataSummary[i].title + '-filter').find(':selected').each(function () {
			filterSelected.push($(this).val());
			console.log(filterSelected)
			filterCount++;
			console.log(filterCount)
		});
		if (filterSelected.length > 0) { filterArray.push(new column(dataSummary[i].title, filterSelected)) }

	}
	console.log(filterArray)
}

/**
* Creates pie and bar charts
* @@function singleChart
* @@param {Array} csv - Data output from d3.csv
*/
function singleChart(csv) {
	if (qSelectorArray === undefined || qSelectorArray === null) {
		qSelectorArray[0] = "Country";
	}
	filterSelect();

	if (filterCount > 0) {
		var data = csv;

		for (j = 0; j < filterArray.length; j++) {
			var t;
			t = data.filter(function (d, i) { return filterArray[j].values.indexOf(d[filterArray[j].title]) >= 0 });
			data = t;
		}
	} else {
		var data = csv;
	}



	filter = qSelectorArray[0];


	var rolledUp = d3.rollup(data, v => v.length, d => d[filter]);
	console.log(rolledUp);

	rolledUpArray = Array.from(rolledUp);
	console.log(rolledUpArray);

	rolledUpArray.sort(function (x, y) { return d3.ascending(x[0], y[0]); });

	var x = [];
	var y = [];

	for (i = 0; i < rolledUpArray.length; i++) {
		x.push(rolledUpArray[i][0]);
		y.push(rolledUpArray[i][1]);
	}

	var barData = [
		{
			x: x,
			y: y,
			type: 'bar'
		}
	];
	var pieData = [
		{
			labels: x,
			values: y,
			type: 'pie',
			textinfo: 'none',
			hole: .4
		}
	];

	Plotly.newPlot('plotly-bar', barData, { responsive: true });
	Plotly.newPlot('plotly-pie', pieData, { responsive: true });
}

/**
* Creates grouped bar chart
* @@function groupChart
* @@param {Array} csv - Data output from d3.csv
*/
function groupChart(csv) {
	if (qSelectorArray === undefined || qSelectorArray === null) {
		qSelectorArray[0] = "Country";
	}


	filterSelect();

	if (filterCount > 0) {
		var data = csv;

		for (j = 0; j < filterArray.length; j++) {
			var t;
			t = data.filter(function (d, i) { return filterArray[j].values.indexOf(d[filterArray[j].title]) >= 0 });
			data = t;
		}
	} else {
		var data = csv; // so that no boxes checked shows all data
	}


	var rolledUp = d3.rollup(data, v => v.length, d => d[qSelectorArray[0]], d => d[qSelectorArray[1]]);
	console.log('weve rolled up');
	console.log(rolledUp);

	console.log('Now time to convert map to array');
	var rolledUpGroupArray = Array.from(rolledUp);
	console.log('weve created the array');
	console.log(rolledUpGroupArray);
	console.log('Now time to convert nested map to array');
	for (i = 0; i < rolledUpGroupArray.length; i++) {
		rolledUpGroupArray[i][1] = Array.from(rolledUpGroupArray[i][1]);
	}
	console.log('weve created the nested array');
	console.log(rolledUpGroupArray);
	for (i = 0; i < rolledUpGroupArray.length; i++) {
		rolledUpGroupArray[i][1].sort(function (x, y) { return d3.ascending(x[0], y[0]); });
	}

	var barData = []
	for (var i = 0; i < rolledUpGroupArray.length; i++) {
		var group = new groupbarData();
		var xArray = [];
		var yArray = [];
		for (var j = 0; j < rolledUpGroupArray[i][1].length; j++) {
			xArray.push(rolledUpGroupArray[i][1][j][0]);
			yArray.push(rolledUpGroupArray[i][1][j][1]);
		}
		group.name = rolledUpGroupArray[i][0];
		group.type = 'bar';
		group.x = xArray;
		group.y = yArray;
		barData.push(group);
	}
	console.log(barData);

	var layout = { barmode: 'group', barnorm: 'percent' };

	Plotly.newPlot('plotly-bar', barData, layout);
}

/**
* Creates parallel set visualisation
* @@function generateParset
* @@param {Array} csv - Data output from d3.csv
*/
function generateParset(csv) {
	filterSelect();

	if (filterCount > 0) {
		var data = csv;

		for (j = 0; j < filterArray.length; j++) {
			var t;
			t = data.filter(function (d, i) { return filterArray[j].values.indexOf(d[filterArray[j].title]) >= 0 });
			data = t;
		}
	} else {
		var data = csv;
	}

	var parsetVisWidth = document.getElementById("vis-container").offsetWidth;
	console.log('The vis container is ' + parsetVisWidth + 'px');

	var margin = { top: 50, right: 25, bottom: 50, left: 25 },
		width = parsetVisWidth - margin.left - margin.right,
		height = (400 * (qSelectorArray.length - 1)) - margin.top - margin.bottom;

	if (qSelectorArray === undefined || qSelectorArray.length === 0) {
		qSelectorArray = ["Country", "Device_donated_on"]
	}

	var chart = d3.parsets()
		.width(width)
		.height(height)
		.dimensions(qSelectorArray)
		.tension(.5);

	var collator = new Intl.Collator(undefined, {
		numeric: true,
		sensitivity: 'base'
	});

	$("#vis").empty()

	var svg = d3.select("#vis").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")

	svg.datum(data).call(chart);
};

/**
* Provides logic for selecting visualisation function
* @@function generateChart
*/
function generateChart() {
	qSelector();

	if (qSelectorArray === undefined || qSelectorArray === null) {
		$(".inline-validationtext").show();
	} else if (qSelectorArray.length == 1) {
		$(".inline-validationtext").hide();
		d3.csv("All_data_with_dates_and_filtered.csv", function (error, csv) {
			$("#vis").empty();
			singleChart(csv);
		})
	} else if (qSelectorArray.length == 2) {
		$(".inline-validationtext").hide();
		d3.csv("All_data_with_dates_and_filtered.csv", function (error, csv) {
			$("#vis").empty();
			$("#plotly-pie").empty();
			generateParset(csv);
			groupChart(csv);
		})
	} else {
		$(".inline-validationtext").hide();
		d3.csv("All_data_with_dates_and_filtered.csv", function (error, csv) {
			$("#vis").empty();
			$("#plotly-bar").empty();
			$("#plotly-pie").empty();
			generateParset(csv);
		})
	};
}

		window.onresize = function () {

			generateChart();

		var visWidth = document.getElementById("vis-container").offsetWidth;
        var barDiv = document.getElementById("plotly-bar");
        var pieDiv = document.getElementById("plotly-pie");

        if (visWidth < 925) {
			pieLegend = false;
		} else {
			pieLegend = true;
		}


        if (qSelectorArray.length == 1) {
			Plotly.relayout(barDiv, {
				width: 0.9 * visWidth,

			})
            Plotly.relayout(pieDiv, {
			width: 0.9 * visWidth,
		showlegend: pieLegend
	})
        } else if (qSelectorArray.length == 2) {
			Plotly.relayout(barDiv, {
				width: 0.9 * visWidth
			})
		} else {
		};
    }
    filterSelectConstructor();


    $('#generate').click(generateChart);
    $('.list-group-sortable').sortable({
			placeholderClass: 'list-group-item'
    });
    $('.list-group-sortable').sortable().on("sortupdate", function (e, ui) {
			generateChart();
		});
	
    console.log('DataVis Application loading complete');