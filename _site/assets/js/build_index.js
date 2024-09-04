const fs = require( 'fs' );
const lunr = require( 'lunr' );

require( "lunr-languages/lunr.stemmer.support" )( lunr )
require( "lunr-languages/lunr.multi" )( lunr )
require( "lunr-languages/lunr.de" )( lunr )
require( "lunr-languages/lunr.fr" )( lunr )
require( "lunr-languages/lunr.it" )( lunr )

// Expects two arguments: input and output files
var scriptArgs = process.argv.slice( 2 );
var inputFile = scriptArgs[0];
var outputFile = scriptArgs[1];

var documents;
// Read the input file
fs.readFile( inputFile, 'utf8', ( err, data ) =>
{
    if (err) {
        console.error(err)
        return
    }
    documents = JSON.parse( data );

    // Because trimming does not work with multiLanguages in lunr - see below
    // we remove the ’ (\u2019) by hand in the document. 
    // This is not particularly elegant but at least works perfectly well
    for ( var i = 0; i < documents.length; i++ )
    {
        var doc = documents[i];
        doc['body'] = doc['body'].replace( /\u2019/g, ' ' );
        doc['title'] = doc['title'].replace( /\u2019/g, ' ' );
    }

    /*
    // Attempt to add a apostrophe trimmer to fix the problem with xx's searches
    // Unfortunately, this does not work.
    var apostropheSTrimmer = function ( token )
    {
        return token.update( function ( s )
        {
            //if ( s.match( /\u2019$/g ) ) console.log(s);
            return s.replace(/\u2019$/, '')
        })
    }

    lunr.Pipeline.registerFunction(apostropheSTrimmer, 'apostropheSTrimmer')
    */

    // Build the index
    var idx = lunr( function ()
    {
        this.use( lunr.multiLanguage( 'en', 'de', 'fr', 'it' ) )
        /*
        // This works only when multiLanguage is not set..
        this.pipeline.remove( lunr.trimmer )
        this.pipeline.add( apostropheSTrimmer )
        */
        this.ref( 'id' )
        this.field( 'title' )
        this.field( 'body' )
        this.field( 'lang' )
        this.field( 'post' )
        this.field( 'category' )
        this.field( 'date' )

        documents.forEach( function ( doc )
        {
            this.add( doc )
        }, this )
    } );

    // Write the index file
    fs.writeFile( outputFile, JSON.stringify( idx ), err =>
    {
        if ( err )
        {
            console.error( err )
            return;
        }
    })
})
