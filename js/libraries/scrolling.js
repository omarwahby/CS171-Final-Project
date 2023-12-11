var primary_bg_color = "#26272f"
var secondary_bg_color = "#ff6127"
new fullpage('#fullpage', {
  //options here
  licenseKey: "gplv3-license",
  autoScrolling: true,
  scrollHorizontally: true,
  loopBottom: true,
  sectionsColor: [
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
    primary_bg_color,
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
  anchors: [
    'title_anchor',
    'merit_anchor',
    'sat_anchor',
    'socioeconomic_anchor',
    'notmerit_anchor',
    'pre-sankey_anchor',
    'sankey_anchor',
    'tuition_anchor',
    'map_anchor',
    'major_anchor',
    'barchart_anchor',
    'takeaways_anchor',
    'team_anchor',
    'references_anchor',
  ],
  navigationTooltips: [
    'Title',
    'Is it all merit?',
    'SAT vs Completion',
    'Socioeconomic Factors',
    'Income vs SAT',
    'Dropout predictor?',
    'Income to withdrawal',
    'Tuition Proxy',
    'Regional stats',
    'Do majors matter?',
    'Major breakdown',
    'Key Takeaways',
    'Our Team',
    'References'
  ]

});