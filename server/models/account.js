var nodemailer = require('nodemailer');
var crypto = require('crypto');

var AccountModel = function(app, mongoose, config) {
  var schemaOptions = {
    toJSON:   { virtuals: true },
    toObject: { virtuals: true }
  };

  var contactSchema = new mongoose.Schema({
    name: {
      first:   { type: String },
      last:    { type: String }
    },
    accountId: { type: mongoose.Schema.ObjectId },
    added:     { type: Date },     // When the contact was added
    updated:   { type: Date }      // When the contact last updated
  }, schemaOptions);

  contactSchema.virtual('online').get(function() {
    return app.isAccountOnline(this.get('accountId'));
  });

  var statusSchema = new mongoose.Schema({
    name: {
      first: { type: String },
      last:  { type: String }
    },
    status:  { type: String }
  });

  var accountSchema = new mongoose.Schema({
    email:      { type: String, unique: true },
    password:   { type: String },
    name: {
      first:    { type: String },
      last:     { type: String }
    },
    birthday: {
      day:      { type: Number, min: 1, max: 31, required: false },
      month:    { type: Number, min: 1, max: 12, required: false },
      year:     { type: Number }
    },
    photoUrl:   { type: String },
    biography:  { type: String },
    contacts:   [contactSchema],
    statuses:   [statusSchema], // My own status updates only
    activities: [statusSchema]  // All status opdates including friends
  });

  this.model = mongoose.model('Account', accountSchema);
};

AccountModel.prototype = {
  model: null,

  addContact: function(account, contact) {
    account.contacts.push({
      name:      { first: contact.name.first, last: contact.name.last },
      accountId: contact._id,
      added:     new Date(),
      updated:   new Date()
    });
    account.save(function(error) {
      if (error) console.error('Error saving account:', error);
    });
  },

  removeContact: function(account, contactId) {
    if (account.contacts === null) return;

    account.contacts.forEach(function(contact) {
      if (contact.accountId === contactId)
        account.contacts.remove(contact);
    });
    account.save(function(error) {
      if (error) console.error('Error removing account:', error);
    });
  },

  hasContact: function(account, contactId) {
    if (account.contacts === null) return false;

    account.contacts.forEach(function(contact) {
      if (contact.accountId === contactId) return true;
    });
    return false;
  },

  changePassword: function(accountId, newPassword, callback) {
    var hash = crypto.createHash('sha256');
    var password = hash.update(newPassword).digest('hex');

    var conditions = { _id: accountId };
    var doc        = { $set: { password: password }};
    var options    = { upsert: false };

    this.model.update(conditions, doc, options, function(error) {
      callback(!error);
      if (error) console.error('Error changing password:', error);
    });
  },

  forgotPassword: function(email, resetPasswordUrl, callback) {
    this.model.findOne({ email: email }, function(error, doc) {
      if (error || doc === null) return callback(false);

      resetPasswordUrl += '?account=' + doc._id;
      var message = {
        from:    'adisayoga@gmail.com',
        to:      doc.email,
        subject: 'SocialNet Password Request',
        text:    'Click here to reset your password: ' + resetPasswordUrl
      };

      var smtpTransport = nodemailer.createTransport('SMTP', this.config.mail);
      smtpTransport.sendMail(message, function(error) {
        callback(!error);
        if (error) console.error('Error sending email:', error);
      });
    });
  },

  login: function(email, password, callback) {
    var hash = crypto.createHash('sha256');
    var conditions = {
      email:    email,
      password: hash.update(password).digest('hex')
    };
    this.model.findOne(conditions, function(error, doc) {
      callback(doc !== null, doc);
    });
  },

  register: function(data, callback) {
    var hash = crypto.createHash('sha256');
    data.password = hash.update(data.password).digest('hex');

    var user = new this.model(data);
    user.save(function(error) {
      callback(!error);
      if (error) console.error('Error registering account:', error);
    });
  },

  find: function(id, callback) {
    this.model.findOne({ _id: id }, function(error, doc) {
      callback(doc);
    });
  },

  search: function(searchText, callback) {
    var searchRegex = new RegExp(searchText, 'i');
    this.model.find({
      $or: [
        { 'name.full': { $regex: searchRegex }},
        { 'email':     { $regex: searchRegex }}
      ]
    }, callback);
  }
};

module.exports = function(app, mongoose) {
  return new AccountModel(app, mongoose);
};
