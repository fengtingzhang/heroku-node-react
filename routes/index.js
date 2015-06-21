var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var fs = require('fs');

var elasticSearchUrl = 'localhost:9200';
if (process.env.ELASTICSEARCH_URL) {
    elasticSearchUrl = process.env.ELASTICSEARCH_URL;
}

var client = new elasticsearch.Client({
    host: elasticSearchUrl,
    log: 'debug'
});

var _index = "deployments";
var _type = 'endpoint';

var _index_mappings = {
    "endpoint": {
        "properties": {
            "dev": {
                "type": "string",
                "fields": {
                    "raw": {"type": "string", "index": "not_analyzed"}
                }
            },
            "category": {
                "type": "string",
                "fields": {
                    "raw": {"type": "string", "index": "not_analyzed"}
                }
            },
            "name": {
                "type": "string",
                "fields": {
                    "autocomplete": {"type": "string", "index_analyzer": "autocomplete"}
                }
            },
            "platform": {
                "type": "string"
            },
            "prod": {
                "type": "string", "index": "not_analyzed"
            },
            "qa": {
                "type": "string",
                "fields": {
                    "raw": {"type": "string", "index": "not_analyzed"}
                }
            },
            "int": {
                "type": "string",
                "fields": {
                    "raw": {"type": "string", "index": "not_analyzed"}
                }
            }
        }
    }
};

var _index_settings = {
    "analysis": {
        "filter": {
            "autocomplete_filter": {
                "type": "edge_ngram",
                "min_gram": 1,
                "max_gram": 10
            }
        },
        "analyzer": {
            "autocomplete": {
                "type": "custom",
                "tokenizer": "standard",
                "filter": [
                    "lowercase",
                    "autocomplete_filter"
                ]
            }
        }
    }
};


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

// Provide a route for reprocessing some data
router.get('/reprocess', function (req, res) {
    client.indices.delete({index: _index});
    client.indices.create({
        index: _index,
        body: {
            "settings": _index_settings,
            "mappings": _index_mappings
        }

    }, function (error, response) {
        fs.readFile('endpoints.json', 'utf8', function (err, data) {
            if (err) throw err;
            var body = [];
            JSON.parse(data).forEach(function (item) {
                body.push({"index": {"_index": _index, "_type": _type}});
                body.push(item);
            });

            client.bulk({
                body: body
            }, function (err, resp) {
                res.render('index', {title: 'Platforms', result: 'Indexing Completed!'});
            })
        });
    })
});

router.get('/autocomplete', function (req, res) {
    client.search({
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

/* GET home page. */
router.get('/', function(req, res) {
    var aggValue = req.query.agg_value;
    var aggField = req.query.agg_field;

    //Provide a default search string if none provided
    var queryString = req.query.q === undefined ? "Platforms" : req.query.q;

    var filter = {};
    filter[aggField] = aggValue;

    client.search({
        index: _index,
        type: _type,
        body: {
            "query": {
                "filtered": {
                    "query": {
                        "multi_match": {
                            "query": queryString,
                            "fields": ["name^100", "platform^20", "category^5", "dev^3", "int^10", "qa^50"],
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
    //res.render('index', { title: 'Platforms' });
});

module.exports = router;
