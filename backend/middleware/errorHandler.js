const errorHandler = (err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	const statusCode = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 600
		? err.statusCode
		: 500;
	const message = statusCode === 500 && process.env.NODE_ENV === 'production'
		? 'Internal server error'
		: err.message || 'Internal server error';

	res.status(statusCode).json({ message });
};

module.exports = errorHandler;
