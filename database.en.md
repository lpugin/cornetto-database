---
title: Database
layout: database
lang: en
permalink: /database.html
---

# Database description

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sagittis vitae et leo duis ut diam quam nulla. Proin fermentum leo vel orci. Tortor pretium viverra suspendisse potenti nullam ac tortor. Senectus et netus et malesuada fames ac turpis egestas maecenas.

<div id="search-results-header">
    <h1>Search results</h1>
    <p id="search-results-p" class="mb-5"><i><span id="search-results-count"></span><span id="search-results-show"></span></i></p>
</div>

<div id="search-results">
</div>

<div id="pagination" class="buttons">
</div>

<template id="search-item-template">
    <div class="mb-5">
        <h3 class="docref mb-1"></h3>
        <div class="rism icon-text">
            <span class="icon">
                <i class="fas fa-arrow-right"></i>
            </span>
            <span>Preview <span class="rism_link"></span> in RISM Online</span>
        </div>
        <iframe class="preview mt-3 mb-1" width="100%" height="500px"></iframe>
        <div class="fields">
            <span class="composer mb-1"></span>
            <span class="cornetto-title mb-1"></span>
            <span class="instr is-italic"></span>
            <div class="cornetto-tags">
                <span class="coeff tag is-light"></span>
                <span class="source_type tag is-light"></span>
                <span class="record_type tag is-light"></span>
                <span class="accuracy tag is-light"></span>
            </div>
            <div class="examplars">
                <span class="libraries"></span>
                <span class="shelfmark"></span>
            </div>
            <span class="notes"></span>
        </div>
    </div>
</template>

<template id="facet-template">
    <div class="field">
        <div class="control">
            <label class="checkbox">
                <input type="checkbox">
                <span></span>
            </label>
        </div>
    </div>
</template>

<template id="pagination-template">
    <a class="button is-small is-primary is-light"></a>
</template>

<script src="https://unpkg.com/lunr/lunr.js"></script>
<script type="module" src="{{ site.baseurl}}/dist/search.js" defer></script>
