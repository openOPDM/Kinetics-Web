Run "npm install" to load dependencies of this script.
To build the project run "node build.js".

To build for release provide -r option.
To build for debug provide -d option.
If you don't want to append version info to all html, js and css files provide -n option.




Note:
Currently there is a bug in adm-zip library, that corrupts most media files with compression https://github.com/cthackers/adm-zip/issues/45
To fix this edit zipEntry.js and on line 176 set the default method to STORED.