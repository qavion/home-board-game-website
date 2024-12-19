function handler(event) {
    const request = event.request;
    const headers = request.headers;

    const authString = `Basic ${authString}`;

    if (
        !headers.authorization ||
        headers.authorization.value !== authString
    ) {
        return {
            statusCode: 401,
            statusDescription: "Unauthorized",
            headers: {
                "www-authenticate": { value: "Basic" },
            },
        };
    }

    return request;
}