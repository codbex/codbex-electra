function escapeSQLSymbols(body, propertyKey) {
    const propertyValue = body.get(propertyKey);
    if (propertyValue) {
        const finalPropertyValue = propertyValue.replaceAll("'", "''");
        body.put(propertyKey, finalPropertyValue);
    }
}

exports.onMessage = function (message) {
    const body = message.getCamelMessage().getBody();

    escapeSQLSymbols(body, "name");
    escapeSQLSymbols(body, "description");
    escapeSQLSymbols(body, "tag");
    escapeSQLSymbols(body, "meta_title");
    escapeSQLSymbols(body, "meta_description");
    escapeSQLSymbols(body, "meta_keyword");

    return message;
};