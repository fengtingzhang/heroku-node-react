var elasticsearch = require('elasticsearch');

var searchclient = {
    _elasticSearchUrl = 'localhost:9200',
    _client,
    init: function() {
	    if (process.env.ELASTICSEARCH_URL) {
	        this._elasticSearchUrl = process.env.ELASTICSEARCH_URL;
	    }

	    this._client = new elasticsearch.Client({
	        host: this._elasticSearchUrl,
	        log: 'debug'
	    });
    },

    getClient: function() {
        return this._client;
    }
};

exports.searchclient = searchclient;