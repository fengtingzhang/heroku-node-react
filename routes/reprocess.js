var express = require('express');
var router = express.Router();
var fs = require('fs');
var search = require('../common/searchclient');

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

// Provide a route for reprocessing some data
router.get('/reprocess', function (req, res) {
    search.getClient().indices.delete({index: _index});
    search.getClient().indices.create({
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

module.exports = router;
