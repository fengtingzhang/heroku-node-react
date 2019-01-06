var React = require('react');
var createReactClass = require('create-react-class');

module.exports = createReactClass({
    getInitialState: function(){
        return { filterString: '' };
    },

    handleChange: function(e){
        this.setState({filterString:e.target.value});
    },

    render: function() {
        console.log('render');
        var domains = this.props.items;
        var filterString = this.state.filterString.trim().toLowerCase();

        if(filterString.length > 0){
            // Filter the results.
            domains = domains.filter(function(d){
                return d.name.toLowerCase().match( filterString ) || d.url.toLowerCase().match( filterString );
            });
        }

        return <div>
                    <div className="input-group">
                      <input type="text" id="filter-by" className="form-control" value={this.state.filterString} onChange={this.handleChange} placeholder="Filter" />
                      <span className="input-group-addon" id="basic-addon"><i className="fa fa-search"></i></span>
                    </div>
                    <ul className="list-group">
                        {
                            domains.map(function(l){
                                return <li className="list-group-item"><i className="fa fa-cube"></i>{l.name}
                                            <a href={l.url}>{l.url}</a>
                                       </li>
                            })
                        }
                    </ul>
                </div>;
    }
});
