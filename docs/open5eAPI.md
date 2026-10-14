What is the Open5e API?
The Open5e API provides programmatic access to all resources and rules included on this site. If you're working on an app or website, you can use this API to retrieve monsters, spells, rules, or just about anything else you need.

You can use explore the Open5e API here.

This API uses standard Django Rest Framework concepts, including filters, search and ordering. You can play with all these settings in the live API.

API Versions (V1 & V2)
There exist two distinct versions of the Open5e API; V1 and V2.

V1 is legacy, and should be considered officially deprecated.
V2 is the current version of Open5e. It was developed to address the shortcomings of V1 and is actively maintained.
A specific version of the API can be used by prepending /v2 or /v1 to the API endpoint. If the endpoint is accessed without a version prefix, the API V2 will be used.

This document assumes you are using API V2 (which you should, it is a big improvement!)

Searching
To search the entire Open5e data-set, you can use the /search endpoint with the /query query parameter.

https://api.open5e.com/v2/search/?query=goblin
This will search for Open5e for any entries that contain the term "goblin". The endpoint also returns useful properties for each resource type: CR and type for Monsters, level and school for spells, etc. The highlighted property includes a span of markup containing a snippet of text where the term was found. This is intended to be used in previews of search results.

Per-endpoint search
It is also possible to search results returned by a specific endpoint by adding the ?name__iexact or ?name__icontains parameters to a query. These, in turn, return Open5e entries that exactly or partially match the search term (case-insensitive).

https://api.open5e.com/v2/creatures/?name__icontains=goblin
Filtering
Each resource can be filtered by a variety of properties. Some properties are common across all resource types, but many are specific to a given resource.

For example, monsters can be filtered by their Type (humanoid, beast, etc.) as follows.

https://api.open5e.com/v2/creatures/?type=dragon
This will return a list of Monsters with a type of Dragon. Filtering by Type on resource types that lack this field will have no effect.

Filtering by Nested Fields
Each resource on Open5e includes a document field, which specifies where that piece of data was sourced from. Each document has a key property which uniquely identifies it.

A common use-case for filtering is to filter an endpoint by source document. Because a document's key is nested within the "document" field and not located at the root of the JSON payload, the double underscore __

https://api.open5e.com/v2/creatures/?document__key__in=srd-2024&fields=name
The pattern of indexing into a nested field using a double-underscore is standard DRF syntax and is used widely across Open5e.

Including and Excluding API Fields
Visiting an Open5e API endpoint will typically return all the data associated with that entry. In most cases this will be overkill. The API is designed so that users can explicitly include or exclude the specific fields they require in their application so that their API classes execute as quickly as possible.

Including Fields
Specific fields can be included from an API response using the ?fields query parameter. This expects a list of named API fields to include in the API response:

https://api.open5e.com/v2/creatures/?fields=name,key,document
Fields defined in the comma-separated value list will be included in the API response, all others will be excluded. The above example will only return Monster names, keys and source document information.

Including Nested Fields
If you want to filter API fields that are nested inside of other fields, you can use the double-underscore notation __ to index into a field to apply the ?fields query parameter to it:

https://api.open5e.com/v2/creatures/?fields=name,key,document&document__fields=name,key
The above removes all fields from the nested Document object except name and key.

Excluding Fields
Specific fields can be excluded from an API response using the ?exclude query parameter. This parameter expects a list of named API fields to exclude:

https://api.open5e.com/v2/species/?exclude=traits
This can be more convenient than using ?fields in situations where you have a large JSON payload and only want to omit a few fields. It is quicker to pass the fields you want to remove via the ?exclude parameter instead of passing all the fields you wish to keep via the ?fields parameter.

Ordering
By default Open5e returns API data sorted alphabetically (descending). The sort order can be changed by passing a ?ordering query parameter.

https://api.open5e.com/v2/creatures/?ordering=challenge_rating_decimal
Different endpoints often have different properties that they can be sorted by. These can be viewed by viewing the API endpoint via web browser and inspecting the Filters options.

Pagination
The Open5e API paginates the results of its find-many lookups. By default, 50 results are fetched per page. The number of results returned per page can be passing a number via the ?limit query parameter:

https://api.open5e.com/v2/creatures/?limit=10
Specific pages of the paginated results can be accessed via the ?page query parameter. Querying an out of range page will cause a 404 error.

https://api.open5e.com/v2/creatures/?limit=10&page=5