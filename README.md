# Kinetics-Web

This directory contains frontend for Kinetics POC project.


**DEVELOPMENT HOW-TO**

This project is based on Backbone.js MVC framework and uses RequireJS
for module loading and resolving dependencies.


**RUN LOCALLY**

To run application locally clone repository to some folder and point webserver's
document root to  that folder.


**BUILD AND DEPLOY**

To build the project you should have [ Node.js ](http://nodejs.org/download/) installed.
Navigate to "tools" folder and run the command:

`node build [options]`

This will create two .war files to deploy. E.g.:
- *"build/10-24-2013-2-release/kineticsweb.war"*
- *"build/10-24-2013-2-release/ROOT.war"*

Available options:
* *-d* Build development version (no code optimization)
* *-r* Build release version. In this case all sources including stylesheets and templates are concatenated and compressed with "r.js" tool.
Use this one to deploy on stage/production environments.

*Note: before running build for some environment you have to set API endpoint in "serverUrl" property of "Web/js/DataLayer/Constants.js".*