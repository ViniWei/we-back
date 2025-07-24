function buildStandardResponse(message, businessCode, error) {
    const response = {
        message,
        businessCode
    }; 

    if (error) response.error = error;

    return response;
}

export default {
    buildStandardResponse,
};
