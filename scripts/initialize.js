var SVG_HEIGHT = 800;
var SVG_WIDTH = 1000;


var mainContainer, mainControlsContainter, infoContainer, controlsContainter, VisContainer, SVGContainer;


var SVG_front_layer, SVG_back_layer, SVG_tooltip_layer, SVG_tooltip_bottom_layer;



function setupControlsContainer()
{
  mainControlsContainter = mainContainer.append("div").attr("id", "controls_container");

  // Info container
  infoContainer = mainControlsContainter.append("div").attr("id", "info_container");
  // Controls Header
  infoContainer.attr("id", "controls_header").append("h1").html("Biodiversity in National Parks Dataset")

  // Controls Body
  infoContainer.attr("id", "controls_body").append("p").html("...")


  // Setup Controller container
  controlsContainter = mainControlsContainter.append("div").attr("id", "input_container");


  // Create Container for test data generation
  var testDataContainer = controlsContainter.append("div").attr("id", "test_data_controller");



  // Generate test data Button
  testDataContainer.append("input")
                      .attr("type", "button")
                      .attr("id", "generate_data_button")
                      .attr("value", "Generate Test Data!")
                      .on("click", function()
                      {
                        start();
                      });


  // Reset Button
  testDataContainer.append("input")
                      .attr("type", "button")
                      .attr("value", "Reset!")
                      .on("click", function()
                      {
                        reset();
                      });
}




function setupVisContainer()
{
  var background;

  VisContainer = mainContainer.append("div").attr("id", "vis_container");

  SVGContainer = VisContainer.append("svg")
                                .attr("id", "svg_container")
                                .attr("height", SVG_HEIGHT)
                                .attr("width", SVG_WIDTH);

  background = SVGContainer.append("svg:rect")
                                  .attr("id", "svg_background")
                                  .attr("height", SVG_HEIGHT)
                                  .attr("width", SVG_WIDTH)
                                  .style("fill", "#f2f2f2")
                                  .style("stroke", "black")
                                  .style("stroke-width", 2)





}


function reset()
{

}

function initialize_containers()
{
  mainContainer = d3.select("body").append("div").attr("id", "main_container");
  setupControlsContainer();
  setupVisContainer();
}





function initializeVariables()
{

}


function initialize()
{
  initializeVariables();
  initialize_containers();
  start();
}
