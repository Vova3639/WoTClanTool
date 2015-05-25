var onLoad = function() {
	checkConnected();
	progressNbSteps = 3;
	advanceProgress(i18n.t('loading.claninfos'));
	setNavBrandWithClan(function() {
		var membersList = '',
			isFirst = true;
		for (var i=0; i<gClanInfos.members_count; i++) {
			if (isFirst) {
				isFirst = false;
			} else {
				membersList += ',';
			}
			membersList += gClanInfos.members[i].account_id;
		}
		advanceProgress(i18n.t('loading.membersinfos'));
		$.post(gConfig.WG_API_URL + 'wot/account/info/', {
			application_id: gConfig.WG_APP_ID,
			language: gConfig.G_API_LANG,
			access_token: gConfig.ACCESS_TOKEN,
			account_id: membersList
		}, function(dataPlayersResponse) {
			advanceProgress(i18n.t('loading.generating'));
			gDataPlayers = dataPlayersResponse.data;
		}, 'json');
	});
	gCalendar = $('#clanCalendar').calendar({
		tmpl_path: './js/calendar-tmpls/',
		language: gLangMapping[gConfig.LANG],
		view: 'month',
		modal: '#events-modal',
		modal_type: 'ajax',
		modal_title : function (e) {
			return '<span class="eventTitle">' + e.title + '</span>'
				+ ' <span class="label label-default eventStartDate" data-date="' + e.start + '">' + moment(e.start * 1).format('LT')
				+ '</span> - <span class="label label-default eventEndDate" data-date="' + e.end + '">' + moment(e.end * 1).format('LT') + '</span>';
		},
		onAfterViewLoad: function(view) {
			$('#agendaTitle').text(this.getTitle());
		},
		onAfterModalShown: function(events) {
			fillEventDialog($("#events-modal"), events);
		},
		events_source: './server/calendar.php?a=list'
	});
	$('.btn-group button[data-calendar-nav]').each(function() {
		var $this = $(this);
		$this.click(function() {
			gCalendar.navigate($this.data('calendar-nav'));
		});
	});

	$('.btn-group button[data-calendar-view]').each(function() {
		var $this = $(this);
		$this.click(function() {
			$this.siblings('.active').removeClass('active');
			$this.addClass('active');
			gCalendar.view($this.data('calendar-view'));
		});
	});

	// Prevent default action on add event button
	$('#addEvent').on('click', function(evt) {
		evt.preventDefault();
		$('#eventTitle').val('');
		$('#eventDescription').val('');
		//$('#eventStartDate input').val(moment().format('LL'));
		$('#eventStartDate').data('DateTimePicker').date(moment());
		$('#eventEndDate input').val('');
		//$('#eventStartTime input').val(moment().format('LT'));
		$('#eventStartTime').data('DateTimePicker').date(moment());
		$('#eventEndTime input').val('');
	});

	// Init date time pickers
	$('.eventDatePicker').datetimepicker({
		locale: gConfig.LANG,
		format: 'LL',
		minDate: moment()
	});
	$('.eventTimePicker').datetimepicker({
		locale: gConfig.LANG,
		format: 'LT',
		minDate: moment()
	});
	// Handle min and max dates
	$('#eventStartDate').on('dp.change', function (e) {
		$('#eventEndDate').data('DateTimePicker').minDate(e.date);
	});
	$('#eventEndDate').on('dp.change', function (e) {
		$('#eventStartDate').data('DateTimePicker').maxDate(e.date);
	});
	$('#eventStartTime').on('dp.change', function (e) {
		$('#eventEndTime').data('DateTimePicker').minDate(e.date);
	});
	$('#eventEndTime').on('dp.change', function (e) {
		$('#eventStartTime').data('DateTimePicker').maxDate(e.date);
	});
	$('#eventStartDate input, #eventEndDate input, #eventStartTime input, #eventEndTime input').on('focus', function(evt) {
		$(this).parent().data('DateTimePicker').show();
	});
	var periodicityDaysHtml = '',
		dayOfWeek = moment().startOf('week').subtract(1, 'days'),
		isPeriodic = false;
	for (var i=0; i<7; i++) {
		periodicityDaysHtml += '<div class="radio radio-default">';
		periodicityDaysHtml += '<label>';
		periodicityDaysHtml += '<input type="radio" value="' + i + '" name="eventPeriodicityDay" ' + (i==0?' checked="checked"':'') + '/>';
		periodicityDaysHtml += '<abbr>' + dayOfWeek.add(1, 'days').format('dddd') + '</abbr>';
		periodicityDaysHtml += '</label>';
		periodicityDaysHtml += '</div>';
	}
	$('#containerEventPeriodicity').append(periodicityDaysHtml);
	// Change periodicity property
	$('#eventRecurrent').on('change', function(evt) {
		if ($(this).is(':checked')) {
			$('#eventEndDate').fadeIn('fast');
			$('#containerEventPeriodicity').slideDown('fast');
			isPeriodic = true;
		} else {
			$('#eventEndDate').fadeOut('fast');
			$('#containerEventPeriodicity').slideUp('fast');
			isPeriodic = false;
		}
	}).change();
	// Submit of event
	$('#btnEventOk').on('click', function(evt) {
		// Prevent default action of button
		evt.preventDefault();
		// Post data to server
		var lStartDate = $('#eventStartDate').data('DateTimePicker').date(),
			lStartTime = $('#eventStartTime').data('DateTimePicker').date(),
			lEndDate = $('#eventEndDate').data('DateTimePicker').date(),
			lEndTime = $('#eventEndTime').data('DateTimePicker').date(),
			startDateToSent = lStartDate,
			endDateToSent = lEndDate;
		// Compute start and end final dates.
		startDateToSent = startDateToSent.hour(lStartTime.hour());
		startDateToSent = startDateToSent.minute(lStartTime.minute());
		if (!isPeriodic) {
			endDateToSent = moment(lStartDate);
		}
		endDateToSent = endDateToSent.hour(lEndTime.hour());
		endDateToSent = endDateToSent.minute(lEndTime.minute());
		$.post('./server/calendar.php', {
			a: 'save',
			eventTitle: $('#eventTitle').val(),
			eventType: $('[name=eventType]:checked').val(),
			eventDescription: $('#eventDescription').val(),
			eventStartDate: startDateToSent.unix(),
			eventEndDate: endDateToSent.unix(),
			eventAllowSpare: $('#eventSpareAllowed').is(':checked')
		}, function(addEventResult) {
			// Handle result
			if (addEventResult.result == 'ok') {
				// Hide dialog
				$('#eventDialog').modal('hide');
				// Refresh calendar
				gCalendar.view();
			}
		}, 'json');
	});
	afterLoad();
};