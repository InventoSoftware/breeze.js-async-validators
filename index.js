'use strict';

let breeze;

export function setup(breezeGlobal) {
    breeze = breezeGlobal;

    const EntityAspect = breeze.EntityAspect;

    EntityAspect.prototype.validateEntityAsync = validateEntityAsync;
}

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
                promises.push(validate(target, validator, value, context));
            });
        }

        // TODO handle complex types
    });

    // TODO move it
    target._triggerValidation = false;

    return promises;
}

function validate(entityAspect, validator, value, context) {
    return validator.validate(value, context)
        .then(function(res) {
            if (res) {
                entityAspect._addValidationError(res);
                return res;
            } else {
                var key = breeze.ValidationError.getKey(validator, context ? context.propertyName : null);
                entityAspect._removeValidationError(key);
                return null;
            }
        });
}