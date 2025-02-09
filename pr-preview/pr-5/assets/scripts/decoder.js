// from: https://spencermortensen.com/articles/email-obfuscation
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const rot18 = new Rot18();
  const coder = new LinkCoder(rot18);

  document.querySelectorAll('.enc').forEach(coder.decode.bind(coder));
});


// Rot18

function Rot18() {
  this.lowercase = new Rotater('a', 'z', 13);
  this.uppercase = new Rotater('A', 'Z', 13);
  this.digits = new Rotater('0', '9', 5);
}

Rot18.prototype.encode = function (text) {
  text = this.lowercase.encode(text);
  text = this.uppercase.encode(text);
  text = this.digits.encode(text);

  return text;
}

Rot18.prototype.decode = function (text) {
  text = this.lowercase.decode(text);
  text = this.uppercase.decode(text);
  text = this.digits.decode(text);

  return text;
}


// Rotater

function Rotater(c0, cN, offset) {
  const code0 = c0.charCodeAt(0);
  const codeN = cN.charCodeAt(0);
  const length = codeN - code0 + 1;

  this.re = new RegExp('[' + c0 + '-' + cN + ']', 'g');
  this.forward = Rotater.rotate.bind(Rotater, code0, length, offset);
  this.backward = Rotater.rotate.bind(Rotater, code0, length, length - offset);
}

Rotater.rotate = function (code0, length, offset, ci) {
  const iBefore = ci.charCodeAt(0) - code0;
  const iAfter = (iBefore + offset) % length;

  return String.fromCharCode(iAfter + code0);
}

Rotater.prototype.encode = function (text) {
  return text.replace(this.re, this.forward);
}

Rotater.prototype.decode = function (text) {
  return text.replace(this.re, this.backward);
}


// LinkCoder

function LinkCoder(coder) {
  this.coder = coder;
}

LinkCoder.prototype.encode = function (a) {
  const text = a.getAttribute('href');
  const code = this.coder.encode(text);

  a.setAttribute('href', code);
}

LinkCoder.prototype.decode = function (a) {
  const code = a.getAttribute('href');
  const text = this.coder.decode(code);

  a.setAttribute('href', text);
}