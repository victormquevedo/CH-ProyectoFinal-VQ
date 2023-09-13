export const loggerTest = async (req, res, next) => {
  try {
    req.logger.fatal(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url}`);
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url}`);
    req.logger.warning(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url}`);
    req.logger.info(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url}`);
    req.logger.debug(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url}`);
    res.status(200).send('Logs impressed in console');
  } catch (err) {
    req.logger.error(`${new Date().toLocaleTimeString()} - ${req.method} - ${req.url} - ${err.message}`);
    next(err);
  }
};
