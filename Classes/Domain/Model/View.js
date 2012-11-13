var View = View || function(){
	this.templateName = null;
	this.variables = {};
};

View.prototype.setTemplateName = function(templateName) {
	this.templateName = templateName;
};

View.prototype.assign = function(variable, value) {
	this.variables[variable] = value;
};