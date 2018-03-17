// Create a function to add dropdown list and plotly charts
function optionChanged() {
    // fetch data from /names page
    d3.json("/names", function(error, response){
        if (error) return console.warn(error);
        // connect to html id "selDataset"
        var selDataset = document.getElementById("selDataset");
        // use for loop to create select object
        for (var i=0; i < response.length; i++) {
            var option = document.createElement("option");
            option.value = response[i];  
            option.innerHTML = response[i];
            selDataset.appendChild(option);
        }
        // create a function to generete paragraph from metadata page
        function description(selDataset) {
            var name = selDataset.value;
            var url3 = "/metadata/" + name;
            // connect to html id "description"
            var description = document.getElementById("description");
            // fetch data from /metadata page
            d3.json(url3, function(error, response) {
                var meta_keys = Object.keys(response);
                var meta_values = Object.values(response);
                for (var l=0; l < meta_keys.length; l++) {
                    var item = document.createElement('li');
                    var ul = document.createElement('ul');
                    var content = meta_keys[l] + ":" + meta_values[l];
                    var text = document.createTextNode(content);
                    item.appendChild(text);
                    ul.appendChild(item);
                    description.appendChild(ul);                   
                }
            })
        }

        description(selDataset);

        // create function for pie chart and bubble chart
        function init(selDataset) {
            var name = selDataset.value;
            var url1 = "/samples/" + name;
            var url2 = "/metadata/" + name;
            // fetch data form /samples
            Plotly.d3.json(url1, function(error, response) {
                var pie_value = response.sample_values.slice(0, 10);
                var pie_otu = response.otu_ids.slice(0, 10);
                var bubble_value = response.sample_values;
                var bubble_otu = response.otu_ids;      
                // fetch data from /otu to create OTU description for pie chart
                d3.json("/otu", function(error, response) {                   
                    var otu_list1 = [];
                    for (var k=0; k < pie_otu.length; k++) {
                        var id = pie_otu[k];
                        var item = response[id];
                        otu_list1.push(item);
                    }
                    // create pie chart
                    var trace1 = {
                        type: "pie",
                        values: pie_value,
                        labels: pie_otu,
                        hovertext: otu_list1,
                    };
            
                    var data = [trace1];
            
                    var layout = {
                        title: "Top 10 OTU Proportion Comparision",
                        height: 500,
                        width: 800,    
                    };
                    Plotly.newPlot("pie", data, layout);
                    // fetch data from /otu to create OTU description for bubble chart
                    var otu_list2 = [];
                    for (var k=0; k < bubble_otu.length; k++) {
                        var id = bubble_otu[k];
                        var item = response[id];
                        otu_list2.push(item);     
                    }
                    // create bubble chart
                    var trace2 = {
                        x: bubble_otu,
                        y: bubble_value,
                        mode: "markers",
                        marker: {
                            size: bubble_value,
                            color: bubble_otu,
                        },
                        text: otu_list2,    
                    };
            
                    var data = [trace2];
            
                    var layout = {
                        title: "All OTU's Sample Value",
                        height: 500,
                        width: 1050,
                        xaxis: {
                            title: "OTU IDs",
                        },
                        yaxis: {
                            title: "Sample Values",
                        },
                    };
                    Plotly.newPlot("bubble", data, layout);    
                })    
            })
        }
        init(selDataset);
    });    
}
// run the function to show plots when open the page
optionChanged();

// create function to update plots
function updatePlot(newname) {
    var Pie = document.getElementById("pie");
    var Bubble = document.getElementById("bubble");
    
    Plotly.restyle(Pie, "values", [newname.sample_values.slice(0,10)]);
    Plotly.restyle(Pie, "labels", [newname.otu_ids.slice(0,10)]);

    Plotly.restyle(Bubble, "y", [newname.sample_values]);
    Plotly.restyle(Bubble, "x", [newname.otu_ids]);
}

// create function to update OTU description
function getText(newtext) {
    Plotly.d3.json("/otu", function(error, response) {
        var Pie = document.getElementById("pie");
        var Bubble = document.getElementById("bubble");
        var update_list1 = [];
        var update_list2 = [];
        var update_otu1 = newtext.otu_ids.slice(0, 10);
        var update_otu2 = newtext.otu_ids;
    
        for (var k=0; k < update_otu1.length; k++) {
            var id = update_otu1[k];
            var item = response[id];
            update_list1.push(item);
        };
        for (var k=0; k < update_otu2.length; k++) {
            var id = update_otu2[k];
            var item = response[id];
            update_list2.push(item);
        };
    
        Plotly.restyle(Pie, "hovertext", update_list1);
        Plotly.restyle(Bubble, "text", update_list2);
    })   
}

// create function to update paragraph
function updatemetadata(name) {
    var url3 = "/metadata/" + name;

    var description = document.getElementById("description");
    description.innerHTML = "";

    d3.json(url3, function(error, response) {
        
        var meta_keys = Object.keys(response);
        var meta_values = Object.values(response);
        for (var l=0; l < meta_keys.length; l++) {
            var item = document.createElement('li');
            var ul = document.createElement('ul');
            var content = meta_keys[l] + ":" + meta_values[l];
            var text = document.createTextNode(content)
            item.appendChild(text);
            ul.appendChild(item);
            description.appendChild(ul);                  
        }
    })
}

// create getData function to act when sample was selected
function getData(sample) {
    url2 = "/samples/" + sample;
    Plotly.d3.json(url2, function(error, response){
        updatePlot(response);
        getText(response); 
    });     
    updatemetadata(sample);
}   