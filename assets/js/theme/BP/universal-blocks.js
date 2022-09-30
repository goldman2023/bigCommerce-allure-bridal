function headerFooterQuery (context, callback) {
    let query = `
        query ProductsQuery {
            site {
                product(entityId: 287) {
                    entityId
                    description
                    metafields (
                        namespace: "Contentful Data"
                        keys: ["Data for navigation", "Data for footer"]
                        first: 5
                    ) {
                        edges {
                            node {
                                entityId
                                id
                                key
                                value
                            }
                        }
                    }
                }
            }
        }
    `;
    fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.graphQlToken}`
        },
        body: JSON.stringify({
            query: query
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(res) {
        if (typeof callback == 'function') {
            callback.call(this, res);
        }
    })
    .catch(error => console.error(error));
}

export function headerFooterData(context, callback) {
    headerFooterQuery(context, response => {
        if (response.data.site.product !== undefined) {
            const product = response.data.site.product;
            if (product.metafields.edges.length > 0) {
                const metafields = product.metafields.edges;
                console.log(metafields);
                const metafieldData = [];
                const noOfEntries = metafields.length;
                for(const [index, metafield] of metafields.entries()) {
                    if (typeof callback == 'function') {
                        const metaFieldObj = {"key": metafield.node.key, "value": JSON.parse(metafield.node.value)};
                        metafieldData.push(metaFieldObj);
                        if (index+1 === noOfEntries) {
                            callback.call(this, metafieldData);
                        }
                    }
                }
            }
        }
    });
}