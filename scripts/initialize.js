


function tickFn(_elapsed)
{
  return timer_ret_val;
}


function start()
{
  initializeContainers();
  getData();
}



function initializeContainers()
{
  mainContainer = d3.select("body").append("div").attr("id", "main_container");
  setupVisContainer();
}




function setupChartGroup(data)
{
  var min_mass, max_mass, max_temp, max_radius;
  var xAxis, yAxis;
  
  // Obtain the bounds on plot
  [min_mass, max_mass, max_temp, max_radius] = getPlotBounds(data);
  
  
  // Define scales
  xScale = d3.scaleLinear()
              .domain([min_mass, max_mass])
              .range([0, svg_plot_width])

  yScale = d3.scaleLinear()
              .domain([0, max_temp])
              .range([svg_plot_height*2 + margin.top, svg_plot_height + margin.top]);
  
  
  rScale = d3.scaleLinear()
              .domain([0, max_radius])
              .range([10, 25])
  
  
  // https://github.com/d3/d3-scale
  colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, max_temp]);
  
  
  // Random color scale
  randomColorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, discovery_method_list.length]);
  
  // Define axes
  
  xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);
  
  
  // Add X Axis
  chartGroup.append("g")
              .attr("class", "axes")
              .style("opacity", 1)
              .attr("transform", "translate(0,"+svg_plot_height+")")
              .call(xAxis);
  
  // X axis text
  chartGroup.append("text")
              .attr("font-family", "monospace")
              .attr("font-size", "20px")
              .text("Mass, respective to Jupiter [kg]")
              .attr("transform", function()
              {
                return "translate("+chart_group_margin.left+","+svg_plot_height*1.1+")";
              })
              .attr("class", "chart_text"); 

  // Add Y Axis
  planetsGroup.append("g")
              .attr("class", "axes")
              .style("opacity", 1)
              .call(yAxis);
  
  // y axis text
  planetsGroup.append("text")
              .attr("font-family", "monospace")
              .attr("font-size", "20px")
              .text("Effective Temperature [K]")
              .attr("transform", function()
              {
                return "translate("+(-chart_group_margin.left/2)+","+2*svg_plot_height+") rotate(270)";
              })
              .attr("class", "chart_text");
}

function setupVisContainer()
{
  
  // Main SVG container
  visContainer = mainContainer.append("div")
                              .attr("id", "vis_container")
                              .append("svg")
                              .attr("width", svg_container_width)
                              .attr("height", svg_container_height);
  
  
  // Vis container background
  visContainer.append("rect").attr("height", svg_container_height)
                             .attr("width", svg_container_width)
                             .style("fill", "#abfffe").style("stroke", "black");
  
  // Chart GROUP
  chartGroup = visContainer.append("g")
                              .attr("id", "chart_group")
                              .attr("width", svg_plot_width)
                              .attr("height", svg_plot_height)
                              .attr("transform", function()
                              {
                                var new_y = svg_plot_height + chart_group_margin.top;
                                return "translate("+margin.left+","+new_y+")";
                              });
  
  // Plot background
  chartGroup.append("rect").attr("height", svg_plot_height)
                           .attr("width", svg_plot_width)
                           .style("fill", "white")
                           .style("stroke", "black");
  
   // Title
  visContainer.append("text").attr("x", 100)
                             .attr("y", 40)
                             .text("Exoplanet Discovery Methods")
                             .style("font-family", "monospace")
                             .style("font-size", "38px");
  
  // Planets GROUP
  planetsGroup = visContainer.append("g").attr("id", "planets_group")
                              .attr("height", svg_plot_height)
                              .attr("width", svg_plot_width)
                              .attr("transform", "translate("+margin.left+","+margin.top+")");
  
  // Planets group Background
  planetsGroup.append("rect").attr("height", svg_plot_height)
                             .attr("width", svg_plot_width)
                             .style("fill", "#c299ff")
                             .style("stroke", "black");
  
  
}





