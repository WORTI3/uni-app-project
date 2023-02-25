const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../assets/constants');
const { validationResult } = require('express-validator');

function checkValidationResult(req, res, next) {
  const result = validationResult(req).array();
  if (result.length > 0) {
    const messages = result.map(error => error.msg);
    req.session.messages = messages;
    // global vars:
    if(req.body.username){
      req.session.username = req.body.username;
    }
    if(req.body.item){
      req.session.name = req.body.item;
    }
    if(req.body.assetCode){
      req.session.code = req.body.assetCode;
    }
    if(req.body.note){
      req.session.note = req.body.note;
    }
    // don't have to clean url here.. original should be fine.
    var url = req.originalUrl;
    if (url.endsWith('/delete')) {
      url = url.replace('delete', 'edit');
    }
    return res.redirect(url);
  }
  next();
};

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 1) {
    return next();
  }
  req.session.messages = [ ERROR_MESSAGES.NO_PERMISSION ];
  res.redirect('/' + req.params.id + '/edit');
}

module.exports = { checkValidationResult, isAdmin };
