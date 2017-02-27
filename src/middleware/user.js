module.exports = (req, res, next) => {
  req.session.token = '1234'
  req.session.user = {
    id: '038b6067-8dc2-448a-a42a-1fc0f0fa6482',
    name: 'Fred Jones',
    team: 'London'
  }

  res.locals.user = req.session.user
  next()
}
