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