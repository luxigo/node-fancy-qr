var QRCode = require('qrcode');
var fs = require('fs');
var extend = require('extend');
var sharp = require('sharp');

var defaultWidth=140;

var drawLogo = function(logo, qrcode, options, callback) {

  var border=options.logoBorder||0;
  sharp(logo)
    .extend({
      top: border,
      bottom: border,
      left: border,
      right: border,
      background: options.logoBorderColor||'#FFFFFF'
    })
    .toBuffer()
    .then(function(logo){
      sharp(qrcode)
        .composite([ { input: logo } ])
        .toBuffer()
        .then(function(buf){
          callback(null,buf);
        })
        .catch(function(err){
          console.log(err);
          callback(err);
        })
    });
};

var perform = exports.draw = function(text, options, nextStep) {
  options=extend(true, {
      errorCorrectionLevel: 'H',
      width: defaultWidth
    },
    options
  );
  QRCode.toBuffer(text, options, function(err, buffer) {
    if (err)
      nextStep(err, null);
    if (options.logoPath) {
      if (options.logoResize) {
        sharp(options.logoPath)
          .resize(Math.floor(options.width*0.2))
          .toBuffer()
          .then(function(logo){
            drawLogo(logo, buffer, options, nextStep);
          })
          .catch(nextStep)
      } else {
        drawLogo(logoPath, buffer, options, nextStep);
      }
    } else {
      nextStep(null, buffer);
    }
  });
};

exports.save = function(outputPath, text, options, callback) {
  perform(text, options, function(err, buffer) {
    if (err)
      callback(err);
    fs.writeFile(outputPath,buffer,null,callback);
  });
};
