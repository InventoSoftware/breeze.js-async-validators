System.registerDynamic("npm:breeze-client@1.5.5.js",["npm:breeze-client@1.5.5/breeze.debug.js"],!0,function(a,b,c){return c.exports=a("npm:breeze-client@1.5.5/breeze.debug.js"),c.exports}),System.register("index.js",["breeze"],function(a){"use strict";function b(){var a=!0;return this._processValidationOpAndPublish(function(b){a=c(b.entity)}),a}function c(a,b){var c=[],d=a.entity.entityType||a.entity.complexType,e=a.entity.entityAspect||a.entity.complexAspect,f=a.entity.entityAspect||a.entity.complexAspect.getEntityAspect(),g={entity:f.entity};return void 0!==b&&(g.index=b),d.getProperties().forEach(function(b){var d=a.entity.getProperty(b.name),f=b.getAllValidators();f.length>0&&(g.property=b,g.propertyName=e.getPropertyPath(b.name),f.forEach(function(b){c.push(validate(a,b,d,g))}))}),a._triggerValidation=!1,c}var d,e;return{setters:[function(a){d=a["default"]}],execute:function(){e=d.EntityAspect,e.prototype.validateEntityAsync=b}}});