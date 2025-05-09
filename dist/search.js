// Define class for the Object returned by Lunr
export class LunrResult {
}
// Define class for the document structure
export class Document {
}
;
// Define class for the paginated results structure
export class PaginatedResults {
}
// Define the filter options interface
export class CustomFilter {
}
;
let searchResultsDiv = document.querySelector("#search-results");
let template = document.querySelector("#search-item-template");
let searchResultsCount = document.querySelector("#search-results-count");
let searchResultsShow = document.querySelector("#search-results-show");
let facetsComposerDiv = document.querySelector("#facets-composers");
let facetsDiv = document.querySelector("#facets");
let facetTemplate = document.querySelector("#facet-template");
let facetsExcludeDiv = document.querySelector("#facets-exclude");
let paginationDiv = document.querySelector("#pagination");
let paginationTemplate = document.querySelector("#pagination-template");
let form = document.querySelector("#search-form");
// A lookup table of the indexed documents
let documentLookup = {};
// Function to get document by ID using the lookup table
function getDocumentById(id) {
    return documentLookup[id];
}
// Function to toggle the RISM Online iframe (hidden by default)
function togglePreview(e) {
    const toggleContent = this.nextElementSibling;
    if (toggleContent) {
        toggleContent.style.display = toggleContent.style.display === 'block' ? 'none' : 'block';
    }
}
// Function to paginate results
function paginateResults(results, page = 1, resultsPerPage = 10) {
    const paginatedResults = new PaginatedResults();
    paginatedResults.page = page;
    paginatedResults.resultsPerPage = resultsPerPage;
    paginatedResults.totalResults = results.length;
    paginatedResults.totalPages = Math.ceil(paginatedResults.totalResults / resultsPerPage);
    const start = (page - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    paginatedResults.results = results.slice(start, end);
    return paginatedResults;
}
// Function to aggregate facets
function aggregateFacets(results, facetName) {
    const facets = {};
    results.forEach(doc => {
        const facetValue = doc[facetName];
        if (Array.isArray(facetValue)) {
            facetValue.forEach(val => facets[val] = (facets[val] || 0) + 1);
        }
        else if (facetValue) {
            facets[facetValue] = (facets[facetValue] || 0) + 1;
        }
    });
    return facets;
}
// Function to add text or hide element
function addTextOrHide(text, element) {
    if (text) {
        element.innerHTML = text;
    }
    else {
        element.style.display = 'none';
    }
}
// Function to render the results
function renderResults(paginatedResults) {
    searchResultsCount.innerHTML = `${paginatedResults.totalResults} result(s)`;
    if (paginatedResults.totalPages > 1) {
        const first = paginatedResults.resultsPerPage * (paginatedResults.page - 1) + 1;
        const last = Math.min(first + paginatedResults.resultsPerPage - 1, paginatedResults.totalResults);
        searchResultsShow.innerHTML += ` – showing ${first} to ${last}`;
    }
    paginatedResults.results.forEach(doc => {
        const output = document.importNode(template.content, true);
        const header = output.querySelector("h3");
        const preview = output.querySelector("iframe.preview");
        const rism = output.querySelector("div.rism");
        const rism_link = output.querySelector("span.rism_link");
        const composer = output.querySelector("span.composer");
        const title = output.querySelector("span.cornetto-title");
        const instr = output.querySelector("span.instr");
        const coeff = output.querySelector("span.coeff");
        const source_type = output.querySelector("span.source_type");
        const record_type = output.querySelector("span.record_type");
        const accuracy = output.querySelector("span.accuracy");
        const libraries = output.querySelector("span.libraries");
        const shelfmark = output.querySelector("span.shelfmark");
        const notes = output.querySelector("span.notes");
        header.innerHTML = doc.id;
        if (doc.rism_no) {
            rism_link.innerHTML = `sources/${doc.rism_no}`;
            preview.setAttribute("src", `https://rism.online/sources/${doc.rism_no}`);
            rism.addEventListener('click', togglePreview);
        }
        else {
            rism.style.display = 'none';
        }
        addTextOrHide(doc.composer, composer);
        let titleStr = (doc.title.length > 200) ? doc.title.substring(0, 200) + ' ...' : doc.title;
        title.innerHTML = titleStr;
        instr.innerHTML = doc.instr.join(", ");
        addTextOrHide(doc.coeff, coeff);
        addTextOrHide(doc.record_type, record_type);
        addTextOrHide(doc.source_type, source_type);
        addTextOrHide(doc.accuracy, accuracy);
        addTextOrHide(doc.libraries, libraries);
        addTextOrHide(doc.shelfmark, shelfmark);
        addTextOrHide(doc.notes, notes);
        searchResultsDiv.appendChild(output);
    });
}
// Function to create a facet option node
function createFacetOption(facet, facetName, facetLabel, checked) {
    const option = document.importNode(facetTemplate.content, true);
    const label = option.querySelector("label.checkbox span");
    const input = option.querySelector("input");
    label.innerHTML = facetLabel;
    input.setAttribute("name", facetName);
    input.setAttribute("value", facet);
    if (checked) {
        input.setAttribute("checked", "true");
    }
    // Add event listener for selecting this facet
    input.addEventListener('click', () => { form.submit(); });
    return option;
}
// Function to render the facet
function renderFacet(div, facets, facetName, applied) {
    div.innerHTML = '';
    for (const facet in facets) {
        const option = createFacetOption(facet, facetName, `${facet} (${facets[facet]})`, applied.includes(facet));
        div.appendChild(option);
    }
}
// Function to render the facer of excluded values
function renderFacetExcluded(div, facets, facetName, applied, excluded = []) {
    div.innerHTML = '';
    excluded.forEach((facet) => {
        const option = createFacetOption(facet, facetName, `<s>${facet}</s>`, true);
        div.appendChild(option);
    });
    for (const facet in facets) {
        // Do not allow to exclude applied facets
        if (applied.includes(facet))
            continue;
        const option = createFacetOption(facet, facetName, `${facet} (${facets[facet]})`, applied.includes(facet));
        div.appendChild(option);
    }
}
// Function to create a pagination button node
function createPaginationButton(page, text, current = false) {
    const params = new URLSearchParams(location.search);
    const a = document.importNode(paginationTemplate.content, true).querySelector("a");
    a.innerHTML = text;
    params.set('page', page.toString());
    a.setAttribute("href", "?" + params.toString());
    if (current) {
        a.classList.remove("is-light");
        a.setAttribute("disabled", "true");
    }
    return a;
}
// Function to render the pagination controls
function renderPagination(paginatedResults) {
    const page = paginatedResults.page;
    // Previous Button
    if (page > 1) {
        paginationDiv.appendChild(createPaginationButton(1, "&lt;&lt;"));
        paginationDiv.appendChild(createPaginationButton(page - 1, "&lt;"));
    }
    // Page Numbers
    const pageWindow = 5; // Number of pages to display at once
    let startPage = Math.max(1, page - Math.floor(pageWindow / 2));
    let endPage = Math.min(paginatedResults.totalPages, startPage + pageWindow - 1);
    if (endPage - startPage < pageWindow - 1) {
        startPage = Math.max(1, endPage - pageWindow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        paginationDiv.appendChild(createPaginationButton(i, `${i}`, (page === i)));
    }
    // Next Button
    if (page < paginatedResults.totalPages) {
        paginationDiv.appendChild(createPaginationButton(page + 1, "&gt;"));
        paginationDiv.appendChild(createPaginationButton(paginatedResults.totalPages, "&gt;&gt;"));
    }
}
// Function to apply a custom filter 
function filterResults(results, filterOptions) {
    // Apply manual filtering based on filterOptions
    if (filterOptions.instr) {
        results = results.filter(function (doc) {
            return doc.instr.includes(filterOptions.instr);
        });
    }
    if (filterOptions.composer) {
        results = results.filter(function (doc) {
            return doc.composer === filterOptions.composer;
        });
    }
    return results;
}
// Loads the documents
fetch("./cornetto-database.json")
    .then(response => response.json())
    .then((documents) => {
    documents.forEach(doc => {
        documentLookup[doc.id] = doc;
    });
    // Create the lunr index
    const idx = lunr(function () {
        this.ref('id');
        this.field('coeff');
        this.field('rism_no');
        this.field('record_type');
        this.field('source_type');
        this.field('composer');
        this.field('title');
        this.field('instr');
        this.field('libraries');
        this.field('shelfmark');
        this.field('accuracy');
        this.field('notes');
        this.field('work_needed');
        documents.forEach(doc => {
            this.add(doc);
        });
    });
    let page = 1;
    const query = [];
    const appliedInstr = [];
    const appliedComposer = [];
    const excludedInstr = [];
    // Parse the URL parameters
    const params = new URLSearchParams(document.location.search.substring(1));
    const arr = [];
    params.forEach((value, key) => {
        if (key === 'q' && value !== "") {
            document.getElementById("website-search").value = value;
            query.push("+" + value);
        }
        else if (key === 'composer') {
            arr.push(value);
            appliedComposer.push(value);
        }
        else if (key === 'instr') {
            query.push("+instr:" + value);
            appliedInstr.push(value);
        }
        else if (key === 'instr_ex') {
            query.push("-instr:" + value);
            excludedInstr.push(value);
        }
        else if (key === "page") {
            page = parseInt(value);
        }
    });
    console.log(query);
    let idxResults = idx.search(query.join(" "));
    // Map results to the original documents
    let searchResults = idxResults.map(function (result) {
        return getDocumentById(result.ref);
    });
    let filterOptions = new CustomFilter();
    //filterOptions.instr = "vc"; // example to use a custom filter which does not have to be in lunr
    filterOptions.composer = arr[0];
    let filteredResults = filterResults(searchResults, filterOptions);
    // Pagination: Get results for page 1 with 20 results per page
    const resultsPerPage = 20;
    const paginatedResults = paginateResults(filteredResults, page, resultsPerPage);
    renderResults(paginatedResults);
    renderPagination(paginatedResults);
    const composerFacets = aggregateFacets(filteredResults, 'composer');
    renderFacet(facetsComposerDiv, composerFacets, 'composer', appliedComposer);
    const categoryFacets = aggregateFacets(filteredResults, 'instr');
    renderFacet(facetsDiv, categoryFacets, 'instr', appliedInstr);
    renderFacetExcluded(facetsExcludeDiv, categoryFacets, 'instr_ex', appliedInstr, excludedInstr);
});
//# sourceMappingURL=search.js.map