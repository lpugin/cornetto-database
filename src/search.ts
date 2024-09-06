// Define class for the Object returned by Luns
export class LunrResult {
    ref: string;
}

// Define class for the document structure
export class Document {
    id: string;
    body: string;
    instr: string[];
};

// Define class for the paginated results structure
export class PaginatedResults {
    page: number;
    resultsPerPage: number;
    totalResults: number;
    totalPages: number;
    results: LunrResult[];
}

let searchResultsDiv = document.querySelector<HTMLDivElement>("#search-results");
let template = document.querySelector<HTMLTemplateElement>("#search-item-template");
let searchResultsCount = document.querySelector<HTMLSpanElement>("#search-results-count");
let searchResultsShow = document.querySelector<HTMLSpanElement>("#search-results-show");

let facetsDiv = document.querySelector<HTMLDivElement>("#facets");
let facetTemplate = document.querySelector<HTMLTemplateElement>("#facet-template");

let facetsExcludeDiv = document.querySelector<HTMLDivElement>("#facets-exclude");

let paginationDiv = document.querySelector<HTMLDivElement>("#pagination");
let paginationTemplate = document.querySelector<HTMLTemplateElement>("#pagination-template");

let form = document.querySelector<HTMLFormElement>("#search-form");

// A lookup table of the indexed documents
let documentLookup: Record<string, Document> = {};

// Function to get document by ID using the lookup table
function getDocumentById(id: string): Document | undefined {
    return documentLookup[id];
}

// Loads the documents
fetch("./scripts/pages.json")
    .then(response => response.json())
    .then((documents: Document[]) => {

        // Function to toggle the RISM Online iframe (hidden by default)
        function togglePreview(this: HTMLElement, e: MouseEvent) {
            const toggleContent = this.nextElementSibling as HTMLElement;
            if (toggleContent) {
                toggleContent.style.display = toggleContent.style.display === 'block' ? 'none' : 'block';
            }
        }

        // Function to paginate results
        function paginateResults(results: LunrResult[], page = 1, resultsPerPage = 10): PaginatedResults {
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
        function aggregateFacets(results: LunrResult[], facetName: keyof Document): Record<string, number> {
            const facets: Record<string, number> = {};

            results.forEach(result => {
                const doc = documents.find(d => d.id === result.ref);
                if (doc) {
                    const facetValue = doc[facetName];

                    if (Array.isArray(facetValue)) {
                        facetValue.forEach(val => facets[val] = (facets[val] || 0) + 1);
                    } else if (facetValue) {
                        facets[facetValue] = (facets[facetValue] || 0) + 1;
                    }
                }
            });

            return facets;
        }

        // Function to render the results
        function renderResults(paginatedResults: PaginatedResults) {
            searchResultsCount.innerHTML = `${paginatedResults.totalResults} result(s)`;
            if (paginatedResults.totalPages > 1) {
                const first = paginatedResults.resultsPerPage * (page - 1) + 1;
                const last = Math.min(first + paginatedResults.resultsPerPage - 1, paginatedResults.totalResults);
                searchResultsShow.innerHTML += ` – showing ${first} to ${last}`;
            }
            paginatedResults.results.forEach(result => {
                const output = document.importNode(template.content, true);
                const title = output.querySelector<HTMLHeadingElement>("h3");
                const instr = output.querySelector<HTMLParagraphElement>("p.instr");
                const summary = output.querySelector<HTMLParagraphElement>("p.text");
                const preview = output.querySelector<HTMLIFrameElement>("iframe.preview");

                const doc = getDocumentById(result.ref);

                if (doc) {
                    title.innerHTML = doc.id;
                    title.addEventListener('click', togglePreview);
                    summary.innerHTML = doc.body.substring(0, 200) + '...';
                    instr.innerHTML = doc.instr.join(", ");
                    preview.setAttribute("src", doc.id);
                    searchResultsDiv.appendChild(output);
                }
            });
        }

        function renderFacetOption(facet: string, facetName: string, facetLabel: string, checked: boolean) {
            const option = document.importNode(facetTemplate.content, true);
            const label = option.querySelector<HTMLLabelElement>("label.checkbox span");
            const input = option.querySelector<HTMLInputElement>("input");

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

        // Function to render the facets
        function renderFacetOptions(div: HTMLDivElement, facets: Record<string, number>, facetName: string, applied: string[], excluded: string[] = []) {
            div.innerHTML = '';

            excluded.forEach((facet) => {
                const option = renderFacetOption(facet, facetName, `<s>${facet}</s>`, true);
                div.appendChild(option);
            });

            for (const facet in facets) {
                const option = renderFacetOption(facet, facetName, `${facet} (${facets[facet]})`, applied.includes(facet));
                div.appendChild(option);
            }
        }

        // Function to create a pagination button
        function createPaginationButton(page: number, text: string, current: boolean = false): HTMLAnchorElement {
            const params = new URLSearchParams(location.search);
            const a = document.importNode(paginationTemplate.content, true).querySelector<HTMLAnchorElement>("a")!;
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
        function renderPagination(paginatedResults: PaginatedResults) {
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

        documents.forEach(doc => {
            documentLookup[doc.id] = doc;
        });

        // Create the lunr index
        // @ts-ignore:next-line
        const idx = lunr(function () {
            this.field('body');
            this.ref('id');
            this.field('instr');

            documents.forEach(doc => {
                this.add(doc);
            });
        });

        let page = 1;
        const query: string[] = [];
        const appliedInstr: string[] = [];
        const excludedInstr: string[] = [];

        // Parse the URL parameters
        const params = new URLSearchParams(document.location.search.substring(1));
        params.forEach((value, key) => {
            if (key === 'q' && value !== "") {
                (document.getElementById("website-search") as HTMLInputElement).value = value;
                query.push("+" + value);
            } else if (key === 'instr') {
                query.push("+instr:" + value);
                appliedInstr.push(value);
            } else if (key === 'instr_ex') {
                query.push("-instr:" + value);
                excludedInstr.push(value);
            } else if (key === "page") {
                page = parseInt(value);
            }
        });

        let searchResults: LunrResult[];
        searchResults = idx.search(query.join(" "));

        // Pagination: Get results for page 1 with 20 results per page
        const resultsPerPage = 20;
        const paginatedResults = paginateResults(searchResults, page, resultsPerPage);

        renderResults(paginatedResults);
        renderPagination(paginatedResults);

        const categoryFacets = aggregateFacets(searchResults, 'instr');
        renderFacetOptions(facetsDiv, categoryFacets, 'instr', appliedInstr);
        renderFacetOptions(facetsExcludeDiv, categoryFacets, 'instr_ex', [], excludedInstr);
    });
