var tabs = {};
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
	var Controller = tabs[sender.tab.id] = new Typo3ClearCache();
	Controller.setRequest(request);
	Controller.setSender(sender);
	Controller.setView(new View());
	Controller.indexAction();
});

chrome.webRequest.onBeforeRequest.addListener(
	function (details) {
		if (!localStorage.clearCacheOnBeforeRequest
				|| !tabs[details.tabId]
				|| tabs[details.tabId].request.isTypo3Website === false
				|| !tabs[details.tabId].tabs[details.tabId]
				|| details.url.indexOf(tabs[details.tabId].getBaseHostname()) === -1
				|| details.url.indexOf(tabs[details.tabId].getBaseHostname() + 'typo3/') !== -1
				|| details.type !== 'main_frame') {
			return;
		}

		var caches = tabs[details.tabId].tabs[details.tabId];
		var firstCache = caches[0];
		if (firstCache === undefined) {
			return;
		}

		chrome.tabs.sendMessage(details.tabId, chrome.i18n.getMessage('executing') + ': "' + firstCache.title + '"');

		$.ajax(firstCache.href, {
			async:false,
			complete:function () {
				chrome.tabs.sendMessage(details.tabId, chrome.i18n.getMessage('loadingPage') + '...');
				return {redirectUrl:details.url};
			}
		});
	},
	{urls:["<all_urls>"]},
	["blocking"]
);

chrome.tabs.onActivated.addListener(function (tab) {
	if (typeof tabs[tab.tabId] === 'object') {
		tabs[tab.tabId].indexAction();
	}

	chrome.contextMenus.removeAll();
	if (tabs[tab.tabId] !== undefined) {
		tabs[tab.tabId].buildContextMenu(tab.tabId);
	}
});