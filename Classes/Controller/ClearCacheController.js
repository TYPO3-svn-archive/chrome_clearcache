var Typo3ClearCache = Typo3ClearCache || function(){
	this.request = null;
	this.sender = null;
	this.view = null;
	this.output = null;
	this.tabs = [];

	this.baseHostname = '';
};

Typo3ClearCache.prototype.setRequest = function(request) {
	this.request = request;
};

Typo3ClearCache.prototype.setSender = function(sender) {
	this.sender = sender;
};

Typo3ClearCache.prototype.setView = function(view) {
	this.view = view;
};

/**
 * Index Action
 */
Typo3ClearCache.prototype.indexAction = function() {
	if (!this.request.isTypo3Website) {
		this.noTypo3Action();
		return;
	}

	var $this = this;
	this.baseHostname = this.getBaseHostname();

	if (this.sender.tab.url.match(/.*typo3\/index\.php$/i)) {
		$this.needLoginAction();
		return;
	}

	$.ajax({
		url: this.baseHostname + 'typo3/backend.php',
		cache: false
	})
	.success(function(data) {
		var toolbar = $(data).find('.typo3-top-toolbar'),
			cachesMenu = $(data).find('#clear-cache-actions-menu');

		if (toolbar.length > 0) {
			var caches = $this.buildCaches(cachesMenu);
			$this.tabs[$this.sender.tab.id] = caches;
			$this.showAction(caches);
		} else {
			$this.needLoginAction();
		}
	})
	.error(function(error) {
		$this.errorAction(error);
	});
};


/**
 * Need login Action
 */
Typo3ClearCache.prototype.needLoginAction = function() {
	chrome.pageAction.setIcon({tabId: this.sender.tab.id, path: 'Resources/Public/Icons/greyFlash.png'});
	chrome.pageAction.setTitle({tabId: this.sender.tab.id, title: chrome.i18n.getMessage('loginRequired')});
	chrome.pageAction.show(this.sender.tab.id);

	this.view.setTemplateName('needLogin');
	this.view.assign('loginLinkHref', this.baseHostname + 'typo3/index.php');
	this.view.assign('installationLinkHref', this.pathToTER);
	this.renderOutput();
};


/**
 * Need Installation Action
 */
Typo3ClearCache.prototype.errorAction = function(error) {
	chrome.pageAction.setIcon({tabId: this.sender.tab.id, path: 'Resources/Public/Icons/greyFlash.png'});
	chrome.pageAction.setTitle({tabId: this.sender.tab.id, title: chrome.i18n.getMessage('errorTitle')});
	chrome.pageAction.show(this.sender.tab.id);

	this.view.setTemplateName('error');
	this.view.assign('errorStatus', error.status);
	this.view.assign('errorStatusText', error.statusText);
	this.renderOutput();
};


/**
 * Show Action
 */
Typo3ClearCache.prototype.showAction = function(caches) {
	$this = this;
	chrome.pageAction.setIcon({tabId: this.sender.tab.id, path: 'Resources/Public/Icons/yellowFlash.png'});
	chrome.pageAction.setTitle({tabId: this.sender.tab.id, title: chrome.i18n.getMessage('clearCache')});
	chrome.pageAction.show(this.sender.tab.id);

	this.buildContextMenu(this.sender.tab.id);

	this.view.setTemplateName('show');
	this.view.assign('cachesAvailable', (caches.length > 0) ? true : false);
	this.view.assign('caches', caches);
	this.renderOutput();
};


/**
 * No Typo3 Action
 */
Typo3ClearCache.prototype.noTypo3Action = function() {
	// Do nothing
};

/**
 * Builds the context menu
 * @param caches
 */
Typo3ClearCache.prototype.buildContextMenu = function(tabId) {
	var $this = this;

	if (this.tabs[tabId].length === 0) return;

	chrome.contextMenus.removeAll();
	var mainMenu = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage('typo3clearcaches'),
		"type" : "normal",
		"contexts" : ["all"]
	});

	$(this.tabs[tabId]).each(function(){
		var cache = this;
		chrome.contextMenus.create({
			"title" : cache.title,
			"type" : "normal",
			"contexts" : ["all"],
			"onclick" : function(info, tab) { $this.executeContextMenu(cache, tab); },
			"parentId" : mainMenu
		});
	});

	chrome.contextMenus.create({
		"type" : "separator",
		"contexts" : ["all"],
		"parentId" : mainMenu
	});

	var autorefreshMenuItem = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage('refeshAfterClearingCache'),
		"type" : "checkbox",
		"checked" : Boolean(localStorage.refeshAfterClearingCache),
		"contexts" : ["all"],
		"onclick" : function(info, tab) {
			if (Boolean(localStorage.refeshAfterClearingCache)) {
				localStorage.removeItem('refeshAfterClearingCache');
			} else {
				localStorage.refeshAfterClearingCache = true;
			}
		},
		"parentId" : mainMenu
	});
};

Typo3ClearCache.prototype.executeContextMenu = function(cache, tab) {
	chrome.pageAction.setIcon({tabId: tab.id, path: 'Resources/Public/Icons/waitplease.png'});

	$.get(cache.href, function(data) {
		if (localStorage.refeshAfterClearingCache) {
			chrome.tabs.reload(tab.id);
		} else {
			chrome.pageAction.setIcon({tabId: tab.id, path: 'Resources/Public/Icons/yellowFlash.png'});
		}
	});
}


/**
 * Returns an array of objects which contains the caches
 * @param cachesMenu
 * @return {Array}
 */
Typo3ClearCache.prototype.buildCaches = function(cachesMenu) {
	var caches = [],
		$this = this;

	$(cachesMenu).find('ul.toolbar-item-menu li').each(function(index){
		var link = $(this).find('a');

		caches.push({
			id: 'id' + index,
			title: $.trim($(link).text()),
			href: $this.baseHostname + 'typo3/' + $(link).attr('href'),
			icon: $this.buildIconPath(link)
		});
	});
	return caches;
}

/**
 * Extracts and build the icon path from given link
 * @param link
 * @return {String}
 */
Typo3ClearCache.prototype.buildIconPath = function(link) {
	var image = $(link).find('img');
	if (image.length > 0) {
		var baseHostname = this.baseHostname;
		if ($(image).attr('src').match(/^sysext/)) {
			baseHostname += 'typo3/';
		}
		return baseHostname + $(image).attr('src').replace(/(.*)(\.\.\/*)(.*)/, '$3');
	}

	var iconPath = '/Resources/Public/Icons/Caches/';
	var span = $(link).find('span');
	if ($(span).hasClass('t3-icon-system-cache-clear-impact-high')) return iconPath + 'all.png';
	if ($(span).hasClass('t3-icon-system-cache-clear-impact-medium')) return iconPath + 'pages.png';
	if ($(span).hasClass('t3-icon-system-cache-clear-impact-low')) return iconPath + 'temp_CACHED.png';
	if ($(span).hasClass('t3-icon-rtehtmlarea-clearcachemenu')) return iconPath + 'rte.png';

	return iconPath + 'unknown.png';
}

Typo3ClearCache.prototype.getOutput = function() {
	return this.output;
};

Typo3ClearCache.prototype.setOutput = function(output) {
	this.output = output;
};

Typo3ClearCache.prototype.renderOutput = function() {
	var iframe = document.getElementById('templates');
	var parameter = {
		command: 'render',
		templateName: this.view.templateName,
		variables: this.view.variables,
		locales: this.getLocales()
	};
	iframe.contentWindow.postMessage(parameter, '*');

	var _this = this;
	window.addEventListener('message', function (event) {
		_this.setOutput(event.data.html);
	});
};

Typo3ClearCache.prototype.getLocales = function() {
	var localeKeys = [
		'typo3clearcaches',
		'clearCache',
		'errorTitle',
		'errorHeadline',
		'errorText',
		'extensionDescription',
		'loginLinkText',
		'loginRequired',
		'loginRequiredHeadline',
		'noCachesAvailable',
		'noCachesAvailableHeadline',
		'refeshAfterClearingCache'
	];
	var locales = {};
	for (var i = 0; i < localeKeys.length; i++) {
		locales[localeKeys[i]] = chrome.i18n.getMessage(localeKeys[i]);
	}
	return locales;
}

Typo3ClearCache.prototype.getBaseHostname = function() {
	var tabUrl = this.sender.tab.url;
	return tabUrl.replace(/(.*?\:\/\/.*?\/).*/gi, '$1');
};

Typo3ClearCache.prototype._isValidJson = function(json) {
	return (json[0] === '[' && json[json.length - 1] === ']');
};