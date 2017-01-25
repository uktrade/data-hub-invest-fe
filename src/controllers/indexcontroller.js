const dashboardService = require('../services/dashboardservice');

module.exports = (req, res) => {
  const days = 15;
  res.render('index');
};
