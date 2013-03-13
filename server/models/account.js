var crypto = require('crypto');

var account = function(config, mongose, nodemailer) {
  this.config     = config;
  this.mongose    = mongose;
  this.nodemailer = nodemailer;

  this.Model = mongose.model('Account', new this.mongose.Schema({
    email:     { type: String, unique: true },
    password:  { type: String },
    name: {
      first:   { type: String },
      last:    { type: String }
    },
    birthday: {
      day:     { type: Number, min: 1, max: 31, required: false },
      month:   { type: Number, min: 1, max: 12, required: false },
      year:    { type: Number }
    },
    photoUrl:  { type: String },
    biography: { type: String }
  }));
};

account.prototype.changePassword = function(accountId, newPassword, callback) {
  var hash     = crypto.createHash('sha256'),
      password = hash.update(newPassword).digest('hex');

  var conditions = { _id: accountId },
      doc        = { $set: { password: password }},
      options    = { upsert: false };

  this.Model.update(conditions, doc, options, function(err) {
    callback(!err);
    console.log(err ? err : 'Change password done for account ' + accountId);
  });
};

account.prototype.forgotPassword = function(email, resetPasswordUrl, callback) {
  this.Model.findOne({ email: email }, function(err, doc) {
    if (err) return callback(false);

    resetPasswordUrl += '?account=' + doc._id;
    var message = {
      from:    'adisayoga@gmail.com',
      to:      doc.email,
      subject: 'SocialNet Password Request',
      text:    'Click here to reset your password: ' + resetPasswordUrl
    };

    var smtpTransport = this.nodemailer.createTransport('SMTP', this.config.mail);
    smtpTransport.sendMail(message, function(err) {
      callback(!err);
    });
  });
};

account.prototype.login = function(email, password, callback) {
  var hash = crypto.createHash('sha256');
  var conditions = {
    email:    email,
    password: hash.update(password).digest('hex')
  };
  this.Model.findOne(conditions, function(err, doc) {
    callback(doc != null);
  });
};

account.prototype.register = function(data, callback) {
  console.log('Registering ' + data.email);

  var hash = crypto.createHash('sha256');
  data.password = hash.update(data.password).digest('hex');

  var user = new this.Model(data);
  user.save(function() {
    callback(!err);
    console.log(err ? err : 'Account was created');
  });

  console.log('Save command was sent');
};

module.exports = account;