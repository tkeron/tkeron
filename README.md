# Tkeron

Micro framework for developing web user interfaces with typescript.

It is actually a CLI with some commands.

Also a typescript library to create web components: **tkeron.ts**.

**How to use**
* Install tkeron globally
```bash
npm i -g tkeron
```
* Enter in your project directory and run:

```bash
tkeron init example
```

This will create a project example code in the "front" directory.


* To build the html file run this: 
```bash
tkeron build
```

This will create a compiled html file with all the javascript and css code, and the resources used in the code from the static directory.

The source directory "front", has a html file, which could have its corresponding .css file, .ts file, .b.ts file and/or .dm.ts file.

Also contain a file to easily manage resources.

The .ts file has the javascript code that will be injected in the html final file.

The .b.ts file, has an default export Array of tkeron Components, all which will be rendered in the body tag of the html final file.

The .dm.ts file will create a deferred module.

The css file, is a normal style file that will be rendered in a style tag in the head of the html final file.


* To run in your browser:
```bash
tkeron dev
```
This command will create a server on port 8080 for the web directory and will observe the file change in the "front" directory. This watcher is not websocket based at the moment, it is a simple looping search that compares the changes on the current page.

----------

> **The philosophy of tkeron is to be simple and have a performant final code, and to make front-end development less complicated with the use of less configuration and tools.**

----------


# Reference


----------
### Init


```bash
tkeron init
```
This command will create/rewrite front/tkeron.ts file.
The directory "front" is the default src directory.
Run at the first time when creating the project, and everytime you update tkeron for to use the last version of the library.

```bash
tkeron init example
```
This command will create/rewrite an index.html example file, and its corresponding css, ts and b.ts file.

```bash
tkeron init save
```
This command will do the same as "tkeron init", but save the "tkeron.json" file, which is used for the cli as config options.

----------
### Build

```bash
tkeron build
```
This command will compile each html file in the front directory, with its corresponding files, to html files in the web directory.


```bash
tkeron build gcc
```
This command will do the same as "tkeron build" but it will compile the javascript code with the Google Closure Compiler, leaving a code compatible with more browsers.


----------
----------


# Next version

Version 2 will have some changes:
- The "static" directory will no longer exist, neither will the "resources.ts" file. The url will be imported into the code.
- The files for the web page will have the extension ".page.html", with their respective ".page.ts".
- The command "tkeron" will also have the alias "tk".

Among other features that will be updated in version 2.

