var tabs = {};
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	var Controller = tabs[sender.tab.id] = new Typo3ClearCache();
	Controller.setRequest(request);
	Controller.setSender(sender);
	Controller.setView(new View());
	Controller.indexAction();
});

chrome.tabs.onActivated.addListener(function(tab){
	chrome.contextMenus.removeAll();
	if (tabs[tab.tabId] !== undefined) {
		tabs[tab.tabId].buildContextMenu(tab.tabId);
	}
});
