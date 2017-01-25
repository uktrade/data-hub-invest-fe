module.exports = (req, res, next) => {
  req.session.token = '1234'
  req.session.user = {
    id: 1234,
    name: 'Fred Jones',
    team: 'London'
  }

  res.locals.user = req.session.user
  next()
}
