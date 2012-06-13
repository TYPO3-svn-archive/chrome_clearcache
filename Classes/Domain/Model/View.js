var View = View || function(){
	this.template = null;
	this.variables = {};
};

View.prototype.setTemplate = function(templateId) {
	var source = $('#' + templateId).html();
	this.template = Handlebars.compile(source);
};

View.prototype.assign = function(variable, value) {
	this.variables[variable] = value;
};

View.prototype.render = function() {
	return this.template(this.variables);
};

/* Handlebars Helpers */
Handlebars.registerHelper('translate', function(key){
	var message = chrome.i18n.getMessage(key);
	if (message) {
		return message;
	}
	return '*Missing key: ' + key + '*';
});