var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var config = {
			type: 'line',
			data: {
				// labels: [],
				datasets: []
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: '折线统计图'
				},
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				scales: {
					xAxes: [{
						type: 'time',
						display: true,
						scaleLabel: {
							display: true,
							labelString: '时间'
						},
						ticks: {
							major: {
								fontStyle: 'bold',
								fontColor: '#FF0000'
							}
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: '概率'
						}
					}]
				}
			}
		};


		$(function(){
			// initialize input widgets first
			$('#AnalizyForm .time').timepicker({
					'showDuration': true,
					'timeFormat': 'H:i'
			});

			$('#AnalizyForm .date').datepicker({
					'format': 'm/d/yyyy',
					'autoclose': true
			});

			// initialize datepair
			var basicExampleEl = document.getElementById('AnalizyForm');
			var datepair = new Datepair(basicExampleEl);

			var ctx = document.getElementById('canvas').getContext('2d');
			window.myLine = new Chart(ctx, config);

			getAllChartsData();
		})

		document.getElementById('randomizeData').addEventListener('click', function() {
			config.data.datasets.forEach(function(dataset) {
				dataset.data = dataset.data.map(function() {
					return randomScalingFactor();
				});

			});

			window.myLine.update();
		});

		var colorNames = Object.keys(window.chartColors);
		document.getElementById('addDataset').addEventListener('click', function() {
			var colorName = colorNames[config.data.datasets.length % colorNames.length];
			var newColor = window.chartColors[colorName];
			var newDataset = {
				label: 'Dataset ' + config.data.datasets.length,
				backgroundColor: newColor,
				borderColor: newColor,
				data: [],
				fill: false
			};

			for (var index = 0; index < config.data.labels.length; ++index) {
				newDataset.data.push(randomScalingFactor());
			}

			config.data.datasets.push(newDataset);
			window.myLine.update();
		});

		document.getElementById('addData').addEventListener('click', function() {
			if (config.data.datasets.length > 0) {
				var month = MONTHS[config.data.labels.length % MONTHS.length];
				config.data.labels.push(month);

				config.data.datasets.forEach(function(dataset) {
					dataset.data.push(randomScalingFactor());
				});

				window.myLine.update();
			}
		});

		document.getElementById('removeDataset').addEventListener('click', function() {
			config.data.datasets.splice(0, 1);
			window.myLine.update();
		});

		document.getElementById('removeData').addEventListener('click', function() {
			config.data.labels.splice(-1, 1); // remove the label first

			config.data.datasets.forEach(function(dataset) {
				dataset.data.pop();
			});

			window.myLine.update();
		});

		function pushCharts(label, data) {
			var colorName = colorNames[config.data.datasets.length % colorNames.length];
			var newColor = window.chartColors[colorName];
			var newDataset = {
				label,
				backgroundColor: newColor,
				borderColor: newColor,
				data,
				fill: false
			};
			config.data.datasets.push(newDataset);
			window.myLine.update();
		}

		function getAllChartsData() {
			// reset
			config.data.datasets =[]
			window.myLine.update();

			// query
			var startDate = $("#startDate").val();
			var startTime = $("#startTime").val();
			const start = `${startDate} ${startTime}`;

			var endDate = $("#endDate").val();
			var endTime = $("#endTime").val();
			const end = `${endDate} ${endTime}`;

			var x = $("#x").val();
			var slice = $("#slice").val();
			// var limit = $("#limit").val();

			$.ajax({
					// url: `/api/v1/lottery/analizy/charts/?x=${x}&slice=${slice}&limit=${limit}`,
					url: `/api/v1/lottery/analizy/charts/?x=${x}&slice=${slice}&start=${start}&end=${end}`,
					method: 'get',
				}).done(function(res) {
					console.log(res);
					if (res && res.length > 0) {
						const lablesLength = res[0].data.length;
						for (let item of res) {
							pushCharts(item.label, item.data)
						}
					}
				});
		}
