module.exports = (req, res, next) => {
  const _send = res.send;
  const requestPath = require("url").parse(req.originalUrl, true);
  const queryParams = {
    single: requestPath.query["single"],
    filter_result: requestPath.query["filter-result"],
    filter_profile: requestPath.query["filter-profile"],
    classCode: requestPath.query["classCode"]?.toString().toLowerCase(),
  };
  let hasQuery = false;
  for (let key in queryParams) hasQuery = hasQuery || queryParams[key];

  res.send = function (body) {
    let answer = null;
    if (!hasQuery) _send.call(this, body);
    if (queryParams["single"]) {
      try {
        const json = JSON.parse(body);
        if (Array.isArray(json)) {
          if (json.length === 1) {
            answer = json[0];
          } else if (json.length === 0) {
            answer = null;
          }
        }
      } catch (e) {}
    }

    if (queryParams["filter_result"]) delete answer["result"];
    if (queryParams["filter_profile"]) {
      let results = answer["result"];
      results.forEach((result) => {
        if (result["class"].toLowerCase() === queryParams["classCode"]) {
          answer = result;
        }
      });
    }

    if (answer === null) return _send.call(this, "{}", 404);
    return _send.call(this, JSON.stringify(answer));
  };
  next();
};
