const authorisedRequest = require('../lib/authorisedrequest');
const config = require('../config');

module.exports = function getQueueStatus(req, res) {
  const token = req.session.token;
  authorisedRequest(token, `${config.apiRoot}/task-info/`)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json({
        error: {
          statusMessage: error.response.statusMessage,
          statusCode: error.response.statusCode,
        },
      });
    });
};
