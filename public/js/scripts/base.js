(function() {
	var currentPage = "main";

	jQuery(document).ready(function($) {
		showMainScreen();
		//getPage().html(formTmpl());
	});

	function bindClick($obj, selector, callback) {
		$obj.find(selector).on('click', { obj: $obj }, callback);
	}

	function unbindClick($obj, selector, callback) {
		$obj.find(selector).off('click', callback);
	}

	function getPage(event) {
		if (typeof event === 'undefined')
			var $page = $('#page');
		else
			var $page = event.data.obj;
		return $page;
	}

	function showMainScreen(event) {
		$page = getPage(event);

		if (currentPage === 'scoreboard')
			hideScoreboardScreen($page);
		if (currentPage === 'game')
			hideGameScreen($page);

	    $page.html(mainTmpl());

	    var sb = $page.find('.js-scoreboard');
	    bindClick($page, '.js-scoreboard', showScoreboardScreen);
	    bindClick($page, '.js-start-game', showGameScreen);

	    currentPage = 'main';
	}

	function hideMainScreen($page) { 
	    unbindClick($page, '.js-scoreboard', showScoreboardScreen);
	    unbindClick($page, '.js-start-game', showGameScreen);
	}

	function showScoreboardScreen(event) {
		$page = getPage(event);

		if (currentPage === 'main')
			hideMainScreen($page);
		if (currentPage === 'game')
			hideGameScreen($page);

		$page.html(scoreboardTmpl());
		bindClick($page, '.back-button', showMainScreen);

		currentPage = 'scoreboard';
	}

	function hideScoreboardScreen($page) {
		unbindClick($page, '.back-button', showMainScreen);
	}

	function showGameScreen(event) {
		$page = getPage(event);

		if (currentPage === 'main')
			hideMainScreen($page);
		if (currentPage === 'scoreboard')
			hideScoreboardScreen($page);

		$page.html(gameTmpl());
		bindClick($page, '.back-button', showMainScreen);

		currentPage = 'game';
	}

	function hideGameScreen($page) {
		unbindClick($page, '.back-button', showMainScreen);
	}
}) ();