var primary_bg_color = "#26272f"
var secondary_bg_color = "#ff6127"
new fullpage('#fullpage', {
  //options here
  autoScrolling: true,
  scrollHorizontally: true,
  sectionsColor: [
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color],
  navigation: true,
  slidesNavigation: true,
  anchors: ['title',
    'merit',
    'sat',
    'socioeconomic',
    'notmerit',
    'sankey',
    'map',
    'barchart',
  ],
  navigationTooltips: ['first', 'second']
});