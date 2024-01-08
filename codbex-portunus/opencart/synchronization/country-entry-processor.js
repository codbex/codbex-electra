function modifyBooleanProperty(body, propertyKey) {
    const propertyValue = body.get(propertyKey);
    if (typeof propertyValue !== 'undefined') {
        const finalPropertyValue = propertyValue ? 1 : 0;
        body.put(propertyKey, finalPropertyValue);
    }
}

function escapeSQLSymbols(body, propertyKey) {
    const propertyValue = body.get(propertyKey);
    if (typeof propertyValue !== 'undefined') {
        const finalPropertyValue = propertyValue.replaceAll("'", "''");
        body.put(propertyKey, finalPropertyValue);
    }
}

exports.onMessage = function (message) {
    const body = message.getBody();
    modifyBooleanProperty(body, "status");
    modifyBooleanProperty(body, "postcode_required");
    escapeSQLSymbols(body, "name");

    return message;
};