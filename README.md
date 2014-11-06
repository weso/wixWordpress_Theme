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
One of the best features of the wordpress world is the possibility of using plugins. For this instance we require just one, [NextGen gallery](https://wordpress.org/plugins/nextgen-gallery/), but you can add all you need to acquire the desire behaviour. It's also recommended use the [WIX settings plugin](https://github.com/weso/wixSettings_Plugin), as it was developed specifically to manage the settings files that come with the theme.
##Adding pages
Whether the page is static or not, the first thing to do when adding one to the wordpress site is to select the template to use, all the pages in the theme must have the template “Web index page” as shown in the image.
###Editing static pages
As you can see if you ar a web index user, the website is divided in six sections: home, report, data, blog, media centre and about. From all of them there are three which are static web pages editables via the wordpress dashboard, not before knowing how to do it correctly.
####The report
This is one of the static pages we were talking about, as you can see in the next image it has an aside navigation bar that corresponds with the top two header levels of the page.

So, this is all, the report is formed by paragraphs and different heading indentation, the thing is, how to modify it in wordpress? From the dashboard we have access to the page management tab, inside it we will see a list of all our current pages within the blog.

By clicking in the one we desire to edit we access the wordpress edition tool, which have two options, visual and text. Under no circumstances, well, maybe if you really know what you are doing, the page should be edited in text mode. Also, visual mode is easier to work with.

As you can see in the next image, once you have wrote the first level sections of the report (in this case “first section”) the only thing we have to do is to select the line and mark it as “heading 1” from the dropdown menu.


In the same way, the subsections are marked by the second level headings or “heading 2”.


And finally, but not least important the paragraphs, which must be marked by “paragraph”.

There are a lot of more options to select in the dropdown, but these three are the most important, cause the indentation will have side effects on the navigation sidebar.

####About page
What about the About page you say? it’s the same as the report, however with a slight difference (at least for now) the about page has media attachments as iframes.

As you will know an iframe is a piece of code that inside html pages will show some kind of media (videos, another page, etc) and usually has this aspect.

<iframe src="//www.youtube.com/embed/TxkJp2qrjuQ" width="100%" height="315" frameborder="0" allowfullscreen="allowfullscreen"></iframe>

In these cases, we do have to use the text view of the wordpress, so be carefully where you place your code snippet, make sure there are outside the “h” tags and if possible outside the “p” tags too. Here is a little example.

Also, the about page contains third level headers “heading 3” which will look like this, bulleted with the color of the section we are in.

####Media centre
This page is a combination of four different static pages, each one following the rules of edition mentioned before except for one thing that will be explained later.

They have to be child pages of the one in which will be shown and implement the static child page template.

Why do they have another template? because it’s the only way that we can have separated pages to form the media centre without external people watching them without consent. The pages must have the name as reflected in the image, and as matter of fact, they mustn't have first level headings “heading 1”.
##Editing gallery
As it was said, we are using a plugin to control the gallery, here we'll try to explain how to manage it fron the wordpress dashboard.

The first thing to do is to create a new gallery, which is as easy as going to the Gallery extension, add new gallery and then give it a title and upload the desired photos. In this same menu, you can also add new images to previous created galleries by selecting it from the dopdrown menu.

In the Gallery extension there are other options that haven't been used and so, there won't be explained but a lot of information can be encountered in the [plugin documentation page](http://www.nextgen-gallery.com/).

Now, how to add it to a page... well the gallery as used until now is embeded into a widget and used within the custom sidebar of the theme, which is only showed in the blog page the way you can see in the images below.
##Settings files
What's a settings file? well, it's a file that contains the settings required by the theme to work properly, all of them are in json format and under the folder where they are need. Let's see how many do we have here.
 - **inc/mail/settings.json**: This is the settings file used by the mail module.
   - *SMTPHost*: Is the mail server that is going to be used for mail delivery.
   - *SMTPPort*: The port under the mail server works.
   - *username*: The account username of the mail server.
   - *password*: The previous defined account password.
 - **inc/twitter/settings.json**: Settings file for the twitter client.
   - *tweetsLimit*: Is the number of tweets that will be retrieved, right now it coincides with the number of tweets shown in the front page.
   - *twitterAccount*: The account from where the tweets will be retrieved.
   - *twitterHashtag*: 
   - *consumerKey - accessToken*: Those are needed developer oauth credentials to use the api.
 - **renderization/settings.json**: This is a file used by the compiler and the renderer to locate the templates or fill specific paths.
   - *templatesPath*: Indicates where are located the handlebars templates.
   - *compiledTemplatesPath*: Indicates where are located the resulting files of compiling the templates.
   - *modelsPath*: The same as before but with page models php files.
   - *visualisationsPath*: Where are the visualisations stored.
   - *labelsPath*: The location of the labels files.
   - *apirUrl*: The url of the data api.
 - **visualisations/settings.json**: It contains an array of the expected visualisations, each one represented in the next way.
   - *id*: The identificator for the visualisation.
   - *page*:
   - *position*:
   - *caption*: The title to be shown in the visualisation frame.
   - *url*: The location of the visualisation.
 - **visualisations/front-settings.json**: This one contains the visualisations that are showed in the front page, each one has the next format.
   - *indicator*: The ID of the indicator as it was stored in the database.
   - *tendency*: -1 for decreasing tendency, 1 for increasing.

### WIX settings plugin
The WIX settings plugin is a small tool developed specifically for the use within this theme (however can be used in any theme with json files) and allows the user to edit the json files from the dashboard.

It has, however a little set up process, and this is that has to be pointed to the json files that we want to edit.
