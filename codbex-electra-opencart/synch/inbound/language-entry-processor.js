function modifyBooleanProperty(body, propertyKey) {
    const propertyValue = body.get(propertyKey);
    if (typeof propertyValue !== 'undefined') {
        const finalPropertyValue = propertyValue ? 1 : 0;
        body.put(propertyKey, finalPropertyValue);
    }
}

exports.onMessage = function (message) {
    const body = message.getCamelMessage().getBody();
    modifyBooleanProperty(body, "status");

    return message;
};