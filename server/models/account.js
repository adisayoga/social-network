var crypto = require('crypto');

module.exports = function(app, config, mongoose, nodemailer) {
  var StatusSchema = new mongoose.Schema({
    name: {
      first: { type: String },
      last:  { type: String }
    },
    status:  { type: String }
  });

  var schemaOptions = {
    toJSON:   { virtuals: true },
    toObject: { virtuals: true }
  };

  var ContactSchema = new mongoose.Schema({
    name: {
      first:   { type: String },
      last:    { type: String }
    },
    accountId: { type: mongoose.Schema.ObjectId },
    added:     { type: Date },     // When the contact was added
    updated:   { type: Date }      // When the contact last updated
  }, schemaOptions);

  ContactSchema.virtual('online').get(function() {
    return app.isAccountOnline(this.get('accountId'));
  });

  var AccountSchema = new mongoose.Schema({
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
    contacts:   [ContactSchema],
    statuses:   [StatusSchema], // My own status updates only
    activities: [StatusSchema]  // All status opdates including friends
  });

  return {
    Model: mongoose.model('Account', AccountSchema),

    addContact: function(account, contact) {
      account.contacts.push({
        name:      { first: contact.name.first, last: contact.name.last },
        accountId: contact._id,
        added:     new Date(),
        updated:   new Date()
      });
      account.save(function(err) {
        if (err) console.log('Error saving account: ' + err);
      });
    },

    removeContact: function(account, contactId) {
      if (account.contacts === null) return;

      account.contacts.forEach(function(contact) {
        if (contact.accountId == contactId)
          account.contacts.remove(contact);
      });
      account.save();
    },

    hasContact: function(account, contactId) {
      if (account.contacts === null) return false;

      account.contacts.forEach(function(contact) {
        if (contact.accountId === contactId) return true;
      });
      return false;
    },

    changePassword: function(accountId, newPassword, callback) {
      var hash     = crypto.createHash('sha256');
      var password = hash.update(newPassword).digest('hex');

      var conditions = { _id: accountId };
      var doc        = { $set: { password: password }};
      var options    = { upsert: false };

      this.Model.update(conditions, doc, options, function(err) {
        callback(!err);
        console.log(err ? err : 'Change password done for account ' + accountId);
      });
    },

    forgotPassword: function(email, resetPasswordUrl, callback) {
      this.Model.findOne({ email: email }, function(err, doc) {
        if (err || doc === null) return callback(false);

        resetPasswordUrl += '?account=' + doc._id;
        var message = {
          from:    'adisayoga@gmail.com',
          to:      doc.email,
          subject: 'SocialNet Password Request',
          text:    'Click here to reset your password: ' + resetPasswordUrl
        };

        var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
        smtpTransport.sendMail(message, function(err) {
          callback(!err);
          console.log(err);
        });
      });
    },

    login: function(email, password, callback) {
      var hash = crypto.createHash('sha256');
      var conditions = {
        email:    email,
        password: hash.update(password).digest('hex')
      };
      this.Model.findOne(conditions, function(err, doc) {
        callback(doc !== null, doc);
      });
    },

    register: function(data, callback) {
      console.log('Registering ' + data.email);

      var hash = crypto.createHash('sha256');
      data.password = hash.update(data.password).digest('hex');

      var user = new this.Model(data);
      user.save(function(err) {
        callback(!err);
        console.log(err ? err : 'Account was created');
      });

      console.log('Save command was sent');
    },

    find: function(id, callback) {
      this.Model.findOne({ _id: id }, function(err, doc) {
        callback(doc);
      });
    },

    search: function(searchText, callback) {
      var searchRegex = new RegExp(searchText, 'i');
      this.Model.find({
        $or: [
          { 'name.full': { $regex: searchRegex }},
          { 'email':     { $regex: searchRegex }}
        ]
      }, callback);
    }

  };
};

