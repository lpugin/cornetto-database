

let searchResultsDiv = document.querySelector( "#search-results" );
let template = document.querySelector( "#search-item-template" );
let searchResultsCount = document.querySelector( "#search-results-count" );

let facetsDiv = document.querySelector( "#facets" );
let facetTemplate = document.querySelector( "#facet-template" );

let form = document.querySelector( "#search-form" );

// A lookup table of the indexed documents
let documentLookup = {};

// Function to get document by ID using the lookup table
function getDocumentById( id )
{
    return documentLookup[id];
}

// Loads the documents
fetch( "./scripts/pages.json" ).then( response =>
{
    return response.json();
} ).then( documents =>
{

    // Function to toggle the RISM Online iframe (hidden by default)
    function togglePreview( e )
    {
        // Get the next sibling element which should be the frame to toggle
        const toggleContent = this.nextElementSibling;
        if ( toggleContent )
        {
            // Toggle the display property of the content div
            if ( toggleContent.style.display === 'block' )
            {
                toggleContent.style.display = 'none'; // Show the content
            } else
            {
                toggleContent.style.display = 'block'; // Hide the content
            }
        }
    }

    // Function taking the list of result and returning a paginated version
    function paginateResults( results, page = 1, resultsPerPage = 10 )
    {
        const totalResults = results.length;
        const totalPages = Math.ceil( totalResults / resultsPerPage );

        const start = ( page - 1 ) * resultsPerPage;
        const end = start + resultsPerPage;

        const paginatedResults = results.slice( start, end );

        return {
            page: page,
            resultsPerPage: resultsPerPage,
            totalResults: totalResults,
            totalPages: totalPages,
            results: paginatedResults
        };
    }

    // Function looking at the facets existing in a list of results and counting them
    function aggregateFacets( results, facetName )
    {
        let facets = {};

        results.forEach( result =>
        {
            var doc = documents.find( d => d.id == result.ref );
            var facetValue = doc[facetName];

            if ( Array.isArray( facetValue ) )
            {
                facetValue.forEach( val => facets[val] = ( facets[val] || 0 ) + 1 );
            } else
            {
                facets[facetValue] = ( facets[facetValue] || 0 ) + 1;
            }
        } );

        return facets;
    }

    // Function rendering the paginated results using the div template
    function renderResults( paginatedResults )
    {

        searchResultsCount.innerHTML = paginatedResults.totalResults;
        paginatedResults.results.forEach( function ( result )
        {

            let output = document.importNode( template.content, true );
            let title = output.querySelector( "h3" );
            let instr = output.querySelector( "p.instr" );
            let summary = output.querySelector( "p.text" );
            let preview = output.querySelector( "iframe.preview" );

            var doc = getDocumentById( result.ref );

            title.innerHTML = doc.id;
            //title.setAttribute( "href", doc.id );
            title.addEventListener( 'click', togglePreview );
            summary.innerHTML = doc.body.substring( 0, 200 ) + '...';
            instr.innerHTML = doc.instr.join( ", " );
            preview.setAttribute( "src", doc.id );
            searchResultsDiv.appendChild( output );
        } );
    }

    // Function rendering the facets using the div templates
    function renderFacetOptions( facets, facetName, applied )
    {
        facetsDiv.innerHTML = '';
        
        for ( let facet in facets )
        {
            let option = document.importNode( facetTemplate.content, true );
            let label = option.querySelector( "label.checkbox" );
            label.innerHTML += `${ facet } (${ facets[facet] })`;
            let input = option.querySelector( "input" );
            input.setAttribute( "name", facetName );
            input.setAttribute( "value", facet );
            if ( applied.includes( facet )  )  {
                input.setAttribute( "checked", "true" );
            }
            facetsDiv.appendChild( option );

            // Add event listener for selecting this facet
            input.addEventListener( 'click', () => { form.submit(); } );
        }
    }

    documents.forEach( doc =>
    {
        documentLookup[doc.id] = doc;
    } );

    // Create the lunr index with the content of the documents
    var idx = lunr( function ()
    {
        this.field( 'body' );
        this.ref( 'id' );
        this.field( 'instr' );

        documents.forEach( function ( doc )
        {
            this.add( doc )
        }, this )
    } )

    let query = [];
    let instrFacet = []

    // Parse the url parameters
    let params = new URLSearchParams( document.location.search.substring( 1 ) );
    params.forEach( ( value, key ) =>
    {
        if ( key == 'q' && value != "" )
        {
            document.getElementById( "website-search" ).value = value;
            query.push("+" + value);
        }
        else if ( key == 'instr' )
        {
            query.push( "+instr:" + value );
            instrFacet.push( value );
        }
    } );

    let searchResults = idx.search( query.join( " " ) );

    // Pagination: Get results for page 1 with 10 results per page
    let page = 1;
    let resultsPerPage = 20;

    let paginatedResults = paginateResults( searchResults, page, resultsPerPage );

    renderResults( paginatedResults );

    let categoryFacets = aggregateFacets( searchResults, 'instr' );

    renderFacetOptions( categoryFacets, 'instr', instrFacet );
} );
