---
title: Projects
layout: projects
lang: en
permalink: /projects.html
---

# Projects description

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
        <iframe class="preview mt-3 mb-1" width="100%" height="500px"></iframe>
        <p class="text mb-1"></p>
        <p class="instr is-italic"></p>
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