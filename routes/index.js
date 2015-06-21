var express = require('express');
var router = express.Router();
var search = require('../common/searchclient');

var _index = "deployments";
var _type = 'endpoint';

var _search_fields = ["name^100", "platform^20", "category^5", "dev^3", "int^10", "qa^50"];

var _simple_suggest_phrase = {
    "field": "name",
    "size": 1,
    "real_word_error_likelihood": 0.95,
    "max_errors": 0.5,
    "gram_size": 2,
    "direct_generator": [{
        "field": "name",
        "suggest_mode": "always",
        "min_word_length": 1
    }],
    "highlight": {
        "pre_tag": "<b><em>",
        "post_tag": "</em></b>"
    }
};

var _aggregations = {
    "category": {
        "terms": {
            "field": "category.raw"
        }
    },
    "dev": {
        "terms": {
            "field": "dev.raw"
        }
    },
    "int": {
        "terms": {
            "field": "int.raw"
        }
    },
    "qa": {
        "terms": {
            "field": "qa.raw"
        }
    },
    "prod": {
        "terms": {
            "field": "prod"
        }
    }
};

/* GET home page. */
router.get('/', function(req, res) {
    var aggValue = req.query.agg_value;
    var aggField = req.query.agg_field;

    //Provide a default search string if none provided
    var queryString = req.query.q === undefined ? "Platforms" : req.query.q;

    var filter = {};
    filter[aggField] = aggValue;

    search.getClient().search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "filtered": {
                    "query": {
                        "multi_match": {
                            "query": queryString,
                            "fields": _search_fields,
                            "fuzziness": 1
                        }
                    },
                    "filter": {
                        "term": (aggField ? filter : undefined)
                    }
                }

            },
            "aggs": _aggregations,
            "suggest": {
                "text": queryString,
                "simple_phrase": {
                    "phrase": _simple_suggest_phrase
                }
            }
        }
    }).then(function (resp) {
        res.render('index', {title: 'Platforms', response: resp, query: req.query.q});
    }, function (err) {
        console.trace(err.message);
        res.render('index', {title: 'Platforms', response: err.message});
    });
});

module.exports = router;
