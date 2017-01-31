
// http://stackoverflow.com/questions/17351016/set-up-python-simplehttpserver-on-windows
// Run    python -m http.server 8888    in index.html root
// Then go to http://localhost:8888/

var data_dictionary;
var DISCOVERY_METHODS;
var discovery_method_list = [];
var discovery_method_displayed;
var svg_background_color = "#b3cce6";
var mainContainer, visContainer, controlsContainer, plotContainer, planetsContainer;
var original_r;

var plot_height = 400;
var plot_width = 600;
var svg_height = plot_height*1.5;
var svg_width = plot_width*1.5;
var margin = {left:100, right:50, top:100, bottom:0};

// Adjust mass to Jupiter
  var jupiter_mass = 1.898e27;

function start()
{
  initializeVariables();
  initializeContainers();
  getData();
}


function initializeVariables()
{
  discovery_method_displayed = 'Transit';
}


function initializeContainers()
{
  mainContainer = d3.select("body").append("div").attr("id", "main_container");
  setupVisContainer();
  setupControlsContainer();
}



function setupVisContainer()
{
  visContainer = mainContainer.append("div").attr("id", "vis_container");
  
  // Setup all planets container
  planetsContainer = visContainer.append("div").attr("id", "planets_container");
  
  // Setup plot container
  plotContainer = visContainer.append("div").attr("id", "plot_container");
}


function setupControlsContainer()
{
  controlsContainer = mainContainer.append("div").attr("id", "controls_container")
                                    .attr("width", 200)
                                    .attr("height", 300)
                                    .style("margin-left", "20px");
}


function setupDropDown()
{
  d3.select("#controls").remove();
  
  var new_keys = Object.keys(DISCOVERY_METHODS);
  
  for (var key in DISCOVERY_METHODS)
  {
    discovery_method_list.push(key);
  }
  
  var controls = controlsContainer.append("div").attr("id", "controls");
  
  var form = controls.append("p").html("Discovery Method").append("form")
                      .append("select")
                      .on("change", changeForm);
  
  form.selectAll("option")
            .data(new_keys).enter().append("option")
              .attr("value", function(d) { return d; })
              .html(function(d) 
              { 
                var count = DISCOVERY_METHODS[d];
           
                return d + " (" + count +")"; 
              })
              .property("selected", function(d) { return d === discovery_method_displayed});
}


function changeForm() 
{
    var selectedIndex = d3.select(this).property('selectedIndex')
    discovery_method_displayed = discovery_method_list[selectedIndex];
    getData();
}




function getData()
{
  DISCOVERY_METHODS = {};
  d3.csv("/data/planets.csv", function(data)
  {
    
  })
  .row( function(data)
  {
    var keys = Object.keys(data);
    // Reset DISCOVERY_METHODS
    

    data_dictionary = { discovery_method: data.pl_discmethod,
                            planets_in_system: Number(data.pl_pnum.trim()),
                            orbital_period: Number(data.pl_orbper.trim()),
                            planet_mass: Number(data.pl_bmassj.trim()),
                            planet_radius: Number(data.pl_radj.trim()),
                            planet_letter: data.letter,
                            planet_temp: Number(data.st_teff.trim()),
                            planet_inclination: Number(data.pl_orbincl.trim())}

    // Create discovery type set:
    if (!(data.pl_discmethod in DISCOVERY_METHODS))
    {
      DISCOVERY_METHODS[data.pl_discmethod] = 1;
    }
    else
    {
      DISCOVERY_METHODS[data.pl_discmethod]++;
    }

    return data_dictionary;

  })
  .get(function(error, data)
  {
    makeGraph(data);
    setupDropDown();
  });
}
  




function getBounds(data)
{
  var min_mass, max_mass, max_temp, max_radius;
  
  // Find max mins
  min_mass = d3.min(data, function(d) 
  { 
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_mass;  
    }
  });

  max_mass = d3.max(data, function(d) 
  { 
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_mass; 
    }
  });

  max_temp = d3.max(data, function(d)
  { 
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_temp;   
    }
  });
  
  max_radius = d3.max(data, function(d)
  {
    if (d.discovery_method == discovery_method_displayed)
    {
      return d.planet_radius;
    }
  })
  
  return [min_mass, max_mass, max_temp, max_radius];
}



function generatePlot(data, x, y, colorScale, xAxis, yAxis, r)
{
  // Define SVG
  var plot_svg = plotContainer.append("svg").attr("id", "svg_plot_main")
                .attr("height", svg_height*2).attr("width", svg_width);

  // Background
  plot_svg.append("rect")
        .attr("height", 2*svg_height)
        .attr("width", svg_width)
        .attr("fill", svg_background_color);
        
  
  // Chart Group
  var chartGroup = plot_svg.append("g")
          .attr("transform", "translate("+margin.left+","+margin.top+")");
  
  // Add Axes
  chartGroup.append("g")
              .attr("class", "x_axis")
              .attr("transform", "translate(0,"+plot_height+")")
              .call(xAxis);

  chartGroup.append("g")
              .attr("class", "y_axis")
              .call(yAxis);
  
  // Add exoplanets
  chartGroup.selectAll("circle.exoplanets").data(data)
                .enter().append("circle")
                .filter(function(d) 
                {
                  if (d.discovery_method == discovery_method_displayed)
                  {
                    return d;
                  }
                })
                .attr("class", "exoplanets")
                .attr("cx", function(d, i) { return 0; })
                .attr("cy", function(d, i) { return 0; })
                .attr("r", function(d, i) { return 0; })
                .attr("fill", function(d, i)
                {
                  return colorScale(d.planet_temp);
                })
                .style("opacity", 0)
                .on("mouseover", function(d, i)
                {
                  origial_R = r(d.planet_radius)
                  d3.select(this).transition()
                                  .duration(200)
                                  .attr("r", origial_R*1.75)
                                  .style("opacity", 1)
                                  .attr("stroke", "black");
                  
                  console.log(d);
                })
                .on("mouseout", function(d, i)
                {
                  d3.select(this).transition()
                                  .duration(200)
                                  .attr("r", origial_R)
                                  .style("opacity", 0.8)
                                  .attr("stroke", "none");
                })
                .on("click", function(d, i)
                {

                });

  chartGroup.selectAll("circle.exoplanets")
            .transition()
            .duration(1000)
            .attr("cx", function(d, i) 
            {
              return x(d.planet_mass); 
            })
            .attr("cy", function(d, i)
            {
              return y(d.planet_temp);
            })
            .style("opacity", 0.8)
            .attr("r", function(d, i) { return r(d.planet_radius);});



  

  chartGroup.append("text")
              .attr("x", 0)
              .attr("y", 0)
              .attr("font-family", "monospace")
              .attr("transform", "translate(-50, 700) rotate(-90)")
              .text("Effective Temperature [K]")

  chartGroup.append("text")
              .attr("x", 200)
              .attr("y", 375)
              .attr("font-family", "monospace")
              .text("Mass, respective to Jupiter [kg]")
}


function makeGraph(data)
{
  var min_mass, max_mass, max_temp, max_radius;
  // Clean previous plot
  d3.select("#svg_plot_main").remove();
  
  // Obtain the bounds
  [min_mass, max_mass, max_temp, max_radius] = getBounds(data);

  
  

  // Define scales
  var x = d3.scaleLinear()
              .domain([min_mass, max_mass])
              .range([0, plot_width])

  var y = d3.scaleLinear()
              .domain([0, max_temp])
              .range([plot_height*2, plot_height])
  
  
  var r = d3.scaleLinear()
              .domain([0, max_radius])
              .range([10, 25])


  // https://github.com/d3/d3-scale
  var colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_temp]);

  
  
  // Define axes
  var yAxis = d3.axisLeft(y);
  var xAxis = d3.axisTop(x);
  
  
  
  generatePlot(data, x, y, colorScale, xAxis, yAxis, r);
  
  

  
}