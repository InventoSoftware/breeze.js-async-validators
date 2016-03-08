'use strict';

export default function(breeze) {
    const EntityAspect = breeze.EntityAspect;
    
    EntityAspect.prototype.validatePropertyAsync = validatePropertyAsync;
    EntityAspect.prototype.validateEntityAsync = validateEntityAsync;

    function validateEntityAsync () {
        let promise;

        this._processValidationOpAndPublish(function (that) {
            promise = validateTarget(that.entity);
        });
        return promise;
    }

    function validateTarget(entity, coIndex) {
        const
            promises = [],
            stype = entity.entityType || entity.complexType,
            aspect = entity.entityAspect || entity.complexAspect,
            entityAspect = entity.entityAspect || entity.complexAspect.getEntityAspect(),
            context = {entity: entityAspect.entity};

        if (coIndex !== undefined) {
            context.index = coIndex;
        }

        stype.getProperties().forEach(p => {
            var value = entity.getProperty(p.name);
            var validators = p.getAllValidators();
            if (validators.length > 0) {
                context.property = p;
                context.propertyName = aspect.getPropertyPath(p.name);

                validators.forEach(validator => {
                    promises.push(validate(validator, value, context));
                });
            }

            // TODO handle complex types
        });

        // // TODO move it outside
        // entity._triggerValidation = false;

        return promises;
    }

    function validate(validator, value, context) {
        return new Promise(resolve => {
            const result = validator.validate(value, context);
            if(typeof result === 'function') {
                result.then(res => {
                    if (res) {
                        // TODO move it outside
                        context.entity.entityAspect.addValidationError(res);
                        resolve(res);
                    } else {
                        const key = breeze.ValidationError.getKey(validator, context ? context.propertyName : null);
                        // TODO move it outside
                        context.entity.entityAspect.removeValidationError(key);
                        resolve(res);
                    }
                });
            } else {
              if(result) {
                context.entity.entityAspect.addValidationError(result);
                resolve(result);
              } else {
                const key = breeze.ValidationError.getKey(validator, context ? context.propertyName : null);
                // TODO move it outside
                context.entity.entityAspect.removeValidationError(key);
                resolve(result);
              }
            }
        });
    }
    
    function validatePropertyAsync (property, context) {
        var value = this.getPropertyValue(property); // performs validations
        if (value && value.complexAspect) {
          return validateTarget(value);
        }
        
        context = context || {};
        context.entity = this.entity;
        
        if (typeof(property) === 'string') {
          context.property = this.entity.entityType.getProperty(property, true);
          context.propertyName = property;
        } else {
          context.property = property;
          context.propertyName = property.name;
        }

        const validators = context.property
            .getAllValidators()
            .map(validator => validate(validator, value, context))

        return Promise.all(validators).then(errors => errors.filter(error => error !== null));
    }
}