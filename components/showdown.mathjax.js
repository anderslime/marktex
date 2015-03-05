(function(){

    function guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
    }

    var mathjax = function(converter) {
        return [

            // @block jax syntax

            /*{ type: 'lang', regex: '(^|\\n\\s|^\\n)?~D~D(.*)~D~D(\\n\\n|$|\\n$)', replace: function(match, leadingSlash, equation) {
                // Check if we matched the leading \ and return nothing changed if so
                return '<p class="mj loader center">$%%' + equation + '$%%</p>';
            }},*/

            { type: 'lang', filter: function(text){
                var jax = function(e){ return '<p class="mj loader center">$' + e + '$</p>';};

                text = text.replace(/(?:^)~D~D(.*)~D~D(?:\n\s)/g, function(m, e){ return jax(e) + '\n\n'; } ); // jax as first thing in the text
                text = text.replace(/(?:\n\n)~D~D(.*)~D~D(?:$)/g, function(m, e){ return '\n\n' + jax(e); } ); // jax as last thing in the text
                text = text.replace(/((?:\n\n|~D\n\n)~D~D(.*)~D~D(?=\n\n))/g, function(m, f, e){                   // jax in the middle
                    return '\n\n' + jax(e);
                });
                // Check if we matched the leading \ and return nothing changed if so
                return text;
            }},

            // @inline jax syntax
            { type: 'lang', regex: '\\B(\\\\)?~D(.*)~D', replace: function(match, leadingSlash, equation) {
                // Check if we matched the leading \ and return nothing changed if so
                if (leadingSlash === '\\') {
                    return match;
                } else {
                    return '<span class="mj loader">$' + equation + '$</span>';
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