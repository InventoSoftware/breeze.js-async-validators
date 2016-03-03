'use strict';

export function setup(breeze) {
    const EntityAspect = breeze.EntityAspect;

    EntityAspect.prototype.validateEntityAsync = validateEntityAsync;
}


function validateEntityAsync () {
    let ok = true;
    this._processValidationOpAndPublish(function (that) {
        ok = validateTarget(that.entity);
    });
    return ok;
}

function validateTarget(target, coIndex) {
    const
        promises = [],
        stype = target.entity.entityType || target.entity.complexType,
        aspect = target.entity.entityAspect || target.entity.complexAspect,
        entityAspect = target.entity.entityAspect || target.entity.complexAspect.getEntityAspect(),
        context = {entity: entityAspect.entity};

    if (coIndex !== undefined) {
        context.index = coIndex;
    }

    stype.getProperties().forEach(p => {
        var value = target.entity.getProperty(p.name);
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