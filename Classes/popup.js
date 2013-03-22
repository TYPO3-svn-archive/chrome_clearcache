/***************************************************************
 *  Copyright notice
 *
 *  (c) 2012-2013 Armin Ruediger Vieweg <armin@v.ieweg.de>
 *
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

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
});
