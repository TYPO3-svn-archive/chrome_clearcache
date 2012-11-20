var background = background || chrome.extension.getBackgroundPage();

chrome.tabs.getSelected(null, function(tab) {
	var currentTab = background.tabs[tab.id];
	$('#typo3_clearcache').append(currentTab.getOutput());

	$('ul.caches a').on('click', function(){
		var link = this;
		var image = $(this).find('img').eq(0);
		$(link).addClass('active');
		$(image)
			.data('originalIcon', $(image).attr('src'))
			.attr('src', 'Resources/Public/Icons/loading.gif');

		$.get($(this).attr('href'), function(data) {
			if (localStorage.refeshAfterClearingCache) {
				chrome.tabs.reload(tab.id);
				window.setTimeout(function(){
					window.close();
				}, 1000);
			} else {
				$(image).attr('src', 'Resources/Public/Icons/ready.gif');
				window.setTimeout(function(){
					$(link).removeClass('active');
					$(image).attr('src', $(image).data('originalIcon'));
				}, 1500);
			}
		});
		return false;
	});
	$('input[name="refeshAfterClearingCache"]').on('change', function(){
		if ($(this).prop('checked')) {
			localStorage.refeshAfterClearingCache = true;
		} else {
			localStorage.removeItem('refeshAfterClearingCache');
		}
		chrome.contextMenus.removeAll();
		currentTab.buildContextMenu(tab.id);
	});
	$('input[name="refeshAfterClearingCache"]').prop('checked', localStorage.refeshAfterClearingCache);

	$('input[name="clearCacheOnBeforeRequest"]').on('change', function(){
		if ($(this).prop('checked')) {
			localStorage.clearCacheOnBeforeRequest = true;
		} else {
			localStorage.removeItem('clearCacheOnBeforeRequest');
		}
		chrome.contextMenus.removeAll();
		currentTab.buildContextMenu(tab.id);
	});
	$('input[name="clearCacheOnBeforeRequest"]').prop('checked', localStorage.clearCacheOnBeforeRequest);
});