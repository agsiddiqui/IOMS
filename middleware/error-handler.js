import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Somthing went wrong, try again later',
  };

  if (err.name === 'ValidationError') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    // defaultError.msg = err.message;
    defaultError.msg = Object.values(err.errors)
      .map((items) => items.message)
      .join(',');
  }

  if (err.code && err.code === 11000) {
    defaultError.statusCode = err.statusCode || StatusCodes.BAD_REQUEST;
    // defaultError.msg = err.message;
    defaultError.msg = `${Object.keys(err.keyValue)} is already registered`;
  }

  // res.status(defaultError.statusCode).json({ msg: err });
  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};

export default errorHandlerMiddleware;
