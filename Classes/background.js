var tabs = {};
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	var Controller = tabs[sender.tab.id] = new Typo3ClearCache();
	Controller.setRequest(request);
	Controller.setSender(sender);
	Controller.setView(new View());
	Controller.indexAction();
});

chrome.tabs.onActivated.addListener(function(tab){
	if (typeof tabs[tab.tabId] === 'object') {
		tabs[tab.tabId].indexAction();
	}

	chrome.contextMenus.removeAll();
	if (tabs[tab.tabId] !== undefined) {
		tabs[tab.tabId].buildContextMenu(tab.tabId);
	}
});
