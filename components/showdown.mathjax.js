(function(){

    function guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
    }

    var mathjax = function(converter) {
        return [

            // @username syntax
            { type: 'lang', regex: '\\B(\\\\)?~D(.+)~D', replace: function(match, leadingSlash, equation) {
                // Check if we matched the leading \ and return nothing changed if so
                if (leadingSlash === '\\') {
                    return match;
                } else {
                    //hacking a guid onto here, as the id attribute is stripped later in the pipeline
                    return '<div><div class="math loader" href="' + guid() + '">$' + equation + '$</div></div>';
                }
            }},

            // Escaped $'s
            { type: 'lang', regex: '\\\\$', replace: '$' }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.mathjax = mathjax; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = mathjax;

}());