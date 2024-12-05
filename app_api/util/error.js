const error = (status, message) => {
    return Promise.reject([status, { "message": message }])
}

const handleError = (err, res) => {
    if (Array.isArray(err) &&
        err.length === 2 &&
        typeof err[0] === 'number'
    ) {
        res
            .status(err[0])
            .json(err[1])
    } else { // Default to server error
        res
            .status(500)
            .json(err)
    }
}

module.exports = {
    error,
    handleError
};