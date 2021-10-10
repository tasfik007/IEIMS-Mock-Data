"use strict";

module.exports = (req, res, next) => {
  const _send = res.send;
  const single = require("url").parse(req.originalUrl, true).query["single"];
  const filter_result = require("url").parse(req.originalUrl, true).query[
    "filter-result"
  ];
  const filter_profile = require("url").parse(req.originalUrl, true).query[
    "filter-profile"
  ];
  const classCode = require("url").parse(req.originalUrl, true).query[
    "classCode"
  ];

  var answer = null;
  var queryPassed = false;

  res.send = function (body) {
    if (single) {
      queryPassed = true;
      try {
        const json = JSON.parse(body);
        if (Array.isArray(json)) {
          if (json.length === 1) {
            answer = json[0];
          } else if (json.length === 0) {
            answer = {};
          }
        }
      } catch (e) {}
    }

    if (filter_result) {
      queryPassed = true;
      delete answer["result"];
    } else if (filter_profile) {
      queryPassed = true;
      var classExist = false;
      answer["result"].forEach((result) => {
        
        if (result["class"].toLowerCase() === classCode.toLowerCase()) {
          classExist = true;
          answer = result;
        }
      });

      if (classExist === false) answer = {};
    }

    answer = JSON.stringify(answer);

    if (queryPassed === false) return _send.call(this, body);

    if (answer === null) {
      return _send.call(this, "{}", 404);
    } else {
      return _send.call(this, answer);
    }
  };
  next();
};
