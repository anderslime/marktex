(function(){

    var linebreak = function(converter) {
        return [

            // @username syntax
            { type: 'lang', regex: '(.+)\n', replace: function(line, match) {
                return  match + '<br/>';
            }}
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.linebreak = linebreak; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = linebreak;

}());