
{% assign search_title = site.data.locales | where: "id", "search-title" | first %}
{% assign search_input = site.data.locales | where: "id", "search-input" | first %}
{% assign search_tip = site.data.locales | where: "id", "search-tip" | first %}
{% assign search_lang_label = site.data.locales | where: "id", "search-lang-label" | first %}
{% assign search_lang_any = site.data.locales | where: "id", "search-lang-any" | first %}

<h1>Search</h1>

<div id="website-search-form">
    {% assign action = "/projects.html" %}
    <form id="search-form" action="{{ site.baseurl }}{{ action }}">
        <div class="field">
            <div class="control">
                <input id="website-search" class="input is-small" type="text" name="q" placeholder="{{ search_input.name[site.active_lang] }} ... ">
            </div>
        </div>

        <button type="submit" class="button is-small is-dark">
            <span class="icon is-small">
                <i class="fas fa-search"></i>
            </span>
        </button>

        <h2 class="mt-3">Instruments</h2>

        <div id="facets" class="mt-2"></div>

        <h2 class="mt-3">Instruments (excludes)</h2>

        <div id="facets-exclude" class="mt-2"></div>

    </form>
</div>