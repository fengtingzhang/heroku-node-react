var express = require('express');
var router = express.Router();
var search = require('../common/searchclient');

var _index = "deployments";
var _type = 'endpoint';

router.get('/autocomplete', function (req, res) {
    search.getClient().search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "filtered": {
                    "query": {
                        "multi_match": {
                            "query": req.query.term,
                            "fields": ["name.autocomplete"]
                        }
                    }
                }
            }
        }
    }).then(function (resp) {
        var results = resp.hits.hits.map(function(hit){
            return hit._source.name;
        });

        res.send(results);
    }, function (err) {
        console.trace(err.message);
        res.send({response: err.message});
    });
});

module.exports = router;
