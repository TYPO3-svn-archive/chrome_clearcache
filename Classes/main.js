/***************************************************************
 *  Copyright notice
 *
 *  (c) 2012 Armin Ruediger Vieweg <armin@v.ieweg.de>
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

/**
 * TYPO3 Clear Cache
 * Clears the TYPO3 cache out of the Chrome Browser, if valid backend session exists
 *
 * @author Armin Ruediger Vieweg <armin@v.ieweg.de>
 * @license GPLv3
 **/
(function (window) {
	var MetaUtility = {
		getMetaTags: function() {
			return window.document.getElementsByTagName('meta');
		},

		isTypo3Website: function() {
			var metaTags = this.getMetaTags();
			for (var metaTag in metaTags) {
				var name = metaTags[metaTag].name,
					content = metaTags[metaTag].content;
				if (name !== undefined && name.toLowerCase() == 'generator' && content.match(/typo3/gi)) {
					return true;
				}
			}
			return false;
		},

		getBaseUrl: function() {
			var baseTag = window.document.getElementsByTagName('base')[0];
			if (baseTag) {
				return baseTag.href;
			} else {
				return null;
			}
		}
	};

	chrome.extension.sendRequest({
		isTypo3Website: MetaUtility.isTypo3Website(),
		baseUrl: MetaUtility.getBaseUrl()
	});
})(window);