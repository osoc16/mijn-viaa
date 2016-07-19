var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var environments = {
  qas: [base, qas, authentication],
  development: [base, dev],
  dev_auth: [base, dev, authentication]
};

var basedir = path.join(__dirname, '../../');

function pathFromServer (p) {
  return path.join(basedir, 'server/', p || '.');
}

function pathFromApp (p) {
  return path.join(basedir, 'app/', p || '.');
}

function base () {
  return {
    servicesMap: {
      'mediahaven (mam)': 'MAM',
      'amsweb': 'AMS',
      'FTP': 'FTP',
      'DBS': 'DBS'
    },
    muleEndpoint: 'http://do-qas-esb-01.do.viaa.be:10005/',
    app: {
      name: 'mijn.VIAA',
      port: process.env.PORT || 1337,
      sessionSecret: process.env.SESSION_SECRET || 'mijnVIAAetc'
    },
    paths: {
      server: pathFromServer,
      app: pathFromApp
    },
    path: pathFromServer  //deprecated
  };
}

function dev () {
  return {
    fakeServicesAvailable: {"MAM": 1, "AMS": 1, "FTP": 1},
    apiDelay: {
      min: 0,
      max: 1
    },
    showErrors: true
  };
}

function qas () {
  return {
    app: {
      name: 'mijn.VIAA',
      port: process.env.PORT || 3000,
      sessionSecret: process.env.SESSION_SECRET || 'mijnVIAAetc'
    },
    showErrors: true
  };
}

function authentication () {
  return {
    apiDelay: null,
    passport: {
      strategy: 'saml',
      saml: {
        // URL that goes from the Identity Provider -> Service Provider
        callbackUrl: process.env.SAML_PATH || 'mijn-qas.viaa.be/login/callback',

        // URL that goes from the Service Provider -> Identity Provider
        entryPoint: process.env.SAML_ENTRY_POINT || 'https://idp-qas.viaa.be/saml2/idp/SSOService.php',

        // Usually specified as `/shibboleth` from site root
        issuer: process.env.ISSUER || 'passport-saml',

        identifierFormat: null,

        // Service Provider private key
        // decryptionPvk: fs.readFileSync(pathFromServer('/cert/key.pem'), 'utf8'),

        // Service Provider Certificate
        // privateCert: fs.readFileSync(pathFromServer('/cert/cert.pem'), 'utf8'),

        // Identity Provider's public key
        cert: process.env.SAML_CERT || fs.readFileSync(pathFromServer('/cert/idp_cert.pem'), 'utf8'),

        validateInResponseTo: false,
        disableRequestedAuthnContext: true
      }
    }
  };
}

module.exports = function (environmentName) {
  var environmentSettings = environments[environmentName];
  if (!environmentSettings) {
    console.log("Error: environment: '" + environmentName + "' is unknown");
    process.exit(1);
  }

  var environment = {};

  _.each(environmentSettings, function (envGenerator) {
    _.extend(environment, envGenerator());
  });

  return environment;
};
