'use strict';

export default function(breeze) {
    const EntityAspect = breeze.EntityAspect;

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
                    promises.push(validate(entity, validator, value, context));
                });
            }

            // TODO handle complex types
        });

        // TODO move it outside
        entity._triggerValidation = false;

        return promises;
    }

    function validate(entityAspect, validator, value, context) {
        return new Promise(resolve => {
            const result = validator.validate(value, context);
            if(typeof result === 'function') {
                result.then(function (res) {
                    if (res) {
                        // TODO move it outside
                        entityAspect._addValidationError(res);
                        resolve(res);
                    } else {
                        var key = breeze.ValidationError.getKey(validator, context ? context.propertyName : null);
                        // TODO move it outside
                        entityAspect._removeValidationError(key);
                        resolve(res);
                    }
                });
            } else {
                resolve(result);
            }
        });
    }
}