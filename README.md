#WIX Wordpress Theme

2014 Web Index portal theme for WordPress

##Folder structure
As any other wordpress theme this one has its own customizations to fit the site, let's take a look to them.
 - **fonts**: The fonts folder contains all the font files used within the site.
 - **images**: Aswell as the font folder, this contains all images used in the site (not the gallery ones).
 - **page-templates**: Here there are some php files, this files are used by wordpress to generate the pages in different ways according to their linked template.
 - **renderization**: This folder needs a deeper explanation than the others, because it contains the code that renderizes the pages, adding the labels and any other information required by them.
   - **compiler.php**: The lightNCandy templates can be compiled either in execution time or store them to be used later, this files compiles all available templates and store them in the *'compiled-templates'* folder, for its later use.
   - **controller.php**: Its in charge of instantiating the renderer, so no more than one instance is alive at the time, also loads the required settings file for it to work.
   - **renderer.php**: This file receives the name of the page to be rendered, and via reflection loads all the data available for the given page.
   - **starter.php**: Just a small piece of code to help compiling the views.
   - **compiled-views**: In this folder are stored all files resulting of running the compiler, these files are used by the renderer to generate the web page.
   - **models**: Every template has its own specific data, the models are php fragments that helps the renderer to get all it needs to render the web page.
   - **views**: Here you can find the different templates (hbs in this case) of all the pages that have one.
 - **scripts**: All the javascript files needed by the site.
 - **visualisations**:
 - **inc**: The theme makes use of different php libraries, here you can find all of them.
 - **lang**: Stores different json files with the iso code of the language there are for.
 - **styles**: All the css files of the site.

##Installation
This is a child theme of the wordpress theme *'twentyfourteen', and can be installed as any other theme by uploading the files via the wordpress interface.

--------Add images--------
###Required plugins
##Adding pages
##Editing gallery
##Settings files
### WIX settings plugin
