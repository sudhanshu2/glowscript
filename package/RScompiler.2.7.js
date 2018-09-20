/*This is a combined, compressed file.  Look at https://github.com/BruceSherwood/glowscript for source code and copyright information.*/
;(function(){})();
(function () {
    "use strict";

/*
Salvatore di Dio demonstrated in his RapydGlow experiment (http://salvatore.pythonanywhere.com/RapydGlow)
how he was able to use the RapydScript Python-to-JavaScript compiler with GlowScript graphics.
This inspired the implementation of the VPython (vpython.org) API at glowscript.org.
Salvatore provided the file papercomp.js for operator overloading, based on the work of
    Juerg Lehni (PaperScript: http://scratchdisk.com/posts/operator-overloading).
                 https://github.com/paperjs/paper.js
He also assembled support for the ability to write synchronous code in the file transform-all.js,
based on the work of
    Bruno Jouhier (Streamline: https://github.com/Sage/streamlinejs), and
    Marijn Haverbeke (Acorn.js: https://github.com/marijnh; https://github.com/ternjs/acorn).
Supporting the VPython API in a browser was initially possible thanks to the work of
    Alexander Tsepkov (RapydScript: https://bitbucket.org/pyjeon/rapydscript) and
    Charles Law (browser-based RapydScript: http://pyjeon.pythonanywhere.com/static/rapydscript_online/index.html).

When the GlowScript project was launched in 2011 by David Scherer and Bruce Sherwood,
Scherer implemented operator overloading and synchronous code using libraries existing at that time.
In 2015 it became necessary to upgrade to newer libraries because compilation failed on some browsers.

In Jan. 2017 Bruce Sherwood updated the operator overloading (papercomp.js) machinery to use
the latest versions of the acorn and streamline libraries. He also changed from using the rapydscript of
Tsepkov to the rapydscript-ng of Kovid Goyal, which is closer to true Python and therefore better for the
purposes to which GlowScript is put. An attempt was made to update Streamline (permit synchronous code)
but failed because the new large ES6-based library could not be minified by uglify. When and if uglify
can perform the minification, a new attempt will be made to use the Streamline file lib/compiling/transform-es6.js.
In the meantime transform.js is used (formerly named transform-all.js), the file obtained from Salvatore di Dio in 2015.

-----------------------------------------------------------------------------------------
HOW TO OBTAIN BROWSER VERSIONS OF THE RAPYDSCRIPT-NG, PAPERCOMP, STREAMLINE LIBRARIES, and PLOTLY
There are probably more efficient ways to obtain these libraries, but the following methods work.

For the rapydscript-ng in-browser Python-to-JavaScript transpiler, go to https://github.com/kovidgoyal/rapydscript-ng.
Search for "Embedding the RapydScript compiler in your webpage". There you will find a link to the transpiler file,
with instructions for how to use it. Store the file in lib/rapydscript/compiler.js.

The in-browser transpiler includes a minimized copy of the run-time function. However, for a program exported
to the user's own web page, the transpiler is not present and a run-time file is need. Here is how to build
the rapydscript-ng runtime library (but see below for an alternative procedure):
1) Make sure node is installed.
2) In a new folder, execute "npm install rapydscript-ng".
3) Create a file named "input.py" in this folder that contains "a=1".
4) Execute this (modify if not on Windows): node.exe .\node_modules\rapydscript-ng\bin\rapydscript --bare input.py > runtime.js
5) At the end of the file "runtime.js", delete these lines:
	var __name__ = "__main__";
	
	var a;
	a = 1;
6) Copy the file to lib/rapydscript/runtime.js.
For GlowScript 2.6 this resulted in runtime.js having the encoding "UCS-2 LE BOM" which the Uglify
machinery invoked by running build_original.py could not handle. Using (on Windows) notepad++
the encoding was changed to "UTF-8" which solved the problem.

The instructions above for building the two RapydScript files are adequate if it is not necessary to
get the very latest version from the rapydscript-ng repository. If there have been commits to the
repository that you want, but the key files haven't been updated, replace the instructions with the
following. I was unable to do this on Windows and did this on a Mac.
1) Make sure node and git are installed.
2) In a new folder, execute the following (taken from HACKING.md in the rapydscript-ng repository):
	git clone git://github.com/kovidgoyal/rapydscript-ng.git
	cd rapydscript-ng
	sudo npm link .
	sudo npm install  # This will automatically install the dependencies for RapydScript
3) Execute "sudo bin/rapydscript self --complete --test". This will build files in the "dev" folder.
4) Execute "sudo bin/web-repl-export embedded". This builds the "embedded" (in-browser) compiler.
5) Copy the file dev/baselib-plain-pretty.js to lib/rapydscript and change the name to runtime.js.
6) Copy the file embedded/rapydscript.js to lib/rapydscript and change the name to compiler.js.
7) Insert these statements at the start of runtime.js (this is a kludge; don't know how to invoke the new compiler):
	var RS_iterator_symbol = (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") ? Symbol.iterator : "iterator-Symbol-5d0927e5554349048cf0e3762a228256";
	var RS_kwargs_symbol = (typeof Symbol === "function") ? Symbol("kwargs-object") : "kwargs-object-Symbol-5d0927e5554349048cf0e3762a228256";
	var RS_cond_temp, RS_expr_temp, RS_last_exception;
	var RS_object_counter = 0;

The two rapydscript-ng files, compiler.js and runtime.js, have XY_ at the start of library entities,
where XY are non-ascii characters. This caused errors in the old streamline file (transform.js), 
so it was necessary to replace all XY characters with RS in both compiler.js and runtime.js. 
This may not be necessary in the future, if XY is acceptable to transform-es6.js.

For operator overloading, the source for lib/compiling/papercomp.js is at https://github.com/paperjs/paper.js,
at src/core/PaperScript.js; compare with papercomp.js, which was modified by Bruce Sherwood for greater speed.
Also needed is a current copy of acorn (acorn.es.js), a parser of JavaScript used by papercomp.js.
1) Make sure node has been installed.
2) In a new folder, execute "npm install acorn".
3) The file you want is node_modules/acorn/dist/acorn.es.js.
4) Copy the file to lib/compiling/acorn.es.js
5) Modify the end of the file to look like this:

	//export { version, parse, parseExpressionAt, tokenizer, parse_dammit, LooseParser, pluginsLoose, addLooseExports, Parser, plugins, defaultOptions, Position, SourceLocation, getLineInfo, Node, TokenType, tt as tokTypes, TokContext, types as tokContexts, isIdentifierChar, isIdentifierStart, Token, isNewLine, lineBreak, lineBreakG };
	
	//var exports = {
	//		acorn_parse: parse
	//	}

	//Export(exports)
	
	window.call_acorn_parse = parse // Bruce Sherwood; makes acorn accessible to GlowScript compiler

There is no current source outside GlowScript for lib/compiling/transform.js (formerly transform-all.js),
originally provided by Salvatore di Dio. The new but as yet unused file transform-es6.js was prepared thus:
1) Make sure node has been installed.
2) In a new folder, execute "npm install streamline". 
3) The file you want is node_modules/streamline/lib/browser/transform.js.
4) Copy the file to /lib/compiling/transform-es6.js

See ForInstalledPython/README.txt for how to obtain the plotly graphing library
*/

	var VPython_import = null // can be vpython or visual or vis
	var VPython_names = []    // e.g. [box, cylinder] or [] if none specified (e.g. import vpython)
    var waitlist = [new RegExp('^rate\\s*\\('), new RegExp('sleep\\s*\\('), 
                    new RegExp('^get_library\\s*\\('),  new RegExp('\\.waitfor\\s*\\('), 
                    new RegExp('\\.pause\\s*\\('), new RegExp('\\s*read_local_file\\s*\\(') ]
	// In a previous version of Streamline it was possible to specify the callback tag as "wait",
	// but that option is not available in current Streamline; it must be "_"
	var GS_wait = '_'
    
	function waits(line, lang) {
		// Look for "wait" in certain statements and change to GS_wait or, if missing, supply GS_wait (which is _)
		// return line with "_" inserted, true if line was changed, name of wait type (rate, sleep, get_library, waitfor, pause, read_local_file)
		for (var i=0; i<waitlist.length; i++) {
            var patt = waitlist[i]
            if (line.search(patt) >= 0) {
                var m = line.match(patt)
                var wname = m[0].slice(0,-1)
                var end = line.lastIndexOf(')')
                var ending = line.slice(end)
                var parencnt = 1
                var name = ''
                while (end >= 0) {
					end--
					if (end < 0) break
                    switch (line[end]) {
	                    case ("'"):
	                    case ('"'):
	                        return [line.slice(0,end+1)+','+GS_wait+ending, true, wname]
	                    case (')'):
	                        parencnt++
	                        break
	                    case ('('):
	                        parencnt--
	                        if (parencnt === 0) {
                            	if (name == 'wait' || name == '_') return [line.slice(0,end+1)+GS_wait+ending, true, wname]
	                            if (name.length === 0) return [line.slice(0,end+1)+GS_wait+ending, true, wname]
	                            return [line.slice(0,end+1)+name+','+GS_wait+ending, true, wname]
	                        }
	                        break
	                    case (','):
	                        if (parencnt === 1) {
                                if (name == 'wait') return [line.slice(0,end+1)+GS_wait+ending, true, wname]
                                else return [line, false, '']
	                        }
	                        break
	                    case (' '):
	                        break
	                    default:
	                        name = line[end]+name
                    }
				}
            }
        }
        return [line, false, '']
    }

	var lineno_string = 'RS_ls = ' // prepended to quoted line number; used in error return
	
    function preprocess(program, lang) { // manipulate the program source


		// The preprocessing includes inserting RS_ls = line number to enable error reporting of original source line
    	var c, lineno, lines, line, m, start
    	var waitfcts = {} // each element is 'name of function containing Streamline elements such as rate': name of element such as 'rate'
    	var parens = 0, brackets = 0, braces = 0
    	var prebraces // the braces at the start of processing a line
    	var infunction = false // true while reading through a function
    	var lastleftparens = null, lastleftbracket = null, lastleftbrace = null
	    var indent = ''
    	var getline = /(^\s*)(.*)/
    	var newprogram = '', lastindent = ''
    	var firstquote = 0 // 0: no string; 1: string starts with '; 2: string starts with " (or """)
    	var continuedline = false
    	var indef = false // true if processing an anonymous def in RapydScript
    	var classindent = -1 // class indent if processing a class, else -1
    	var delim = '"'
    	var defindents = []  // stack of [def or function character location, length of indent, function name, braces]
    	var pickpatt = /(\.pick)\s*(.)/
    	var classpatt = new RegExp('^class\s*[^:]:')
    	var defpatt = new RegExp('def\\W*(\\w*)\\s*\\(')
	    var fctpatt = new RegExp('(\\w*)\\W*(\\w*)\\s*\\(')
	    var print_optionspatt = /^print_options/
    	var decoration
    	
	    lines = program.split('\n')
		for (lineno=0; lineno<lines.length; lineno++) { // process individual lines of code
			decoration = ''
		    m = lines[lineno].match(getline)
		    indent = m[1]
		    line = m[2]
		    if (lang != 'javascript') {
		    	if (line[0] == '#') continue
		    	var c = line.replace(/\s+$/g, '') // delete trailing spaces; later check for 'a = ', which shouldn't compile to 'a = "21";' due to line number insertions
		    }
		    
		    m = line.match(print_optionspatt)
		    if (m) line = line.replace(/delete/, "remove") // RapydScript-NG chokes on "delete"; print_options accepts delete or remove

	    	if (lang != 'javascript' && line[0] == '@') { // such as @kwargs
	    		var nextline = lines[lineno+1]
	    		m = nextline.match(getline)
	    		if (m[2].slice(0,3) == 'def' || m[2].slice(0,6) == 'module') {
	    			decoration = line
	    			indent = m[1]
	    			line = m[2]
	    			lineno++
	    		} else {
	    			continue
	    		}
	    	}
		    
		    if (line.length === 0) continue
		    prebraces = braces
		    
		    // Check for this line indicating the end of a function.
		    // defindents.push([newprogram.length, indent.length, function name, braces)
		   if (lang != 'javascript') {
			    if (classindent === indent.length) classindent = -1
				if (defindents.length > 0 && indent.length <= defindents[defindents.length-1][1]) {
					ret = defindents.pop()
					infunction = false
				}
		    } else {
		    	if (defindents.length > 0 && braces === defindents[defindents.length-1][3])  {
		    		ret = defindents.pop()
					infunction = false
		    	}
		    }
		    if (lang != 'javascript' && line.match(classpatt)) classindent = indent.length

		    
			if (lang == 'vpython') { // handle VPython import statements
		    	// 'from vpython import *'  // this is the default (or 'from vpython import *')
	    		// 'from vpython import box, vec' // create vpython = {box:vp_box, vec:vec}
	    		// 'import vpython' // create vpython = {box:vp_box, sphere:vp_sphere, etc.}

				if (VPython_import === null) VPython_names = []
				var w = line.split(' ')
				if (w[1] == '__future__') continue
				if (w[1] == 'visual.factorial') continue
	    		if (w[0] == 'from' && w[2] == 'import' && w.length >= 4) { // from X import a, b, c (or *)
	    			if (w[1] == 'visual.graph') {
	    				if (w[3] == '*') continue // from visual.graph import * is the only graph import supported at the moment
	    				return 'ERROR: Currently only "from visual.graph import *" is supported, line '+(lineno+2)+": "+lines[lineno]
	    			}
	    			if (!(w[1] == 'vpython' || w[1] == 'visual' || w[1] == 'vis')) {
	    				throw new Error("Line "+(lineno+2)+": cannot import from "+w[1])
	    			}
	    		    if (VPython_import === null) {
	    		    	if (w[3] == '*') continue // from vpython import * is the default
	    		    	VPython_import = w[1]
	    		        for (var j=3; j<w.length; j++) {
	    		            if (w[j].length > 0 && w[j] != ',') {
	    		                if (w[j].slice(-1) == ',') w[j] = w[j].slice(0,-1)
	    		                if (w[j] == ' ' || w[j] == '(' || w[j] == ')' || w[j][0] == '(' || w[j][-1] == ')') continue
	    		                VPython_names.push(w[j])
	    		            }
	    		        }
	    		    }
	    		    continue
	    		} else if (w[0] == 'import' && w.length == 2) { // import X
	    			if (w[1] == 'visual.graph') return 'ERROR: Currently only "from visual.graph import *" is supported, line '+(lineno+2)+": "+lines[lineno]
	    			if (!(w[1] == 'vpython' || w[1] == 'visual' || w[1] == 'vis')) 
	    				return "ERROR: Cannot import from "+w[1]+", line "+(lineno+2)+": "+lines[lineno]
	    		    if (VPython_import === null) {
	    		    	VPython_import = w[1]
	    		    }
	    		    continue
	    		} else if (w[0] == 'import') {
	    			if (w[1] == 'vpython' || w[1] == 'visual' || w[1] == 'vis') {
	    				if (w.length == 4 && w[2] == 'as') {
	    					VPython_import = w[3] // import vpython as vp
	    					continue
	    				} else return "ERROR: improper import statement, line "+(lineno+2)+": "+lines[lineno]
	    			} else {
	    				return "ERROR: Cannot import from "+w[1]+", line "+(lineno+2)+": "+lines[lineno]
	    			}
	    		}
			}
		    
		    // Handle single ('), double ("), and triple (''' or """) quotes; also count parens, brackets, and braces
	    	var doublequote = false, singlequote = false, backslash = false
	    	var previouscontinuedline = continuedline
	    	var triplequote = false // true if in the midst of """......"""
	    	var processedtriplequote = false
	    	var tline = ""
	    	for (var i=0; i<line.length; i++) {
	    		var previousquote = singlequote || doublequote || triplequote
	    		// If there are quotes we stay in this loop to collect the entire string
	    		var char = line[i]
	    		if (char == '\\' && i < line.length-1 && line[i+1] !== ' ') { // handle e.g. \"
	    			i++
	    			continue
	    		}
	    		switch (char) {
		    		case '#':
		    			if (lang == 'javascript') break
		    			if (!singlequote && !doublequote && !triplequote) { // remove trailing comments
				    			line = line.slice(0,i)
		    			}
		    			break
		    		case "'":
		    		case '"':
		    			if (lang == 'javascript') break	    			
		    			if (i <= line.length-3 && line[i+1] == char && line[i+2] == char) { // ''' or """
		    				triplequote = !triplequote
		    				processedtriplequote = true
		    				i += 2
		    			} else {
		    				if (char == "'") {
		    					if (!doublequote && !triplequote) singlequote = !singlequote
		    				} else { // "
		    					if (!singlequote && !triplequote) doublequote = !doublequote
		    				}
		    			}
		    			break
		    	}
	    		if (triplequote && i == line.length-1 && lineno < lines.length-1) {
	    			lineno++
	    			line += '\n' + lines[lineno]
	    		}
	    		if (singlequote || doublequote || triplequote) {
	    			if (i < line.length-1) continue
	    			if (lineno === lines.length-1) {
	    				var q = "single"
	    				if (doublequote) q = "double"
	    				else q = "triple"
	    				return "ERROR: Unbalanced "+q+" quotes, line "+(lineno+2)+": "+lines[lineno]
	    			}
	    		}
	    		
	    		switch (char) {
		    		case ':':
		    			if (parens == 1 && braces === 0 && brackets === 0) { // anonymous function (':' not found in a dictionary)
		    				indef = true
		    			}
		    			break
		    		case '(':
		    			if (i > 0 && line[i-1] == '\\') break // check for \( in a regular expression
		    			if (parens === 0) lastleftparens = lineno
		    			parens++
		    			break
		    		case ')':
		    			if (i > 0 && line[i-1] == '\\') break // check for \) in a regular expression
		    			parens--
		    			if (indef && parens == 0) indef = false
		    			break
		    		case '[':
		    			if (i > 0 && line[i-1] == '\\') break // check for \[ in a regular expression
		    			if (brackets === 0) lastleftbracket = lineno
		    			brackets++
		    			break
		    		case ']':
		    			if (i > 0 && line[i-1] == '\\') break // check for \] in a regular expression
		    			brackets--
		    			break
		    		case '{':
		    			if (i > 0 && line[i-1] == '\\') break // check for \{ in a regular expression
		    			if (braces === 0) lastleftbrace = lineno
		    			braces++
		    			break
		    		case '}':
		    			if (i > 0 && line[i-1] == '\\') break // check for \} in a regular expression
		    			braces--
		    			break
	    		}
	    		if (char == '\\') {
	    			if (i == line.length-1 || line[i+1] == ' ' || line[i+1] == '#')
		    			line = line.slice(0,i)
		    			backslash = true
		    			break
	    		}
	    	}
    		continuedline =  ( !indef && (backslash || (parens > 0) || (brackets > 0) || (braces > 0)) )
    		 // End of handling single, double, and triple quotes, and counting parens, brackets, and braces
    		

		    if (!previousquote) {
		    	if (lang == 'vpython') {
			    	var m = pickpatt.exec(line+' ') // convert v.pick -> v.pick()
			    	if (m) {
			    		if (m[2] != '(' && (m[2].search(/\w/) != 0)) {
			    			var i = m.index
			    			line = line.slice(0,i)+'.pick()'+line.slice(i+5)
			    		}
			    	}
		    	}
			    

			    if (!processedtriplequote) { // don't make adjustments inside a triplequote comment
			    	// In this section we deal with inserting as needed Streamline tokens ('_'), which make it
			    	// possible to write synchronous code that Streamline reorganizes into asynchronous code.
			    	// The token must appear as an extra argument in statements such as rate or pause,
			    	// in the header of functions in which such statements are found, and in the calling
			    	// sequence for calling such functions.
			    	// Minor note: the version of Streamline currently in use in GlowScrpt has an option to
			    	// choose the token, which was 'wait', but current versions of Streamline require the
			    	// use of '_'. Given the possibility of updating to later versions of Streamline, we
			    	// use '_' and change a use of 'wait' to '_'.
			    	var more = true
			    	if (lang != 'javascript') {
			    		// Look for "def f(....)'
			    		var m = defpatt.exec(line)
			    		if (m !== null) {
			    			var fname = m[1]
			    			if (classindent >= 0) fname = '.'+fname
			    			defindents.push([newprogram.length, indent.length, fname, prebraces]) // remember where this def or class is; it may need 'wait'
			    			more = false
			    		}
			    	} else {
						// Look for "function f(...)" or "f = function (...)"
						var m = fctpatt.exec(line)
						if (m !== null && (m[1] == 'function' || m[2] == 'function')) {
							var fname
						    if (m[1] == 'function') fname = m[2]
							else if (m[2] == 'function') fname = m[1]
			    			defindents.push([newprogram.length, indent.length, fname, prebraces]) // remember where this function is; it may need 'wait'
			    			more = false
						}
			    	}
					if (more) {
				    	// Look for rate, sleep, get_library, .waitfor, .pause, read_local_file, and 
						// insert 'wait' argument (and if inside a function, insert earlier 'wait')
			    		var L = line.length
			    		var ret = waits(line, lang) // returns line, true if line modified, name of Streamline item (rate, pause, etc.)
			    		line = ret[0]
			    		
			    		if (ret[1] && defindents.length > 0) { // need to ensure def or function has wait argument
			    			var definfo = defindents[defindents.length-1] // [location of def or function in newprogram, indent level, function name]
			    			if (!infunction) {
			    				infunction = true // prevent multiple updating of def or function
			    				if (waitfcts[definfo[2]] === undefined)
			    						waitfcts[definfo[2]] = ret[2] // add to dictionary of functions that contain Streamline items
			    				var end
			    				var start = definfo[0]
				    			// Find ending ')' of the function:
				    			if (lang != 'javascript') {
				    				end = newprogram.slice(start).search(/:/) + start
					    			while (newprogram[end] !== ')') end--
				    			} else {
				    				end = newprogram.slice(start).search(/\(/)
				    				var parencnt = 1
				    				while (parencnt > 0) {
				    					end++
				    					switch (newprogram[start+end]) {
					    					case ('('):
					    						parencnt++
					    						break
					    					case (')'):
					    						parencnt--
					    						break
				    					}
				    				}
				    				end += start
				    			}
				    			var i = end-1
				    			while (newprogram[i] == ' ') i--
				    			var insert
				    			if (newprogram[i] == '(') newprogram = newprogram.slice(0,end)+GS_wait+newprogram.slice(end)
				    			else { // check to see whether wait is already present
				    				var iend = i
				    				while (true) {
				    					i--
				    					var c = newprogram[i]
				    					if (c == ',' || c == ' ' || c == '(') break
				    				}
				    				insert = newprogram.slice(i+1,iend+1)
				    				if (insert != GS_wait) {
				    					if (insert == 'wait') newprogram = newprogram.slice(0,i+1)+GS_wait+newprogram.slice(end)
				    					else newprogram = newprogram.slice(0,end)+','+GS_wait+newprogram.slice(end)
				    				}
				    			}
				    			
			    			}
			    		}
					}
			    }
		    }
    		
    		// Convert left += right to left = left+right (similarly for -=, *=, and /=)
    		// This was needed when trying to use the RapydScript-NG option 
    		/*
    		var equalops = ['+=', '-=', '*=', '/=']
    		for (var eq=0; eq<equalops.length; eq++) {
    			var op = equalops[eq]
	    		var opequal = line.indexOf(op)
	    		if (opequal >= 0) {
	    			// check that left isn't malformed, such as def f(x): x += a or ....(left += a), etc.
	    			var parens0 = parens
	    			var brackets0 = brackets
	    			var braces0 = braces
	    			var i = opequal
	    			var end = 0
	    			while (i > 0) {
	    				i--
	    				var c = line[i]
	    				switch (c) {
	    					case '(': 
	    						parens++
	    						break
	    					case ')': 
	    						parens--
	    						break
	    					case '[':
	    						brackets++
	    						break
	    					case ']':
	    						brackets--
	    						break
	    					case '{':
	    						brackets++
	    						break
	    					case '=':
	    						return "ERROR: Error in use of "+op+", line "+(lineno+2)+": "+lines[lineno]
	    					case ':':
	    					case ';':
	    						end = i+1
	    						i = 0
	    						break
	    				}
	    			}
	    			if (parens !== parens0 || brackets !== brackets0 || braces !== braces0) return "ERROR: Error in use of "+op+", line "+(lineno+2)+": "+lines[lineno]
	    			var left = line.slice(end,opequal)
	    			line = line.slice(0,end)+left +'= '+left+op[0]+line.slice(opequal+2)
	    		}
    		}
    		*/
    		
    		if (lang == 'vpython' || lang == 'rapydscript') {
			    // When outdent line starts with ')', the "N" must be indented.
			    // When outdent line starts with 'else' or 'elif', at the same level as prevous line,
			    //   don't insert a line number; it's this case:
			    //     if a: b
			    //     elif c: d
			    //     else e: f
		    	// Similarly, if outdent line starts with except or finally, don't insert a line number
			    
			    c = ''
			    if (indent.length < lastindent.length && ( line.charAt(0) == ')' || 
			    		line.substr(0,4) == 'else' ||
			    		line.substr(0,4) == 'elif' ||
			    	    line.substr(0,6) == 'except' || 
			    	    line.substr(0,7) == 'finally') ) {
			    	c = lastindent+lineno_string+delim+(lineno+2)+delim+'\n'
			    } else c = indent+lineno_string+delim+(lineno+2)+delim+'\n'
			    
		    	if (indent.length == lastindent.length && (line.substr(0,4) == 'elif' || line.substr(0,4) == 'else')) {
		    		c = ''
		    	} else if (line.substr(0,3) == '"""' || line.substr(0,3) == "'''" || line[0] == ')') {
		    		c = ''
		    	}
			    
		    	if (line[line.length-1] == '=') return 'ERROR: Line '+(lineno+2)+" ends with equal sign: "+lines[lineno]
	
			    // need to indent the entire program two spaces
		    	if (previouscontinuedline) {
		    		newprogram = newprogram.slice(0,-1)+indent+line+'\n'
		    		indent = lastindent // keep the indent of the starting line of this continued sequence
		    	} else if (c == '') {
		    		newprogram += '  '+indent+line+'\n' 
		    	} else {
		    		if (decoration.length > 0) {
		    			newprogram += '  '+c+'  '+indent+decoration+'\n'
		    			newprogram += '  '+indent+line+'\n'
		    		} else {
		    			newprogram += '  '+c+'  '+indent+line+'\n'
		    		}
		    	}
    		} else { // javascript
    			newprogram += indent+line+'\n'
    		}

		    lastindent = indent
		    if (parens < 0) return "ERROR: Too many right parentheses, line "+(lineno+2)+": "+lines[lineno]
		    if (brackets < 0) return "ERROR: Too many right brackets, line "+(lineno+2)+": "+lines[lineno]
		    if (braces < 0) return "ERROR: Too many right braces, line "+(lineno+2)+": "+lines[lineno]		    
		} // end of processing individual lines of code

    	// Find all calls to functions that require the Streamline token ('_')
    	// If such a function g is in canvas.bind(...., f) or in widget(... bind=f), throw an error,
    	//      as Streamline can't deal with f instead of f().
    	for (var i in waitfcts) {
    		var fname = i
    		var wname = waitfcts[i]
    		var reduced_wname = wname[0] == '.' ? wname.slice(1) : wname
    		var p = new RegExp('\\.bind[^,]*,\\s*'+fname+'\\s*\\)')
    		var n = newprogram.search(p)
    		if (n >= 0) throw new Error("Cannot bind function '"+fname+"' to an event because it contains a "+reduced_wname+" statement.")
    		p = new RegExp('\\s*bind\\s*=\\s*'+fname+'\\s*\\)')
    		n = newprogram.search(p)
    		if (n >= 0) throw new Error("Cannot bind function '"+fname+"' to a widget because it contains a "+reduced_wname+" statement.")
    		p = new RegExp('(\\w*)\\W*'+fname+'\\s*\\(', 'g')
    		while (true) {
    			var m = p.exec(newprogram) // find a call to a function that contains rate/pause etc.
    			if (m === null) break
    			if (m[1] == 'def' || m[1] == 'function') continue // skip that function itself
    			var parencnt = 1
    			var n = p.lastIndex-1
    			var startarg = n+1
    			var lastcomma = 0
    			var arg = ''
    			var q1 = false
    			var q2 = false
    			while (parencnt > 0) {
    				n++
    				switch (newprogram[n]) {
	                    case ("'"):
	                    	q1 = !q1
	                    	break
	                    case ('"'):
	                        q2 = !q2
	                        break
	    				case (' '):
	    					break
	    				case ('('):
	    					if (!(q1 || q2)) parencnt++
	    					break
	    				case (','):
	    					if (parencnt == 1) {
	    						lastcomma = n
	    						startarg = n+1
	    						arg = ''
	    					}
	    					break
	    				case (')'):
	    					if (!(q1 || q2)) parencnt--
	    					if (parencnt === 0) {
	    						if (arg.length > 0) {
	    							if (arg == 'wait' || arg == '_') {
	    								if (lastcomma > 0) newprogram = newprogram.slice(0,lastcomma+1)+GS_wait+newprogram.slice(n)
	    								else newprogram = newprogram.slice(0,startarg)+GS_wait+newprogram.slice(startarg+4)
	    							} else if (arg == GS_wait) ;
	    							else newprogram = newprogram.slice(0,n)+','+GS_wait+newprogram.slice(n)
	    						} else {
	    							newprogram = newprogram.slice(0,startarg)+GS_wait+newprogram.slice(n)
	    						}
	    					}
	    					break
	    				default:
	    					arg += newprogram[n]
    				}
    			}
    		}
    	}
    	
    	if (parens > 0) return "ERROR: Missing right parenthesis, see line "+(lastleftparens+2)+": "+lines[lastleftparens]
	    else if (brackets > 0) return "ERROR: Missing right bracket, see line "+(lastleftbracket+2)+": "+lines[lastleftbracket]
	    else if (braces > 0) return "ERROR: Missing right brace, see line "+(lastleftbrace+2)+": "+lines[lastleftbrace]
	    else return newprogram
    }

    var linenopatt = /"(\d*)"/

    var RS_compiler

    function compile_rapydscript(rs_input) {
	    if (rs_input.slice(0,7) == 'ERROR: ') {
	    	throw new Error(rs_input.slice(7))
    	} else {
    	    if (RS_compiler === undefined) RS_compiler = RapydScript.create_embedded_compiler();
	        rs_input += '\n'; //just to be safe
	        try {
	        	var output = RS_compiler.compile(rs_input, {js_version:5}) // default is ES6; use ES5 until can update Stramline
	        	//var output = RS_compiler.compile(rs_input)
				return output.toString();
	        } catch(err) {
		        if (err.line === undefined) {
		        	throw new Error(err.message)
		        } else {
		    	    var lines = rs_input.split('\n')
		    	    var L = lines[err.line] // the text of the error line
		    	    var m = L.match(linenopatt) // may be '  "23"', inserted by insertLineNumbers()
		    	    if (m !== null) {
		    	    	throw new Error(err.message + "; line " + m[1] + ": "+lines[err.line+1])
		    	    } else {
		    	    	throw new Error(err.message +': '+lines[err.line])
		    	    }
		        }
	      	}
    	}
    }

    // vp_primitives come in two flavors: "box" for JavaScript/RapydScript and "vp_box" for VPython
    var vp_primitives = ["box", "sphere", "cylinder", "pyramid", "cone", "helix", "ellipsoid", "ring", "arrow", "compound"]
    
    var vp_other = ["canvas", "vec", "vector", "rate", "sleep", "update", "color", "extrusion", "paths", "shapes",
                    "vertex", "triangle", "quad", "label", "distant_light", "local_light", "attach_trail", "attach_arrow",
                    "sqrt", "pi", "abs", "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "exp", "log", "pow",
                    "factorial", "combin", "button", "radio", "checkbox", "slider", "checkbox", "text",
                    "radians", "degrees",
                    "get_library", "read_local_file"]
    
    function compile(program, options) {
    	// options include lang ('javascript' or 'rapydscript' or 'vpython'), version,
    	//     run (true if will run the code, false if compiling for sharing, in which case don't call fontloading)
    	options = options || {}
    	window.__original = {text: program.split("\n")}
        window.__GSlang = options.lang
        var version = '["'+options.version+'", "glowscript"]' // e.g. ['1.1', 'glowscript']
        
        // Look for text object in program
    	// findtext finds "...text  (....." and findstart finds "text  (...." at start of program
        var findtext = /[^\.\w]text[\ ]*\(/
        var findstart = /^text[\ ]*\(/
    	var loadfonts = findtext.exec(program)
        if (!loadfonts) loadfonts = findstart.exec(program)
        // Not clear the following helped, because both this call to fontloading and the call inserted 
        // at the start of the compiled program led to accessing the font files twice.
        //if (options.run && loadfonts) fontloading() // trigger loading of font files for 3D text, in parallel with compilation (unless compiling for sharing)
        
        // Work around the problem that .delete is not allowed in JavaScript; for API need d = canvas() .... d.delete() to delete canvas:
        program = program.replace(/\.delete/g, ".remove")
        
        if (options.lang == "rapydscript" || options.lang == 'vpython') {
        	program = preprocess(program, options.lang)
    		var vars = ''
        	if (program.slice(0,7) == 'ERROR: ') {
        		compile_rapydscript(program)
        	} else {
	        	var prog
	        	if (options.lang == 'rapydscript') {
	        		prog = "def main(" + GS_wait + "):\n  version = "+version+"\n  window.__GSlang = 'rapydscript'\n  scene = canvas()\n  print = GSprint\n" + program + "main"
	        	} else { // 'vpython'
	                program = program.replace(/arange\s*\(/g, 'range(')   // Make arange equivalent to range
	                //program = program.replace(/\.pop\s*\(/g, '.pypop(')    // Make pop equivalent to pypop (RapydScript python-like pop); need pop for sets
	                program = program.replace(/\.sort\s*\(/g, '.pysort(')  // Make sort equivalent to pysort (RapydScript python-like sort)
	        		prog = "def main(" + GS_wait + "):\n  version = "+version+"\n"
        			prog += "  window.__GSlang = 'vpython'\n" // WebGLRenderer needs to know at run time what models to create
        			// The following turned out to slow all calculations down by about a factor of 5 and so was abandoned:
        			//prog += "  from __python__ import dict_literals, overload_getitem\n" // so that dictionaries behave like Python dictionaries
	        		if ( VPython_import === null) {
		        		for (var i = 0; i<vp_primitives.length; i++) prog += "  "+vp_primitives[i]+"=vp_"+vp_primitives[i]+"\n"
		        		prog += "  display=canvas\n  vector=vec\n"
	        		} else if (VPython_names.length > 0) { // e.g from vpython import box, cylinder
		        		vars += "  vector=vec\n"
		        		for (var i=0; i<vp_primitives.length; i++) {
	        				var name = vp_primitives[i]
	        				var n = VPython_names.indexOf(name)
	        				if (n >= 0) vars += "  "+name+"=vp_"+name+"\n"
	        				else vars += "  "+name+"=undefined\n"
	        			}
	        			var hasvector = (VPython_names.indexOf('vector') >= 0)
	        			for (var i=0; i<vp_other.length; i++) {
	        				var name = vp_other[i]
	        				if (name == 'vec' && hasvector) continue
	        				var n = VPython_names.indexOf(name)
	        				if (n < 0) vars += "  "+name+"=undefined\n"  // just undefine those entities not listed in the import; those listed need no mention
	        			}
	        			prog += vars
	        		} else { // import vpython or visual or vis, or import vpython or visual or vis as (VPython_import)
	        			var importpatt = new RegExp(VPython_import+'\\.(\\w+)', 'g')
	        			var m = program.match(importpatt) // has the form [vis.vector, vis.rate, vis.vector, .....]
	        			importpatt = new RegExp(VPython_import+'\\.(\\w+)')
	        			var attrs = {} // a dictionary containing all the objects referenced in the program
	        			for (var i=0; i<m.length; i++) {
	        				var a = importpatt.exec(m[i])[1] // extract "rate" from "vis.rate" or "visual.rate"
	        				if (!(a in attrs)) attrs[a] = a
	        			}
	        			var purge = '' // set variables unqualified by vis. or visual. to "undefined"
		        		vars += '    var '+VPython_import+'={'
	        			for (var i=0; i<vp_primitives.length; i++) {
	        				var name = vp_primitives[i]
	        				if (name in attrs) vars += name+':vp_'+name+', '
	        				else purge += "  "+name+'=undefined\n'
	        			}
	        			vars += 'canvas:canvas, '
	        			for (var i=0; i<vp_other.length; i++) {
	        				var name = vp_other[i]
	        				if (name == 'canvas') continue
	        				if (name in attrs) {
	        					if (name == 'vector') vars += 'vector:vec, '
	        					else vars += name+':'+name+', '
	        				} else {
	        					if (name == 'vec' && ('vector' in attrs)) continue
	        					purge += "  "+name+'=undefined\n'
	        				}
	        			}
	        			vars = vars.slice(0,-2)+'}\n'
	        			prog += purge
	        		}
	        		prog += "  print=GSprint\n"
	        		if (VPython_import === null || VPython_names.length > 0) prog += "  scene = canvas()\n"
	        		else prog += "  scene = "+VPython_import+".canvas()\n"
	        		
	        		prog += "  from pythonize import strings\n"
	        		prog += "  strings()\n"
	        		prog += program
	        	}
	        	
	        	program = compile_rapydscript(prog)
	        	var start = program.indexOf('window.__GSlang')
	        	var arr = "Array.prototype['+']=function(r) {return this.concat(r)}\n" // adding Python lists
        		arr += "    Array.prototype['*']=function(r) {return __array_times_number(this, r)}\n" // multiplying Python list times number
	        	arr += "    var __name__ = '__main__'\n"
	        	
        		if (VPython_names.length <= 0) arr += vars
	        	program = program.slice(0,start) + arr + program.slice(start-4)
        	}
        	
        } else { // JavaScript
        	program = preprocess(program, options.lang)
            var prog = "function main(" + GS_wait + ") {\n"
            prog += "var version = "+version+";\n"
            prog += "var scene = canvas();\n"
            // Placing this here instead of in vectors.js gives stack overflow:
    		//prog += "Number.prototype['*'] = function (r) {" // check whether right operand is Number or vec
        	//prog +=    "return (r instanceof vec) ? r.multiply(this) : r*this};\n"
            program = prog + program + "\n};\nmain"
        }
    	
        if (loadfonts) {
        	var s = "scene = canvas();\n"
            var sc = program.indexOf(s) + s.length
        	s = "    waitforfonts("+GS_wait+")\n"  // wait for font files
            program = program.slice(0,sc)+s+program.slice(sc,program.length)
        }
        
        // handle operator overloading
        var parsed = papercompile(program)
        /* 
        if (options.lang == 'vpython') { // process only that portion of program that's relevant (VPython-specific)
        	var s = 'strings();\n'
            var start = program.indexOf(s) + s.length
            s = '};\nif (!main'
            var end = program.indexOf(s)
            parsed = papercompile(program.slice(start,end)) // handle operator overloading
            parsed = program.slice(0,start)+parsed+program.slice(end)
        } else parsed = papercompile(program)
        */
        
    	// Still using an old version of Streamline (lib/compiling/transform.js) because 
    	// uglify cannot minimize the new version (lib/compiling/transform-es6.js), which uses ES6.
    	// transform-es6.js is 1.8 MB, so it's important to minimize it.
        var prog = window.Streamline.transform(parsed, { alreadyParsed: true }) // permit synhronous code
    	//var prog = window.Streamline.transform(parsed, { alreadyParsed: true, runtime: "callbacks" }) // permit synhronous code
    	//var prog = Streamline.transform(parsed, { alreadyParsed: true, callback: wait }) // older version
    	
		program = prog.replace(/\n\n\n\n/g, '') // eliminate lots of white space
		// Reduce RS_ls = "4" to "4" (specifying original line number in output for error return purposes)
		if (options.lang != 'javascript') program = program.replace(new RegExp(' '+lineno_string, 'g'), ' ')
		program = program.replace(/Math.pow/g, 'GS_power') // enable checking for trying to take a vec to a power
		
		if (loadfonts) program = "fontloading();\n" + program
		
		// Removing a final _() eliminates an irrelevant error message associated with Streamline:
		var s = GS_wait+'()'
		var sc = program.lastIndexOf(s)
		if (sc > -1) program = program.slice(0,sc) + program.slice(sc+s.length,program.length)
		
//        var p = program.split('\n')
//    	for (var i=0; i<p.length; i++) console.log(i, p[i])
		return program
    }
    window.glowscript_compile = compile

		
})();
// vim:fileencoding=utf-8
(function(external_namespace) {
"use strict;"
var rs_version = "0.7.18";
var rs_commit_sha = "69282051be6334f2d80a85a7a40e5727b839d8ea";

// Embedded modules {{{

// End embedded modules }}}

/* vim:fileencoding=utf-8
 * 
 * Copyright (C) 2016 Kovid Goyal <kovid at kovidgoyal.net>
 *
 * Distributed under terms of the BSD license
 */

var namespace = {}, jsSHA = {};

var write_cache = {};

var builtin_modules = {
    'crypto' : {
        'createHash': function create_hash() {
            var ans = new jsSHA.jsSHA('SHA-1', 'TEXT');
            ans.digest = function hex_digest() { return ans.getHash('HEX'); };
            return ans;
        },
    },

    'vm': {
        'createContext': function create_context(ctx) {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            var win = iframe.contentWindow;
            if(!ctx) ctx = {};
            if (!ctx.sha1sum) ctx.sha1sum = sha1sum;
            if (!ctx.require) ctx.require = require;
            Object.keys(ctx).forEach(function(k) { win[k] = ctx[k]; });
            return win;
        },

        'runInContext': function run_in_context(code, ctx) {
            return ctx.eval(code);
        },

        'runInThisContext': eval,
    },
    'path': {
        'join': function path_join() { return Array.prototype.slice.call(arguments).join('/'); },
        'dirname': function path_dirname(path) {
            return path.split('/').slice(0, -1).join('/');
        },
    },
    'inspect': function inspect(x) { return x.toString(); },

    'fs': {
        'readFileSync': function readfile(name) {
            var data = namespace.file_data[name];
            if (data) return data;
            data = write_cache[name];
            if (data) return data;
            var err = Error();
            err.code = 'ENOENT';
            throw err;
        },

        'writeFileSync': function writefile(name, data) {
            write_cache[name] = data;
        },

    },
};

function require(name) {
    return builtin_modules[name] || {};
}

// Embedded sha1 implementation {{{
(function() {
/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-4 and FIPS PUB 202, as well as the corresponding
 HMAC implementation as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2017
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
(function(G){function x(b,a,d){var c=0,e=[],h=0,l=!1,f=[],g=[],q=!1;d=d||{};var r=d.encoding||"UTF8";var k=d.numRounds||1;if(k!==parseInt(k,10)||1>k)throw Error("numRounds must a integer >= 1");if("SHA-1"===b){var n=512;var y=z;var m=H;var p=160;var t=function(c){return c.slice()}}else throw Error("Chosen SHA variant is not supported");var v=A(a,r);var u=w(b);this.setHMACKey=function(e,a,d){if(!0===l)throw Error("HMAC key already set");if(!0===q)throw Error("Cannot set HMAC key after calling update");
r=(d||{}).encoding||"UTF8";a=A(a,r)(e);e=a.binLen;a=a.value;var h=n>>>3;d=h/4-1;if(h<e/8){for(a=m(a,e,0,w(b),p);a.length<=d;)a.push(0);a[d]&=4294967040}else if(h>e/8){for(;a.length<=d;)a.push(0);a[d]&=4294967040}for(e=0;e<=d;e+=1)f[e]=a[e]^909522486,g[e]=a[e]^1549556828;u=y(f,u);c=n;l=!0};this.update=function(a){var d,b=0,l=n>>>5;var f=v(a,e,h);a=f.binLen;var g=f.value;f=a>>>5;for(d=0;d<f;d+=l)b+n<=a&&(u=y(g.slice(d,d+l),u),b+=n);c+=b;e=g.slice(b>>>5);h=a%n;q=!0};this.getHash=function(a,d){if(!0===
l)throw Error("Cannot call getHash after setting HMAC key");var f=B(d);switch(a){case "HEX":a=function(a){return C(a,p,f)};break;case "B64":a=function(a){return D(a,p,f)};break;case "BYTES":a=function(a){return E(a,p)};break;case "ARRAYBUFFER":try{d=new ArrayBuffer(0)}catch(I){throw Error("ARRAYBUFFER not supported by this environment");}a=function(a){return F(a,p)};break;default:throw Error("format must be HEX, B64, BYTES, or ARRAYBUFFER");}var g=m(e.slice(),h,c,t(u),p);for(d=1;d<k;d+=1)g=m(g,p,
0,w(b),p);return a(g)};this.getHMAC=function(a,d){if(!1===l)throw Error("Cannot call getHMAC without first setting HMAC key");var f=B(d);switch(a){case "HEX":a=function(a){return C(a,p,f)};break;case "B64":a=function(a){return D(a,p,f)};break;case "BYTES":a=function(a){return E(a,p)};break;case "ARRAYBUFFER":try{a=new ArrayBuffer(0)}catch(I){throw Error("ARRAYBUFFER not supported by this environment");}a=function(a){return F(a,p)};break;default:throw Error("outputFormat must be HEX, B64, BYTES, or ARRAYBUFFER");
}d=m(e.slice(),h,c,t(u),p);var k=y(g,w(b));k=m(d,p,n,k,p);return a(k)}}function C(b,a,d){var c="";a/=8;var e;for(e=0;e<a;e+=1){var h=b[e>>>2]>>>8*(3+e%4*-1);c+="0123456789abcdef".charAt(h>>>4&15)+"0123456789abcdef".charAt(h&15)}return d.outputUpper?c.toUpperCase():c}function D(b,a,d){var c="",e=a/8,h;for(h=0;h<e;h+=3){var l=h+1<e?b[h+1>>>2]:0;var f=h+2<e?b[h+2>>>2]:0;f=(b[h>>>2]>>>8*(3+h%4*-1)&255)<<16|(l>>>8*(3+(h+1)%4*-1)&255)<<8|f>>>8*(3+(h+2)%4*-1)&255;for(l=0;4>l;l+=1)8*h+6*l<=a?c+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(f>>>
6*(3-l)&63):c+=d.b64Pad}return c}function E(b,a){var d="";a/=8;var c;for(c=0;c<a;c+=1){var e=b[c>>>2]>>>8*(3+c%4*-1)&255;d+=String.fromCharCode(e)}return d}function F(b,a){a/=8;var d,c=new ArrayBuffer(a);var e=new Uint8Array(c);for(d=0;d<a;d+=1)e[d]=b[d>>>2]>>>8*(3+d%4*-1)&255;return c}function B(b){var a={outputUpper:!1,b64Pad:"=",shakeLen:-1};b=b||{};a.outputUpper=b.outputUpper||!1;!0===b.hasOwnProperty("b64Pad")&&(a.b64Pad=b.b64Pad);b.hasOwnProperty("shakeLen");if("boolean"!==typeof a.outputUpper)throw Error("Invalid outputUpper formatting option");
if("string"!==typeof a.b64Pad)throw Error("Invalid b64Pad formatting option");return a}function A(b,a){switch(a){case "UTF8":case "UTF16BE":case "UTF16LE":break;default:throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");}switch(b){case "HEX":b=function(a,c,e){var d=a.length,b,f;if(d%2)throw Error("String of HEX type must be in byte increments");c=c||[0];e=e||0;var g=e>>>3;for(b=0;b<d;b+=2){var q=parseInt(a.substr(b,2),16);if(isNaN(q))throw Error("String of HEX type contains invalid characters");
var r=(b>>>1)+g;for(f=r>>>2;c.length<=f;)c.push(0);c[f]|=q<<8*(3+r%4*-1)}return{value:c,binLen:4*d+e}};break;case "TEXT":b=function(d,c,e){var b=0,l,f,g;c=c||[0];e=e||0;var q=e>>>3;if("UTF8"===a){var r=3;for(l=0;l<d.length;l+=1){var k=d.charCodeAt(l);var n=[];128>k?n.push(k):2048>k?(n.push(192|k>>>6),n.push(128|k&63)):55296>k||57344<=k?n.push(224|k>>>12,128|k>>>6&63,128|k&63):(l+=1,k=65536+((k&1023)<<10|d.charCodeAt(l)&1023),n.push(240|k>>>18,128|k>>>12&63,128|k>>>6&63,128|k&63));for(f=0;f<n.length;f+=
1){var m=b+q;for(g=m>>>2;c.length<=g;)c.push(0);c[g]|=n[f]<<8*(r+m%4*-1);b+=1}}}else if("UTF16BE"===a||"UTF16LE"===a)for(r=2,n="UTF16LE"===a&&!0||"UTF16LE"!==a&&!1,l=0;l<d.length;l+=1){k=d.charCodeAt(l);!0===n&&(f=k&255,k=f<<8|k>>>8);m=b+q;for(g=m>>>2;c.length<=g;)c.push(0);c[g]|=k<<8*(r+m%4*-1);b+=2}return{value:c,binLen:8*b+e}};break;case "B64":b=function(a,c,e){var d=0,b,f;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw Error("Invalid character in base-64 string");var g=a.indexOf("=");a=a.replace(/\=/g,
"");if(-1!==g&&g<a.length)throw Error("Invalid '=' found in base-64 string");c=c||[0];e=e||0;var q=e>>>3;for(g=0;g<a.length;g+=4){var m=a.substr(g,4);for(b=f=0;b<m.length;b+=1){var k="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(m[b]);f|=k<<18-6*b}for(b=0;b<m.length-1;b+=1){var n=d+q;for(k=n>>>2;c.length<=k;)c.push(0);c[k]|=(f>>>16-8*b&255)<<8*(3+n%4*-1);d+=1}}return{value:c,binLen:8*d+e}};break;case "BYTES":b=function(a,c,b){var d;c=c||[0];b=b||0;var e=b>>>3;for(d=0;d<
a.length;d+=1){var f=a.charCodeAt(d);var g=d+e;var m=g>>>2;c.length<=m&&c.push(0);c[m]|=f<<8*(3+g%4*-1)}return{value:c,binLen:8*a.length+b}};break;case "ARRAYBUFFER":try{b=new ArrayBuffer(0)}catch(d){throw Error("ARRAYBUFFER not supported by this environment");}b=function(a,c,b){var d;c=c||[0];b=b||0;var e=b>>>3;var f=new Uint8Array(a);for(d=0;d<a.byteLength;d+=1){var g=d+e;var m=g>>>2;c.length<=m&&c.push(0);c[m]|=f[d]<<8*(3+g%4*-1)}return{value:c,binLen:8*a.byteLength+b}};break;default:throw Error("format must be HEX, TEXT, B64, BYTES, or ARRAYBUFFER");
}return b}function m(b,a){return b<<a|b>>>32-a}function t(b,a){var d=(b&65535)+(a&65535);return((b>>>16)+(a>>>16)+(d>>>16)&65535)<<16|d&65535}function v(b,a,d,c,e){var h=(b&65535)+(a&65535)+(d&65535)+(c&65535)+(e&65535);return((b>>>16)+(a>>>16)+(d>>>16)+(c>>>16)+(e>>>16)+(h>>>16)&65535)<<16|h&65535}function w(b){if("SHA-1"===b)b=[1732584193,4023233417,2562383102,271733878,3285377520];else throw Error("No SHA variants supported");return b}function z(b,a){var d=[],c;var e=a[0];var h=a[1];var l=a[2];
var f=a[3];var g=a[4];for(c=0;80>c;c+=1){d[c]=16>c?b[c]:m(d[c-3]^d[c-8]^d[c-14]^d[c-16],1);var q=20>c?v(m(e,5),h&l^~h&f,g,1518500249,d[c]):40>c?v(m(e,5),h^l^f,g,1859775393,d[c]):60>c?v(m(e,5),h&l^h&f^l&f,g,2400959708,d[c]):v(m(e,5),h^l^f,g,3395469782,d[c]);g=f;f=l;l=m(h,30);h=e;e=q}a[0]=t(e,a[0]);a[1]=t(h,a[1]);a[2]=t(l,a[2]);a[3]=t(f,a[3]);a[4]=t(g,a[4]);return a}function H(b,a,d,c){var e;for(e=(a+65>>>9<<4)+15;b.length<=e;)b.push(0);b[a>>>5]|=128<<24-a%32;a+=d;b[e]=a&4294967295;b[e-1]=a/4294967296|
0;a=b.length;for(e=0;e<a;e+=16)c=z(b.slice(e,e+16),c);return c}"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(module.exports=x),exports=x):G.jsSHA=x})(this);
}).call(jsSHA);
// End embedded sha1 implementation }}}

var exports = namespace;
/* 
 * Copyright (C) 2015 Kovid Goyal <kovid at kovidgoyal.net>
 *
 * Distributed under terms of the BSD license
 */

var vm = require('vm');
var native_require = require;

function normalize_array(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];

    // ignore empty parts
    if (!p || p === '.')
      continue;

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

function normalize(path) {
    var is_abs = path && path[0] === '/';
    var trailing_slash = path && path[path.length - 1] === '/';
    path = normalize_array(path.split('/'), !is_abs).join('/');

    if (!path && !is_abs) {
        path = '.';
    }
    if (path && trailing_slash) {
        path += '/';
    }

    return (is_abs ? '/' : '') + path;
}

function dirname(path) {
    var idx = path.lastIndexOf('/');
    if (idx != -1) path = path.slice(0, idx);
    else path = '';
    return path;
}

function basename(path) {
    var idx = path.lastIndexOf('/');
    if (idx != -1) path = path.slice(idx + 1);
    return path;
}

var cache = {};

function load(filepath) {
    var cached = cache[filepath];
    if (cached) return cached.exports;
    var module = {'id':filepath, 'exports':{}};
    cache[filepath] = module;

    var content = data[filepath];
    if (Array.isArray(content)) content = data[content[0]];
    if (!content) throw 'Failed to load: ' + JSON.stringify(filepath);

    if (filepath.slice(-5) == '.json') { module.exports = JSON.parse(content); return module.exports; }

    var base = dirname(filepath);
    function mrequire(x) {
        return vrequire(x, base);
    }
    content = content.replace(/^\#\!.*/, '');
    var wrapped = '(function(exports, require, module, __filename, __dirname, create_rapydscript_compiler) { ';
    wrapped += content + '\n;})';
    try {
        vm.runInThisContext(wrapped, {'filename': filepath})(module.exports, mrequire, module, filepath, dirname(filepath), create_compiler);
    } catch (e) {
        console.error(e);
        delete cache[filepath];
        throw e;
    }
    return module.exports;
}

function has(x, y) { return Object.prototype.hasOwnProperty.call(x, y); }

function try_files(candidate) {
    if (has(data, candidate)) return candidate;
    if (has(data, candidate + '.js')) return candidate + '.js';
    if (has(data, candidate + '.json')) return candidate + '.json';
    return null;
}

function find_in_modules_dir(name, base) {
    var candidate = normalize(base + (base ? '/':'') + 'node_modules/' + name);
    var q = try_files(candidate);
    if (q) return q;

    var pj = candidate + '/package.json';
    if (has(data, pj)) {
        var ans = normalize(candidate + '/' + JSON.parse(data[pj]).main);
        if (has(data, ans)) return ans;
    }
    var index = candidate + '/index.js';
    if (has(data, index)) return index;

    var p = dirname(base);
    if (p) return find_in_modules_dir(name, p);
    return null;
}

function find_module(name, base) {
    if (name[0] == '/') throw 'Cannot find absolute module: ' + name;
    if (name.slice(0, 2) == './' || name.slice(0, 3) == '../') {
        var candidate = normalize((base ? base + '/' : base) + name);
        return try_files(candidate);
    }
    var q = try_files(name);
    if (q) return q;
    return find_in_modules_dir(name, base);
}

function vrequire(name, base) {
    var exports = {};
    var modpath = '';
    base = base || '';
    // console.log('vrequire', name, base);
    if (!name) throw new Error('Cannot load a module from an empty name');

    modpath = find_module(name, base);
    if (!modpath && name && './'.indexOf(name[0]) === -1) {
            try {
                return native_require(name);
            } catch (e) {}
        }

    if (!modpath) throw new Error("Failed to find module: " + JSON.stringify(name) + " with base: " + JSON.stringify(base));
    return load(modpath);
}

var UglifyJS = null, regenerator = null;
var crypto = null, fs = require('fs');

function uglify(x) {
    if (!UglifyJS) UglifyJS = vrequire("uglify-js");
    ans = UglifyJS.minify(x);
    if (ans.error) throw ans.error;
    return ans.code;
}

function regenerate(code, beautify) {
    var orig = fs.readFileSync;
    fs.readFileSync = function(name) { 
        if (!has(data, name)) {
            throw {message: "Failed to readfile from data: " + name};
        }
        return data[name]; 
    };
    if (!regenerator) regenerator = vrequire('regenerator');
    var ans;
    if (code) {
        try {
            ans = regenerator.compile(code).code;
        } catch (e) {
            console.error('regenerator failed for code: ' + code + 'with error stack:\n' + e.stack);
            throw e;
        }
        if (!beautify) ans = uglify(ans);
    } else {
        // Return the runtime
        ans = regenerator.compile('', {includeRuntime:true}).code;
        start = ans.indexOf('!');
        end = ans.lastIndexOf('})(');
        end = ans.lastIndexOf('})(', end - 1);
        ans = ans.slice(start + 1, end);
        if (!beautify) {
            var extra = '})()';
            ans = uglify(ans + extra).slice(0, extra.length);
        }
    }
    fs.readFileSync = orig;
    return ans;
}

if (typeof this != 'object' || typeof this.sha1sum !== 'function') {
    var sha1sum = function (data) { 
        if (!crypto) crypto = require('crypto');
        var h = crypto.createHash('sha1');
        h.update(data);
        return h.digest('hex');
    };
} else var sha1sum = this.sha1sum;

function create_compiler() {
    var compilerjs = data['compiler.js'];
    var module = {'id':'compiler', 'exports':{}};
    var wrapped = '(function(module, exports, readfile, writefile, sha1sum, regenerate) {' + data['compiler.js'] + ';\n})';
    vm.runInThisContext(wrapped, {'filename': 'compiler.js'})(module, module.exports, fs.readFileSync, fs.writeFileSync, sha1sum, regenerate);
    return module.exports;
}

var RapydScript = null;

function compile(code, filename, options) {
    if (!RapydScript) RapydScript = create_compiler();
    options = options || {};
    var ast = RapydScript.parse(code, {
        filename: filename || '<eval>',
        basedir: options.basedir || dirname(filename || ''),
        libdir: options.libdir,
    });
    var out_ops = {
        beautify: (options.beautify === undefined ? true : options.beautify),
        private_scope: !options.bare,
        omit_baselib: !!options.omit_baselib,
        js_version: options.js_version || 5,
    };
    if (!out_ops.omit_baselib) out_ops.baselib_plain = data['baselib-plain-' + (out_ops.beautify ? 'pretty' : 'ugly') + '.js'];
    var out = new RapydScript.OutputStream(out_ops);
    ast.print(out);
    return out.get();
}

function create_embedded_compiler(runjs) {
    var c = vrequire('tools/embedded_compiler.js');
    return c(create_compiler(), data['baselib-plain-pretty.js'], runjs);
}

function web_repl() {
    var repl = vrequire('tools/web_repl.js');
    return repl(create_compiler(), data['baselib-plain-pretty.js']);
}

function init_repl(options) {
    var repl = vrequire('tools/repl.js');
    options.baselib = data['baselib-plain-pretty.js'];
    return repl(options);
}

function gettext_parse(catalog, code, filename) {
    g = vrequire('tools/gettext.js');
    g.gettext(catalog, code, filename);
}

function gettext_output(catalog, options, write) {
    g = vrequire('tools/gettext.js');
    g.write_output(catalog, options, write);
}

function msgfmt(data, options) {
    m = vrequire('tools/msgfmt.js');
    return m.build(data, options);
}

function completer(compiler, options) {
    m = vrequire('tools/completer.js');
    return m(compiler, options);
}

if (typeof exports === 'object') {
    exports.compile = compile;
    exports.create_embedded_compiler = create_embedded_compiler;
    exports.web_repl = web_repl;
    exports.init_repl = init_repl;
    exports.gettext_parse = gettext_parse;
    exports.gettext_output = gettext_output;
    exports.msgfmt = msgfmt;
    exports.rs_version = rs_version;
    exports.file_data = data;
    exports.completer = completer;
    if (typeof rs_commit_sha === 'string') exports.rs_commit_sha = rs_commit_sha;
}
external_namespace.RapydScript = namespace;
})(this)
; (function () {
    "use strict";
    
// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
}

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this"

var keywords = {
  5: ecma5AndLessKeywords,
  6: ecma5AndLessKeywords + " const class extends export import super"
}

// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fd5\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ae\ua7b0-\ua7b7\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc"
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d4-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d01-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf8\u1cf9\u1dc0-\u1df5\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f"

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]")
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]")

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js
var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,17,26,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,26,45,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,785,52,76,44,33,24,27,35,42,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,25,391,63,32,0,449,56,264,8,2,36,18,0,50,29,881,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,881,68,12,0,67,12,65,0,32,6124,20,754,9486,1,3071,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,10591,541]
var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,1306,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,52,0,13,2,49,13,10,2,4,9,83,11,7,0,161,11,6,9,7,3,57,0,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,87,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,423,9,838,7,2,7,17,9,57,21,2,13,19882,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239]

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i]
    if (pos > code) return false
    pos += set[i + 1]
    if (pos >= code) return true
  }
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) return code === 36
  if (code < 91) return true
  if (code < 97) return code === 95
  if (code < 123) return true
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code))
  if (astral === false) return false
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) return code === 36
  if (code < 58) return true
  if (code < 65) return false
  if (code < 91) return true
  if (code < 97) return code === 95
  if (code < 123) return true
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code))
  if (astral === false) return false
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label
  this.keyword = conf.keyword
  this.beforeExpr = !!conf.beforeExpr
  this.startsExpr = !!conf.startsExpr
  this.isLoop = !!conf.isLoop
  this.isAssign = !!conf.isAssign
  this.prefix = !!conf.prefix
  this.postfix = !!conf.postfix
  this.binop = conf.binop || null
  this.updateContext = null
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true};
var startsExpr = {startsExpr: true};
// Map keyword names to token types.

var keywordTypes = {}

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name
  return keywordTypes[name] = new TokenType(name, options)
}

var tt = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("prefix", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=", 6),
  relational: binop("</>", 7),
  bitShift: binop("<</>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class"),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import"),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
}

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/
var lineBreakG = new RegExp(lineBreak.source, "g")

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]"
}

// Checks if an object has a property.

function has(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName)
}

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line
  this.column = col
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start
  this.end = end
  if (p.sourceFile !== null) this.source = p.sourceFile
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    lineBreakG.lastIndex = cur
    var match = lineBreakG.exec(input)
    if (match && match.index < offset) {
      ++line
      cur = match.index + match[0].length
    } else {
      return new Position(line, offset - cur)
    }
  }
}

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, 5, 6 (2015), 7 (2016), or 8 (2017). This influences support
  // for strict mode, the set of reserved words, and support for
  // new syntax features. The default is 7.
  ecmaVersion: 7,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
}

// Interpret and default an options object

function getOptions(opts) {
  var options = {}

  for (var opt in defaultOptions)
    options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]

  if (options.ecmaVersion >= 2015)
    options.ecmaVersion -= 2009

  if (options.allowReserved == null)
    options.allowReserved = options.ecmaVersion < 5

  if (isArray(options.onToken)) {
    var tokens = options.onToken
    options.onToken = function (token) { return tokens.push(token); }
  }
  if (isArray(options.onComment))
    options.onComment = pushComment(options, options.onComment)

  return options
}

function pushComment(options, array) {
  return function (block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? 'Block' : 'Line',
      value: text,
      start: start,
      end: end
    }
    if (options.locations)
      comment.loc = new SourceLocation(this, startLoc, endLoc)
    if (options.ranges)
      comment.range = [start, end]
    array.push(comment)
  }
}

// Registered plugins
var plugins = {}

function keywordRegexp(words) {
  return new RegExp("^(" + words.replace(/ /g, "|") + ")$")
}

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options)
  this.sourceFile = options.sourceFile
  this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5])
  var reserved = ""
  if (!options.allowReserved) {
    for (var v = options.ecmaVersion;; v--)
      if (reserved = reservedWords[v]) break
    if (options.sourceType == "module") reserved += " await"
  }
  this.reservedWords = keywordRegexp(reserved)
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict
  this.reservedWordsStrict = keywordRegexp(reservedStrict)
  this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords.strictBind)
  this.input = String(input)

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false

  // Load plugins
  this.loadPlugins(options.plugins)

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length
  } else {
    this.pos = this.lineStart = 0
    this.curLine = 1
  }

  // Properties of the current token:
  // Its type
  this.type = tt.eof
  // For tokens that include more information than their type, the value
  this.value = null
  // Its start and end offset
  this.start = this.end = this.pos
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition()

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null
  this.lastTokStart = this.lastTokEnd = this.pos

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext()
  this.exprAllowed = true

  // Figure out if it's a module code.
  this.strict = this.inModule = options.sourceType === "module"

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1

  // Flags to track whether we are in a function, a generator, an async function.
  this.inFunction = this.inGenerator = this.inAsync = false
  // Positions to delayed-check that yield/await does not exist in default parameters.
  this.yieldPos = this.awaitPos = 0
  // Labels in scope.
  this.labels = []

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!')
    this.skipLineComment(2)
};

// DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
Parser.prototype.isKeyword = function isKeyword (word) { return this.keywords.test(word) };
Parser.prototype.isReservedWord = function isReservedWord (word) { return this.reservedWords.test(word) };

Parser.prototype.extend = function extend (name, f) {
  this[name] = f(this[name])
};

Parser.prototype.loadPlugins = function loadPlugins (pluginConfigs) {
    var this$1 = this;

  for (var name in pluginConfigs) {
    var plugin = plugins[name]
    if (!plugin) throw new Error("Plugin '" + name + "' not found")
    plugin(this$1, pluginConfigs[name])
  }
};

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode()
  this.nextToken()
  return this.parseTopLevel(node)
};

var pp = Parser.prototype

// ## Parser utilities

// Test whether a statement node is the string literal `"use strict"`.

pp.isUseStrict = function(stmt) {
  return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" &&
    stmt.expression.type === "Literal" &&
    stmt.expression.raw.slice(1, -1) === "use strict"
}

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function(type) {
  if (this.type === type) {
    this.next()
    return true
  } else {
    return false
  }
}

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function(name) {
  return this.type === tt.name && this.value === name
}

// Consumes contextual keyword if possible.

pp.eatContextual = function(name) {
  return this.value === name && this.eat(tt.name)
}

// Asserts that following token is given contextual keyword.

pp.expectContextual = function(name) {
  if (!this.eatContextual(name)) this.unexpected()
}

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function() {
  return this.type === tt.eof ||
    this.type === tt.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
}

pp.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc)
    return true
  }
}

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function() {
  if (!this.eat(tt.semi) && !this.insertSemicolon()) this.unexpected()
}

pp.afterTrailingComma = function(tokType, notNext) {
  if (this.type == tokType) {
    if (this.options.onTrailingComma)
      this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc)
    if (!notNext)
      this.next()
    return true
  }
}

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function(type) {
  this.eat(type) || this.unexpected()
}

// Raise an unexpected token error.

pp.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token")
}

var DestructuringErrors = function DestructuringErrors() {
  this.shorthandAssign = 0
  this.trailingComma = 0
};

pp.checkPatternErrors = function(refDestructuringErrors, andThrow) {
  var trailing = refDestructuringErrors && refDestructuringErrors.trailingComma
  if (!andThrow) return !!trailing
  if (trailing) this.raise(trailing, "Comma is not permitted after the rest element")
}

pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  var pos = refDestructuringErrors && refDestructuringErrors.shorthandAssign
  if (!andThrow) return !!pos
  if (pos) this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns")
}

pp.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    this.raise(this.yieldPos, "Yield expression cannot be a default value")
  if (this.awaitPos)
    this.raise(this.awaitPos, "Await expression cannot be a default value")
}

var pp$1 = Parser.prototype

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$1.parseTopLevel = function(node) {
  var this$1 = this;

  var first = true, exports = {}
  if (!node.body) node.body = []
  while (this.type !== tt.eof) {
    var stmt = this$1.parseStatement(true, true, exports)
    node.body.push(stmt)
    if (first) {
      if (this$1.isUseStrict(stmt)) this$1.setStrict(true)
      first = false
    }
  }
  this.next()
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType
  }
  return this.finishNode(node, "Program")
}

var loopLabel = {kind: "loop"};
var switchLabel = {kind: "switch"};
pp$1.isLet = function() {
  if (this.type !== tt.name || this.options.ecmaVersion < 6 || this.value != "let") return false
  skipWhiteSpace.lastIndex = this.pos
  var skip = skipWhiteSpace.exec(this.input)
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next)
  if (nextCh === 91 || nextCh == 123) return true // '{' and '['
  if (isIdentifierStart(nextCh, true)) {
    for (var pos = next + 1; isIdentifierChar(this.input.charCodeAt(pos), true); ++pos) {}
    var ident = this.input.slice(next, pos)
    if (!this.isKeyword(ident)) return true
  }
  return false
}

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
pp$1.isAsyncFunction = function() {
  if (this.type !== tt.name || this.options.ecmaVersion < 8 || this.value != "async")
    return false

  skipWhiteSpace.lastIndex = this.pos
  var skip = skipWhiteSpace.exec(this.input)
  var next = this.pos + skip[0].length
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 == this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
}

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$1.parseStatement = function(declaration, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind

  if (this.isLet()) {
    starttype = tt._var
    kind = "let"
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case tt._break: case tt._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case tt._debugger: return this.parseDebuggerStatement(node)
  case tt._do: return this.parseDoStatement(node)
  case tt._for: return this.parseForStatement(node)
  case tt._function:
    if (!declaration && this.options.ecmaVersion >= 6) this.unexpected()
    return this.parseFunctionStatement(node, false)
  case tt._class:
    if (!declaration) this.unexpected()
    return this.parseClass(node, true)
  case tt._if: return this.parseIfStatement(node)
  case tt._return: return this.parseReturnStatement(node)
  case tt._switch: return this.parseSwitchStatement(node)
  case tt._throw: return this.parseThrowStatement(node)
  case tt._try: return this.parseTryStatement(node)
  case tt._const: case tt._var:
    kind = kind || this.value
    if (!declaration && kind != "var") this.unexpected()
    return this.parseVarStatement(node, kind)
  case tt._while: return this.parseWhileStatement(node)
  case tt._with: return this.parseWithStatement(node)
  case tt.braceL: return this.parseBlock()
  case tt.semi: return this.parseEmptyStatement(node)
  case tt._export:
  case tt._import:
    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        this.raise(this.start, "'import' and 'export' may only appear at the top level")
      if (!this.inModule)
        this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'")
    }
    return starttype === tt._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction() && declaration) {
      this.next()
      return this.parseFunctionStatement(node, true)
    }

    var maybeName = this.value, expr = this.parseExpression()
    if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon))
      return this.parseLabeledStatement(node, maybeName, expr)
    else return this.parseExpressionStatement(node, expr)
  }
}

pp$1.parseBreakContinueStatement = function(node, keyword) {
  var this$1 = this;

  var isBreak = keyword == "break"
  this.next()
  if (this.eat(tt.semi) || this.insertSemicolon()) node.label = null
  else if (this.type !== tt.name) this.unexpected()
  else {
    node.label = this.parseIdent()
    this.semicolon()
  }

  // Verify that there is an actual destination to break or
  // continue to.
  for (var i = 0; i < this.labels.length; ++i) {
    var lab = this$1.labels[i]
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) break
      if (node.label && isBreak) break
    }
  }
  if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword)
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
}

pp$1.parseDebuggerStatement = function(node) {
  this.next()
  this.semicolon()
  return this.finishNode(node, "DebuggerStatement")
}

pp$1.parseDoStatement = function(node) {
  this.next()
  this.labels.push(loopLabel)
  node.body = this.parseStatement(false)
  this.labels.pop()
  this.expect(tt._while)
  node.test = this.parseParenExpression()
  if (this.options.ecmaVersion >= 6)
    this.eat(tt.semi)
  else
    this.semicolon()
  return this.finishNode(node, "DoWhileStatement")
}

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$1.parseForStatement = function(node) {
  this.next()
  this.labels.push(loopLabel)
  this.expect(tt.parenL)
  if (this.type === tt.semi) return this.parseFor(node, null)
  var isLet = this.isLet()
  if (this.type === tt._var || this.type === tt._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value
    this.next()
    this.parseVar(init$1, true, kind)
    this.finishNode(init$1, "VariableDeclaration")
    if ((this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
        !(kind !== "var" && init$1.declarations[0].init))
      return this.parseForIn(node, init$1)
    return this.parseFor(node, init$1)
  }
  var refDestructuringErrors = new DestructuringErrors
  var init = this.parseExpression(true, refDestructuringErrors)
  if (this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    this.checkPatternErrors(refDestructuringErrors, true)
    this.toAssignable(init)
    this.checkLVal(init)
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true)
  }
  return this.parseFor(node, init)
}

pp$1.parseFunctionStatement = function(node, isAsync) {
  this.next()
  return this.parseFunction(node, true, false, isAsync)
}

pp$1.isFunction = function() {
  return this.type === tt._function || this.isAsyncFunction()
}

pp$1.parseIfStatement = function(node) {
  this.next()
  node.test = this.parseParenExpression()
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement(!this.strict && this.isFunction())
  node.alternate = this.eat(tt._else) ? this.parseStatement(!this.strict && this.isFunction()) : null
  return this.finishNode(node, "IfStatement")
}

pp$1.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    this.raise(this.start, "'return' outside of function")
  this.next()

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(tt.semi) || this.insertSemicolon()) node.argument = null
  else { node.argument = this.parseExpression(); this.semicolon() }
  return this.finishNode(node, "ReturnStatement")
}

pp$1.parseSwitchStatement = function(node) {
  var this$1 = this;

  this.next()
  node.discriminant = this.parseParenExpression()
  node.cases = []
  this.expect(tt.braceL)
  this.labels.push(switchLabel)

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  for (var cur, sawDefault = false; this.type != tt.braceR;) {
    if (this$1.type === tt._case || this$1.type === tt._default) {
      var isCase = this$1.type === tt._case
      if (cur) this$1.finishNode(cur, "SwitchCase")
      node.cases.push(cur = this$1.startNode())
      cur.consequent = []
      this$1.next()
      if (isCase) {
        cur.test = this$1.parseExpression()
      } else {
        if (sawDefault) this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses")
        sawDefault = true
        cur.test = null
      }
      this$1.expect(tt.colon)
    } else {
      if (!cur) this$1.unexpected()
      cur.consequent.push(this$1.parseStatement(true))
    }
  }
  if (cur) this.finishNode(cur, "SwitchCase")
  this.next() // Closing brace
  this.labels.pop()
  return this.finishNode(node, "SwitchStatement")
}

pp$1.parseThrowStatement = function(node) {
  this.next()
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    this.raise(this.lastTokEnd, "Illegal newline after throw")
  node.argument = this.parseExpression()
  this.semicolon()
  return this.finishNode(node, "ThrowStatement")
}

// Reused empty array added for node fields that are always empty.

var empty = []

pp$1.parseTryStatement = function(node) {
  this.next()
  node.block = this.parseBlock()
  node.handler = null
  if (this.type === tt._catch) {
    var clause = this.startNode()
    this.next()
    this.expect(tt.parenL)
    clause.param = this.parseBindingAtom()
    this.checkLVal(clause.param, true)
    this.expect(tt.parenR)
    clause.body = this.parseBlock()
    node.handler = this.finishNode(clause, "CatchClause")
  }
  node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null
  if (!node.handler && !node.finalizer)
    this.raise(node.start, "Missing catch or finally clause")
  return this.finishNode(node, "TryStatement")
}

pp$1.parseVarStatement = function(node, kind) {
  this.next()
  this.parseVar(node, false, kind)
  this.semicolon()
  return this.finishNode(node, "VariableDeclaration")
}

pp$1.parseWhileStatement = function(node) {
  this.next()
  node.test = this.parseParenExpression()
  this.labels.push(loopLabel)
  node.body = this.parseStatement(false)
  this.labels.pop()
  return this.finishNode(node, "WhileStatement")
}

pp$1.parseWithStatement = function(node) {
  if (this.strict) this.raise(this.start, "'with' in strict mode")
  this.next()
  node.object = this.parseParenExpression()
  node.body = this.parseStatement(false)
  return this.finishNode(node, "WithStatement")
}

pp$1.parseEmptyStatement = function(node) {
  this.next()
  return this.finishNode(node, "EmptyStatement")
}

pp$1.parseLabeledStatement = function(node, maybeName, expr) {
  var this$1 = this;

  for (var i = 0; i < this.labels.length; ++i)
    if (this$1.labels[i].name === maybeName) this$1.raise(expr.start, "Label '" + maybeName + "' is already declared")
  var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null
  for (var i$1 = this.labels.length - 1; i$1 >= 0; i$1--) {
    var label = this$1.labels[i$1]
    if (label.statementStart == node.start) {
      label.statementStart = this$1.start
      label.kind = kind
    } else break
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start})
  node.body = this.parseStatement(true)
  this.labels.pop()
  node.label = expr
  return this.finishNode(node, "LabeledStatement")
}

pp$1.parseExpressionStatement = function(node, expr) {
  node.expression = expr
  this.semicolon()
  return this.finishNode(node, "ExpressionStatement")
}

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$1.parseBlock = function(allowStrict) {
  var this$1 = this;

  var node = this.startNode(), first = true, oldStrict
  node.body = []
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    var stmt = this$1.parseStatement(true)
    node.body.push(stmt)
    if (first && allowStrict && this$1.isUseStrict(stmt)) {
      oldStrict = this$1.strict
      this$1.setStrict(this$1.strict = true)
    }
    first = false
  }
  if (oldStrict === false) this.setStrict(false)
  return this.finishNode(node, "BlockStatement")
}

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$1.parseFor = function(node, init) {
  node.init = init
  this.expect(tt.semi)
  node.test = this.type === tt.semi ? null : this.parseExpression()
  this.expect(tt.semi)
  node.update = this.type === tt.parenR ? null : this.parseExpression()
  this.expect(tt.parenR)
  node.body = this.parseStatement(false)
  this.labels.pop()
  return this.finishNode(node, "ForStatement")
}

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$1.parseForIn = function(node, init) {
  var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement"
  this.next()
  node.left = init
  node.right = this.parseExpression()
  this.expect(tt.parenR)
  node.body = this.parseStatement(false)
  this.labels.pop()
  return this.finishNode(node, type)
}

// Parse a list of variable declarations.

pp$1.parseVar = function(node, isFor, kind) {
  var this$1 = this;

  node.declarations = []
  node.kind = kind
  for (;;) {
    var decl = this$1.startNode()
    this$1.parseVarId(decl)
    if (this$1.eat(tt.eq)) {
      decl.init = this$1.parseMaybeAssign(isFor)
    } else if (kind === "const" && !(this$1.type === tt._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
      this$1.unexpected()
    } else if (decl.id.type != "Identifier" && !(isFor && (this$1.type === tt._in || this$1.isContextual("of")))) {
      this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value")
    } else {
      decl.init = null
    }
    node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"))
    if (!this$1.eat(tt.comma)) break
  }
  return node
}

pp$1.parseVarId = function(decl) {
  decl.id = this.parseBindingAtom()
  this.checkLVal(decl.id, true)
}

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseFunction = function(node, isStatement, allowExpressionBody, isAsync) {
  this.initFunction(node)
  if (this.options.ecmaVersion >= 6 && !isAsync)
    node.generator = this.eat(tt.star)
  if (this.options.ecmaVersion >= 8)
    node.async = !!isAsync

  if (isStatement)
    node.id = this.parseIdent()

  var oldInGen = this.inGenerator, oldInAsync = this.inAsync, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos
  this.inGenerator = node.generator
  this.inAsync = node.async
  this.yieldPos = 0
  this.awaitPos = 0

  if (!isStatement && this.type === tt.name)
    node.id = this.parseIdent()
  this.parseFunctionParams(node)
  this.parseFunctionBody(node, allowExpressionBody)

  this.inGenerator = oldInGen
  this.inAsync = oldInAsync
  this.yieldPos = oldYieldPos
  this.awaitPos = oldAwaitPos
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression")
}

pp$1.parseFunctionParams = function(node) {
  this.expect(tt.parenL)
  node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8, true)
  this.checkYieldAwaitInDefaultParams()
}

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseClass = function(node, isStatement) {
  var this$1 = this;

  this.next()
  this.parseClassId(node, isStatement)
  this.parseClassSuper(node)
  var classBody = this.startNode()
  var hadConstructor = false
  classBody.body = []
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (this$1.eat(tt.semi)) continue
    var method = this$1.startNode()
    var isGenerator = this$1.eat(tt.star)
    var isAsync = false
    var isMaybeStatic = this$1.type === tt.name && this$1.value === "static"
    this$1.parsePropertyName(method)
    method.static = isMaybeStatic && this$1.type !== tt.parenL
    if (method.static) {
      if (isGenerator) this$1.unexpected()
      isGenerator = this$1.eat(tt.star)
      this$1.parsePropertyName(method)
    }
    if (this$1.options.ecmaVersion >= 8 && !isGenerator && !method.computed &&
        method.key.type === "Identifier" && method.key.name === "async" && this$1.type !== tt.parenL &&
        !this$1.canInsertSemicolon()) {
      isAsync = true
      this$1.parsePropertyName(method)
    }
    method.kind = "method"
    var isGetSet = false
    if (!method.computed) {
      var key = method.key;
      if (!isGenerator && !isAsync && key.type === "Identifier" && this$1.type !== tt.parenL && (key.name === "get" || key.name === "set")) {
        isGetSet = true
        method.kind = key.name
        key = this$1.parsePropertyName(method)
      }
      if (!method.static && (key.type === "Identifier" && key.name === "constructor" ||
          key.type === "Literal" && key.value === "constructor")) {
        if (hadConstructor) this$1.raise(key.start, "Duplicate constructor in the same class")
        if (isGetSet) this$1.raise(key.start, "Constructor can't have get/set modifier")
        if (isGenerator) this$1.raise(key.start, "Constructor can't be a generator")
        if (isAsync) this$1.raise(key.start, "Constructor can't be an async method")
        method.kind = "constructor"
        hadConstructor = true
      }
    }
    this$1.parseClassMethod(classBody, method, isGenerator, isAsync)
    if (isGetSet) {
      var paramCount = method.kind === "get" ? 0 : 1
      if (method.value.params.length !== paramCount) {
        var start = method.value.start
        if (method.kind === "get")
          this$1.raiseRecoverable(start, "getter should have no params")
        else
          this$1.raiseRecoverable(start, "setter should have exactly one param")
      } else {
        if (method.kind === "set" && method.value.params[0].type === "RestElement")
          this$1.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params")
      }
    }
  }
  node.body = this.finishNode(classBody, "ClassBody")
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
}

pp$1.parseClassMethod = function(classBody, method, isGenerator, isAsync) {
  method.value = this.parseMethod(isGenerator, isAsync)
  classBody.body.push(this.finishNode(method, "MethodDefinition"))
}

pp$1.parseClassId = function(node, isStatement) {
  node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null
}

pp$1.parseClassSuper = function(node) {
  node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null
}

// Parses module export declaration.

pp$1.parseExport = function(node, exports) {
  var this$1 = this;

  this.next()
  // export * from '...'
  if (this.eat(tt.star)) {
    this.expectContextual("from")
    node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected()
    this.semicolon()
    return this.finishNode(node, "ExportAllDeclaration")
  }
  if (this.eat(tt._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart)
    var parens = this.type == tt.parenL
    var expr = this.parseMaybeAssign()
    var needsSemi = true
    if (!parens && (expr.type == "FunctionExpression" ||
                    expr.type == "ClassExpression")) {
      needsSemi = false
      if (expr.id) {
        expr.type = expr.type == "FunctionExpression"
          ? "FunctionDeclaration"
          : "ClassDeclaration"
      }
    }
    node.declaration = expr
    if (needsSemi) this.semicolon()
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true)
    if (node.declaration.type === "VariableDeclaration")
      this.checkVariableExport(exports, node.declaration.declarations)
    else
      this.checkExport(exports, node.declaration.id.name, node.declaration.id.start)
    node.specifiers = []
    node.source = null
  } else { // export { x, y as z } [from '...']
    node.declaration = null
    node.specifiers = this.parseExportSpecifiers(exports)
    if (this.eatContextual("from")) {
      node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected()
    } else {
      // check for keywords used as local names
      for (var i = 0; i < node.specifiers.length; i++) {
        if (this$1.keywords.test(node.specifiers[i].local.name) || this$1.reservedWords.test(node.specifiers[i].local.name)) {
          this$1.unexpected(node.specifiers[i].local.start)
        }
      }

      node.source = null
    }
    this.semicolon()
  }
  return this.finishNode(node, "ExportNamedDeclaration")
}

pp$1.checkExport = function(exports, name, pos) {
  if (!exports) return
  if (Object.prototype.hasOwnProperty.call(exports, name))
    this.raiseRecoverable(pos, "Duplicate export '" + name + "'")
  exports[name] = true
}

pp$1.checkPatternExport = function(exports, pat) {
  var this$1 = this;

  var type = pat.type
  if (type == "Identifier")
    this.checkExport(exports, pat.name, pat.start)
  else if (type == "ObjectPattern")
    for (var i = 0; i < pat.properties.length; ++i)
      this$1.checkPatternExport(exports, pat.properties[i].value)
  else if (type == "ArrayPattern")
    for (var i$1 = 0; i$1 < pat.elements.length; ++i$1) {
      var elt = pat.elements[i$1]
      if (elt) this$1.checkPatternExport(exports, elt)
    }
  else if (type == "AssignmentPattern")
    this.checkPatternExport(exports, pat.left)
  else if (type == "ParenthesizedExpression")
    this.checkPatternExport(exports, pat.expression)
}

pp$1.checkVariableExport = function(exports, decls) {
  var this$1 = this;

  if (!exports) return
  for (var i = 0; i < decls.length; i++)
    this$1.checkPatternExport(exports, decls[i].id)
}

pp$1.shouldParseExportStatement = function() {
  return this.type.keyword || this.isLet() || this.isAsyncFunction()
}

// Parses a comma-separated list of module exports.

pp$1.parseExportSpecifiers = function(exports) {
  var this$1 = this;

  var nodes = [], first = true
  // export { x, y as z } [from '...']
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (this$1.afterTrailingComma(tt.braceR)) break
    } else first = false

    var node = this$1.startNode()
    node.local = this$1.parseIdent(this$1.type === tt._default)
    node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local
    this$1.checkExport(exports, node.exported.name, node.exported.start)
    nodes.push(this$1.finishNode(node, "ExportSpecifier"))
  }
  return nodes
}

// Parses import declaration.

pp$1.parseImport = function(node) {
  this.next()
  // import '...'
  if (this.type === tt.string) {
    node.specifiers = empty
    node.source = this.parseExprAtom()
  } else {
    node.specifiers = this.parseImportSpecifiers()
    this.expectContextual("from")
    node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected()
  }
  this.semicolon()
  return this.finishNode(node, "ImportDeclaration")
}

// Parses a comma-separated list of module imports.

pp$1.parseImportSpecifiers = function() {
  var this$1 = this;

  var nodes = [], first = true
  if (this.type === tt.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode()
    node.local = this.parseIdent()
    this.checkLVal(node.local, true)
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"))
    if (!this.eat(tt.comma)) return nodes
  }
  if (this.type === tt.star) {
    var node$1 = this.startNode()
    this.next()
    this.expectContextual("as")
    node$1.local = this.parseIdent()
    this.checkLVal(node$1.local, true)
    nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"))
    return nodes
  }
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (this$1.afterTrailingComma(tt.braceR)) break
    } else first = false

    var node$2 = this$1.startNode()
    node$2.imported = this$1.parseIdent(true)
    if (this$1.eatContextual("as")) {
      node$2.local = this$1.parseIdent()
    } else {
      node$2.local = node$2.imported
      if (this$1.isKeyword(node$2.local.name)) this$1.unexpected(node$2.local.start)
      if (this$1.reservedWordsStrict.test(node$2.local.name)) this$1.raiseRecoverable(node$2.local.start, "The keyword '" + node$2.local.name + "' is reserved")
    }
    this$1.checkLVal(node$2.local, true)
    nodes.push(this$1.finishNode(node$2, "ImportSpecifier"))
  }
  return nodes
}

var pp$2 = Parser.prototype

// Convert existing expression atom to assignable pattern
// if possible.

pp$2.toAssignable = function(node, isBinding) {
  var this$1 = this;

  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
      if (this.inAsync && node.name === "await")
        this.raise(node.start, "Can not use 'await' as identifier inside an async function")
      break

    case "ObjectPattern":
    case "ArrayPattern":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern"
      for (var i = 0; i < node.properties.length; i++) {
        var prop = node.properties[i]
        if (prop.kind !== "init") this$1.raise(prop.key.start, "Object pattern can't contain getter or setter")
        this$1.toAssignable(prop.value, isBinding)
      }
      break

    case "ArrayExpression":
      node.type = "ArrayPattern"
      this.toAssignableList(node.elements, isBinding)
      break

    case "AssignmentExpression":
      if (node.operator === "=") {
        node.type = "AssignmentPattern"
        delete node.operator
        this.toAssignable(node.left, isBinding)
        // falls through to AssignmentPattern
      } else {
        this.raise(node.left.end, "Only '=' operator can be used for specifying default value.")
        break
      }

    case "AssignmentPattern":
      break

    case "ParenthesizedExpression":
      node.expression = this.toAssignable(node.expression, isBinding)
      break

    case "MemberExpression":
      if (!isBinding) break

    default:
      this.raise(node.start, "Assigning to rvalue")
    }
  }
  return node
}

// Convert list of expression atoms to binding list.

pp$2.toAssignableList = function(exprList, isBinding) {
  var this$1 = this;

  var end = exprList.length
  if (end) {
    var last = exprList[end - 1]
    if (last && last.type == "RestElement") {
      --end
    } else if (last && last.type == "SpreadElement") {
      last.type = "RestElement"
      var arg = last.argument
      this.toAssignable(arg, isBinding)
      if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern")
        this.unexpected(arg.start)
      --end
    }

    if (isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      this.unexpected(last.argument.start)
  }
  for (var i = 0; i < end; i++) {
    var elt = exprList[i]
    if (elt) this$1.toAssignable(elt, isBinding)
  }
  return exprList
}

// Parses spread element.

pp$2.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode()
  this.next()
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors)
  return this.finishNode(node, "SpreadElement")
}

pp$2.parseRest = function(allowNonIdent) {
  var node = this.startNode()
  this.next()

  // RestElement inside of a function parameter must be an identifier
  if (allowNonIdent) node.argument = this.type === tt.name ? this.parseIdent() : this.unexpected()
  else node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected()

  return this.finishNode(node, "RestElement")
}

// Parses lvalue (assignable) atom.

pp$2.parseBindingAtom = function() {
  if (this.options.ecmaVersion < 6) return this.parseIdent()
  switch (this.type) {
  case tt.name:
    return this.parseIdent()

  case tt.bracketL:
    var node = this.startNode()
    this.next()
    node.elements = this.parseBindingList(tt.bracketR, true, true)
    return this.finishNode(node, "ArrayPattern")

  case tt.braceL:
    return this.parseObj(true)

  default:
    this.unexpected()
  }
}

pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowNonIdent) {
  var this$1 = this;

  var elts = [], first = true
  while (!this.eat(close)) {
    if (first) first = false
    else this$1.expect(tt.comma)
    if (allowEmpty && this$1.type === tt.comma) {
      elts.push(null)
    } else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
      break
    } else if (this$1.type === tt.ellipsis) {
      var rest = this$1.parseRest(allowNonIdent)
      this$1.parseBindingListItem(rest)
      elts.push(rest)
      if (this$1.type === tt.comma) this$1.raise(this$1.start, "Comma is not permitted after the rest element")
      this$1.expect(close)
      break
    } else {
      var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc)
      this$1.parseBindingListItem(elem)
      elts.push(elem)
    }
  }
  return elts
}

pp$2.parseBindingListItem = function(param) {
  return param
}

// Parses assignment pattern around given atom if possible.

pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom()
  if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) return left
  var node = this.startNodeAt(startPos, startLoc)
  node.left = left
  node.right = this.parseMaybeAssign()
  return this.finishNode(node, "AssignmentPattern")
}

// Verify that a node is an lval — something that can be assigned
// to.

pp$2.checkLVal = function(expr, isBinding, checkClashes) {
  var this$1 = this;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      this.raiseRecoverable(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode")
    if (checkClashes) {
      if (has(checkClashes, expr.name))
        this.raiseRecoverable(expr.start, "Argument name clash")
      checkClashes[expr.name] = true
    }
    break

  case "MemberExpression":
    if (isBinding) this.raiseRecoverable(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression")
    break

  case "ObjectPattern":
    for (var i = 0; i < expr.properties.length; i++)
      this$1.checkLVal(expr.properties[i].value, isBinding, checkClashes)
    break

  case "ArrayPattern":
    for (var i$1 = 0; i$1 < expr.elements.length; i$1++) {
      var elem = expr.elements[i$1]
      if (elem) this$1.checkLVal(elem, isBinding, checkClashes)
    }
    break

  case "AssignmentPattern":
    this.checkLVal(expr.left, isBinding, checkClashes)
    break

  case "RestElement":
    this.checkLVal(expr.argument, isBinding, checkClashes)
    break

  case "ParenthesizedExpression":
    this.checkLVal(expr.expression, isBinding, checkClashes)
    break

  default:
    this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue")
  }
}

var pp$3 = Parser.prototype

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$3.checkPropClash = function(prop, propHash) {
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    return
  var key = prop.key;
  var name
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) this.raiseRecoverable(key.start, "Redefinition of __proto__ property")
      propHash.proto = true
    }
    return
  }
  name = "$" + name
  var other = propHash[name]
  if (other) {
    var isGetSet = kind !== "init"
    if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
      this.raiseRecoverable(key.start, "Redefinition of property")
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    }
  }
  other[kind] = true
}

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$3.parseExpression = function(noIn, refDestructuringErrors) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors)
  if (this.type === tt.comma) {
    var node = this.startNodeAt(startPos, startLoc)
    node.expressions = [expr]
    while (this.eat(tt.comma)) node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors))
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
}

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
  if (this.inGenerator && this.isContextual("yield")) return this.parseYield()

  var ownDestructuringErrors = false
  if (!refDestructuringErrors) {
    refDestructuringErrors = new DestructuringErrors
    ownDestructuringErrors = true
  }
  var startPos = this.start, startLoc = this.startLoc
  if (this.type == tt.parenL || this.type == tt.name)
    this.potentialArrowAt = this.start
  var left = this.parseMaybeConditional(noIn, refDestructuringErrors)
  if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc)
  if (this.type.isAssign) {
    this.checkPatternErrors(refDestructuringErrors, true)
    if (!ownDestructuringErrors) DestructuringErrors.call(refDestructuringErrors)
    var node = this.startNodeAt(startPos, startLoc)
    node.operator = this.value
    node.left = this.type === tt.eq ? this.toAssignable(left) : left
    refDestructuringErrors.shorthandAssign = 0 // reset because shorthand default was used correctly
    this.checkLVal(left)
    this.next()
    node.right = this.parseMaybeAssign(noIn)
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true)
  }
  return left
}

// Parse a ternary conditional (`?:`) operator.

pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseExprOps(noIn, refDestructuringErrors)
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr
  if (this.eat(tt.question)) {
    var node = this.startNodeAt(startPos, startLoc)
    node.test = expr
    node.consequent = this.parseMaybeAssign()
    this.expect(tt.colon)
    node.alternate = this.parseMaybeAssign(noIn)
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
}

// Start the precedence parser.

pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseMaybeUnary(refDestructuringErrors, false)
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr
  return this.parseExprOp(expr, startPos, startLoc, -1, noIn)
}

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop
  if (prec != null && (!noIn || this.type !== tt._in)) {
    if (prec > minPrec) {
      var logical = this.type === tt.logicalOR || this.type === tt.logicalAND
      var op = this.value
      this.next()
      var startPos = this.start, startLoc = this.startLoc
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn)
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical)
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
    }
  }
  return left
}

pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  var node = this.startNodeAt(startPos, startLoc)
  node.left = left
  node.operator = op
  node.right = right
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
}

// Parse unary operators, both prefix and postfix.

pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, expr
  if (this.inAsync && this.isContextual("await")) {
    expr = this.parseAwait(refDestructuringErrors)
    sawUnary = true
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === tt.incDec
    node.operator = this.value
    node.prefix = true
    this.next()
    node.argument = this.parseMaybeUnary(null, true)
    this.checkExpressionErrors(refDestructuringErrors, true)
    if (update) this.checkLVal(node.argument)
    else if (this.strict && node.operator === "delete" &&
             node.argument.type === "Identifier")
      this.raiseRecoverable(node.start, "Deleting local variable in strict mode")
    else sawUnary = true
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression")
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors)
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this$1.startNodeAt(startPos, startLoc)
      node$1.operator = this$1.value
      node$1.prefix = false
      node$1.argument = expr
      this$1.checkLVal(expr)
      this$1.next()
      expr = this$1.finishNode(node$1, "UpdateExpression")
    }
  }

  if (!sawUnary && this.eat(tt.starstar))
    return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false)
  else
    return expr
}

// Parse call, dot, and `[]`-subscript expressions.

pp$3.parseExprSubscripts = function(refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseExprAtom(refDestructuringErrors)
  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")"
  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) return expr
  return this.parseSubscripts(expr, startPos, startLoc)
}

pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
  var this$1 = this;

  for (;;) {
    var maybeAsyncArrow = this$1.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && !this$1.canInsertSemicolon()
    if (this$1.eat(tt.dot)) {
      var node = this$1.startNodeAt(startPos, startLoc)
      node.object = base
      node.property = this$1.parseIdent(true)
      node.computed = false
      base = this$1.finishNode(node, "MemberExpression")
    } else if (this$1.eat(tt.bracketL)) {
      var node$1 = this$1.startNodeAt(startPos, startLoc)
      node$1.object = base
      node$1.property = this$1.parseExpression()
      node$1.computed = true
      this$1.expect(tt.bracketR)
      base = this$1.finishNode(node$1, "MemberExpression")
    } else if (!noCalls && this$1.eat(tt.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this$1.yieldPos, oldAwaitPos = this$1.awaitPos
      this$1.yieldPos = 0
      this$1.awaitPos = 0
      var exprList = this$1.parseExprList(tt.parenR, this$1.options.ecmaVersion >= 8, false, refDestructuringErrors)
      if (maybeAsyncArrow && !this$1.canInsertSemicolon() && this$1.eat(tt.arrow)) {
        this$1.checkPatternErrors(refDestructuringErrors, true)
        this$1.checkYieldAwaitInDefaultParams()
        this$1.yieldPos = oldYieldPos
        this$1.awaitPos = oldAwaitPos
        return this$1.parseArrowExpression(this$1.startNodeAt(startPos, startLoc), exprList, true)
      }
      this$1.checkExpressionErrors(refDestructuringErrors, true)
      this$1.yieldPos = oldYieldPos || this$1.yieldPos
      this$1.awaitPos = oldAwaitPos || this$1.awaitPos
      var node$2 = this$1.startNodeAt(startPos, startLoc)
      node$2.callee = base
      node$2.arguments = exprList
      base = this$1.finishNode(node$2, "CallExpression")
    } else if (this$1.type === tt.backQuote) {
      var node$3 = this$1.startNodeAt(startPos, startLoc)
      node$3.tag = base
      node$3.quasi = this$1.parseTemplate()
      base = this$1.finishNode(node$3, "TaggedTemplateExpression")
    } else {
      return base
    }
  }
}

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$3.parseExprAtom = function(refDestructuringErrors) {
  var node, canBeArrow = this.potentialArrowAt == this.start
  switch (this.type) {
  case tt._super:
    if (!this.inFunction)
      this.raise(this.start, "'super' outside of function or class")

  case tt._this:
    var type = this.type === tt._this ? "ThisExpression" : "Super"
    node = this.startNode()
    this.next()
    return this.finishNode(node, type)

  case tt.name:
    var startPos = this.start, startLoc = this.startLoc
    var id = this.parseIdent(this.type !== tt.name)
    if (this.options.ecmaVersion >= 8 && id.name === "async" && !this.canInsertSemicolon() && this.eat(tt._function))
      return this.parseFunction(this.startNodeAt(startPos, startLoc), false, false, true)
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(tt.arrow))
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false)
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === tt.name) {
        id = this.parseIdent()
        if (this.canInsertSemicolon() || !this.eat(tt.arrow))
          this.unexpected()
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
      }
    }
    return id

  case tt.regexp:
    var value = this.value
    node = this.parseLiteral(value.value)
    node.regex = {pattern: value.pattern, flags: value.flags}
    return node

  case tt.num: case tt.string:
    return this.parseLiteral(this.value)

  case tt._null: case tt._true: case tt._false:
    node = this.startNode()
    node.value = this.type === tt._null ? null : this.type === tt._true
    node.raw = this.type.keyword
    this.next()
    return this.finishNode(node, "Literal")

  case tt.parenL:
    return this.parseParenAndDistinguishExpression(canBeArrow)

  case tt.bracketL:
    node = this.startNode()
    this.next()
    node.elements = this.parseExprList(tt.bracketR, true, true, refDestructuringErrors)
    return this.finishNode(node, "ArrayExpression")

  case tt.braceL:
    return this.parseObj(false, refDestructuringErrors)

  case tt._function:
    node = this.startNode()
    this.next()
    return this.parseFunction(node, false)

  case tt._class:
    return this.parseClass(this.startNode(), false)

  case tt._new:
    return this.parseNew()

  case tt.backQuote:
    return this.parseTemplate()

  default:
    this.unexpected()
  }
}

pp$3.parseLiteral = function(value) {
  var node = this.startNode()
  node.value = value
  node.raw = this.input.slice(this.start, this.end)
  this.next()
  return this.finishNode(node, "Literal")
}

pp$3.parseParenExpression = function() {
  this.expect(tt.parenL)
  var val = this.parseExpression()
  this.expect(tt.parenR)
  return val
}

pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8
  if (this.options.ecmaVersion >= 6) {
    this.next()

    var innerStartPos = this.start, innerStartLoc = this.startLoc
    var exprList = [], first = true, lastIsComma = false
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart, innerParenStart
    this.yieldPos = 0
    this.awaitPos = 0
    while (this.type !== tt.parenR) {
      first ? first = false : this$1.expect(tt.comma)
      if (allowTrailingComma && this$1.afterTrailingComma(tt.parenR, true)) {
        lastIsComma = true
        break
      } else if (this$1.type === tt.ellipsis) {
        spreadStart = this$1.start
        exprList.push(this$1.parseParenItem(this$1.parseRest()))
        if (this$1.type === tt.comma) this$1.raise(this$1.start, "Comma is not permitted after the rest element")
        break
      } else {
        if (this$1.type === tt.parenL && !innerParenStart) {
          innerParenStart = this$1.start
        }
        exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem))
      }
    }
    var innerEndPos = this.start, innerEndLoc = this.startLoc
    this.expect(tt.parenR)

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, true)
      this.checkYieldAwaitInDefaultParams()
      if (innerParenStart) this.unexpected(innerParenStart)
      this.yieldPos = oldYieldPos
      this.awaitPos = oldAwaitPos
      return this.parseParenArrowList(startPos, startLoc, exprList)
    }

    if (!exprList.length || lastIsComma) this.unexpected(this.lastTokStart)
    if (spreadStart) this.unexpected(spreadStart)
    this.checkExpressionErrors(refDestructuringErrors, true)
    this.yieldPos = oldYieldPos || this.yieldPos
    this.awaitPos = oldAwaitPos || this.awaitPos

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc)
      val.expressions = exprList
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc)
    } else {
      val = exprList[0]
    }
  } else {
    val = this.parseParenExpression()
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc)
    par.expression = val
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
}

pp$3.parseParenItem = function(item) {
  return item
}

pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
}

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty$1 = []

pp$3.parseNew = function() {
  var node = this.startNode()
  var meta = this.parseIdent(true)
  if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
    node.meta = meta
    node.property = this.parseIdent(true)
    if (node.property.name !== "target")
      this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target")
    if (!this.inFunction)
      this.raiseRecoverable(node.start, "new.target can only be used in functions")
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true)
  if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, this.options.ecmaVersion >= 8, false)
  else node.arguments = empty$1
  return this.finishNode(node, "NewExpression")
}

// Parse template expression.

pp$3.parseTemplateElement = function() {
  var elem = this.startNode()
  elem.value = {
    raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
    cooked: this.value
  }
  this.next()
  elem.tail = this.type === tt.backQuote
  return this.finishNode(elem, "TemplateElement")
}

pp$3.parseTemplate = function() {
  var this$1 = this;

  var node = this.startNode()
  this.next()
  node.expressions = []
  var curElt = this.parseTemplateElement()
  node.quasis = [curElt]
  while (!curElt.tail) {
    this$1.expect(tt.dollarBraceL)
    node.expressions.push(this$1.parseExpression())
    this$1.expect(tt.braceR)
    node.quasis.push(curElt = this$1.parseTemplateElement())
  }
  this.next()
  return this.finishNode(node, "TemplateLiteral")
}

// Parse an object literal or binding pattern.

pp$3.parseObj = function(isPattern, refDestructuringErrors) {
  var this$1 = this;

  var node = this.startNode(), first = true, propHash = {}
  node.properties = []
  this.next()
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (this$1.afterTrailingComma(tt.braceR)) break
    } else first = false

    var prop = this$1.startNode(), isGenerator, isAsync, startPos, startLoc
    if (this$1.options.ecmaVersion >= 6) {
      prop.method = false
      prop.shorthand = false
      if (isPattern || refDestructuringErrors) {
        startPos = this$1.start
        startLoc = this$1.startLoc
      }
      if (!isPattern)
        isGenerator = this$1.eat(tt.star)
    }
    this$1.parsePropertyName(prop)
    if (!isPattern && this$1.options.ecmaVersion >= 8 && !isGenerator && !prop.computed &&
        prop.key.type === "Identifier" && prop.key.name === "async" && this$1.type !== tt.parenL &&
        this$1.type !== tt.colon && !this$1.canInsertSemicolon()) {
      isAsync = true
      this$1.parsePropertyName(prop, refDestructuringErrors)
    } else {
      isAsync = false
    }
    this$1.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors)
    this$1.checkPropClash(prop, propHash)
    node.properties.push(this$1.finishNode(prop, "Property"))
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
}

pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors) {
  if ((isGenerator || isAsync) && this.type === tt.colon)
    this.unexpected()

  if (this.eat(tt.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors)
    prop.kind = "init"
  } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
    if (isPattern) this.unexpected()
    prop.kind = "init"
    prop.method = true
    prop.value = this.parseMethod(isGenerator, isAsync)
  } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type != tt.comma && this.type != tt.braceR)) {
    if (isGenerator || isAsync || isPattern) this.unexpected()
    prop.kind = prop.key.name
    this.parsePropertyName(prop)
    prop.value = this.parseMethod(false)
    var paramCount = prop.kind === "get" ? 0 : 1
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start
      if (prop.kind === "get")
        this.raiseRecoverable(start, "getter should have no params")
      else
        this.raiseRecoverable(start, "setter should have exactly one param")
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params")
    }
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (this.keywords.test(prop.key.name) ||
        (this.strict ? this.reservedWordsStrict : this.reservedWords).test(prop.key.name) ||
        (this.inGenerator && prop.key.name == "yield") ||
        (this.inAsync && prop.key.name == "await"))
      this.raiseRecoverable(prop.key.start, "'" + prop.key.name + "' can not be used as shorthand property")
    prop.kind = "init"
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key)
    } else if (this.type === tt.eq && refDestructuringErrors) {
      if (!refDestructuringErrors.shorthandAssign)
        refDestructuringErrors.shorthandAssign = this.start
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key)
    } else {
      prop.value = prop.key
    }
    prop.shorthand = true
  } else this.unexpected()
}

pp$3.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(tt.bracketL)) {
      prop.computed = true
      prop.key = this.parseMaybeAssign()
      this.expect(tt.bracketR)
      return prop.key
    } else {
      prop.computed = false
    }
  }
  return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true)
}

// Initialize empty function node.

pp$3.initFunction = function(node) {
  node.id = null
  if (this.options.ecmaVersion >= 6) {
    node.generator = false
    node.expression = false
  }
  if (this.options.ecmaVersion >= 8)
    node.async = false
}

// Parse object or class method.

pp$3.parseMethod = function(isGenerator, isAsync) {
  var node = this.startNode(), oldInGen = this.inGenerator, oldInAsync = this.inAsync, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos

  this.initFunction(node)
  if (this.options.ecmaVersion >= 6)
    node.generator = isGenerator
  if (this.options.ecmaVersion >= 8)
    node.async = !!isAsync

  this.inGenerator = node.generator
  this.inAsync = node.async
  this.yieldPos = 0
  this.awaitPos = 0

  this.expect(tt.parenL)
  node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8)
  this.checkYieldAwaitInDefaultParams()
  this.parseFunctionBody(node, false)

  this.inGenerator = oldInGen
  this.inAsync = oldInAsync
  this.yieldPos = oldYieldPos
  this.awaitPos = oldAwaitPos
  return this.finishNode(node, "FunctionExpression")
}

// Parse arrow function expression with given parameters.

pp$3.parseArrowExpression = function(node, params, isAsync) {
  var oldInGen = this.inGenerator, oldInAsync = this.inAsync, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos

  this.initFunction(node)
  if (this.options.ecmaVersion >= 8)
    node.async = !!isAsync

  this.inGenerator = false
  this.inAsync = node.async
  this.yieldPos = 0
  this.awaitPos = 0

  node.params = this.toAssignableList(params, true)
  this.parseFunctionBody(node, true)

  this.inGenerator = oldInGen
  this.inAsync = oldInAsync
  this.yieldPos = oldYieldPos
  this.awaitPos = oldAwaitPos
  return this.finishNode(node, "ArrowFunctionExpression")
}

// Parse function body and check parameters.

pp$3.parseFunctionBody = function(node, isArrowFunction) {
  var isExpression = isArrowFunction && this.type !== tt.braceL

  if (isExpression) {
    node.body = this.parseMaybeAssign()
    node.expression = true
  } else {
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldInFunc = this.inFunction, oldLabels = this.labels
    this.inFunction = true; this.labels = []
    node.body = this.parseBlock(true)
    node.expression = false
    this.inFunction = oldInFunc; this.labels = oldLabels
  }

  // If this is a strict mode function, verify that argument names
  // are not repeated, and it does not try to bind the words `eval`
  // or `arguments`.
  var useStrict = (!isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) ? node.body.body[0] : null
  if (useStrict && this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params))
    this.raiseRecoverable(useStrict.start, "Illegal 'use strict' directive in function with non-simple parameter list")

  if (this.strict || useStrict) {
    var oldStrict = this.strict
    this.strict = true
    if (node.id)
      this.checkLVal(node.id, true)
    this.checkParams(node)
    this.strict = oldStrict
  } else if (isArrowFunction || !this.isSimpleParamList(node.params)) {
    this.checkParams(node)
  }
}

pp$3.isSimpleParamList = function(params) {
  for (var i = 0; i < params.length; i++)
    if (params[i].type !== "Identifier") return false
  return true
}

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$3.checkParams = function(node) {
  var this$1 = this;

  var nameHash = {}
  for (var i = 0; i < node.params.length; i++) this$1.checkLVal(node.params[i], true, nameHash)
}

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var this$1 = this;

  var elts = [], first = true
  while (!this.eat(close)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (allowTrailingComma && this$1.afterTrailingComma(close)) break
    } else first = false

    var elt
    if (allowEmpty && this$1.type === tt.comma)
      elt = null
    else if (this$1.type === tt.ellipsis) {
      elt = this$1.parseSpread(refDestructuringErrors)
      if (this$1.type === tt.comma && refDestructuringErrors && !refDestructuringErrors.trailingComma) {
        refDestructuringErrors.trailingComma = this$1.start
      }
    } else
      elt = this$1.parseMaybeAssign(false, refDestructuringErrors)
    elts.push(elt)
  }
  return elts
}

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$3.parseIdent = function(liberal) {
  var node = this.startNode()
  if (liberal && this.options.allowReserved == "never") liberal = false
  if (this.type === tt.name) {
    if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) &&
        (this.options.ecmaVersion >= 6 ||
         this.input.slice(this.start, this.end).indexOf("\\") == -1))
      this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved")
    if (this.inGenerator && this.value === "yield")
      this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator")
    if (this.inAsync && this.value === "await")
      this.raiseRecoverable(this.start, "Can not use 'await' as identifier inside an async function")
    node.name = this.value
  } else if (liberal && this.type.keyword) {
    node.name = this.type.keyword
  } else {
    this.unexpected()
  }
  this.next()
  return this.finishNode(node, "Identifier")
}

// Parses yield expression inside generator.

pp$3.parseYield = function() {
  if (!this.yieldPos) this.yieldPos = this.start

  var node = this.startNode()
  this.next()
  if (this.type == tt.semi || this.canInsertSemicolon() || (this.type != tt.star && !this.type.startsExpr)) {
    node.delegate = false
    node.argument = null
  } else {
    node.delegate = this.eat(tt.star)
    node.argument = this.parseMaybeAssign()
  }
  return this.finishNode(node, "YieldExpression")
}

pp$3.parseAwait = function() {
  if (!this.awaitPos) this.awaitPos = this.start

  var node = this.startNode()
  this.next()
  node.argument = this.parseMaybeUnary(null, true)
  return this.finishNode(node, "AwaitExpression")
}

var pp$4 = Parser.prototype

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos)
  message += " (" + loc.line + ":" + loc.column + ")"
  var err = new SyntaxError(message)
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos
  throw err
}

pp$4.raiseRecoverable = pp$4.raise

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
}

var Node = function Node(parser, pos, loc) {
  this.type = ""
  this.start = pos
  this.end = 0
  if (parser.options.locations)
    this.loc = new SourceLocation(parser, loc)
  if (parser.options.directSourceFile)
    this.sourceFile = parser.options.directSourceFile
  if (parser.options.ranges)
    this.range = [pos, 0]
};

// Start an AST node, attaching a start offset.

var pp$5 = Parser.prototype

pp$5.startNode = function() {
  return new Node(this, this.start, this.startLoc)
}

pp$5.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
}

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type
  node.end = pos
  if (this.options.locations)
    node.loc.end = loc
  if (this.options.ranges)
    node.range[1] = pos
  return node
}

pp$5.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
}

// Finish node at given position

pp$5.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
}

var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
  this.token = token
  this.isExpr = !!isExpr
  this.preserveSpace = !!preserveSpace
  this.override = override
};

var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", true),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.readTmplToken(); }),
  f_expr: new TokContext("function", true)
}

var pp$6 = Parser.prototype

pp$6.initialContext = function() {
  return [types.b_stat]
}

pp$6.braceIsBlock = function(prevType) {
  if (prevType === tt.colon) {
    var parent = this.curContext()
    if (parent === types.b_stat || parent === types.b_expr)
      return !parent.isExpr
  }
  if (prevType === tt._return)
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR)
    return true
  if (prevType == tt.braceL)
    return this.curContext() === types.b_stat
  return !this.exprAllowed
}

pp$6.updateContext = function(prevType) {
  var update, type = this.type
  if (type.keyword && prevType == tt.dot)
    this.exprAllowed = false
  else if (update = type.updateContext)
    update.call(this, prevType)
  else
    this.exprAllowed = type.beforeExpr
}

// Token-specific context update code

tt.parenR.updateContext = tt.braceR.updateContext = function() {
  if (this.context.length == 1) {
    this.exprAllowed = true
    return
  }
  var out = this.context.pop()
  if (out === types.b_stat && this.curContext() === types.f_expr) {
    this.context.pop()
    this.exprAllowed = false
  } else if (out === types.b_tmpl) {
    this.exprAllowed = true
  } else {
    this.exprAllowed = !out.isExpr
  }
}

tt.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr)
  this.exprAllowed = true
}

tt.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl)
  this.exprAllowed = true
}

tt.parenL.updateContext = function(prevType) {
  var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while
  this.context.push(statementParens ? types.p_stat : types.p_expr)
  this.exprAllowed = true
}

tt.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
}

tt._function.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== tt.semi && prevType !== tt._else &&
      !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === types.b_stat))
    this.context.push(types.f_expr)
  this.exprAllowed = false
}

tt.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl)
    this.context.pop()
  else
    this.context.push(types.q_tmpl)
  this.exprAllowed = false
}

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type
  this.value = p.value
  this.start = p.start
  this.end = p.end
  if (p.options.locations)
    this.loc = new SourceLocation(p, p.startLoc, p.endLoc)
  if (p.options.ranges)
    this.range = [p.start, p.end]
};

// ## Tokenizer

var pp$7 = Parser.prototype

// Are we running under Rhino?
var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]"

// Move to the next token

pp$7.next = function() {
  if (this.options.onToken)
    this.options.onToken(new Token(this))

  this.lastTokEnd = this.end
  this.lastTokStart = this.start
  this.lastTokEndLoc = this.endLoc
  this.lastTokStartLoc = this.startLoc
  this.nextToken()
}

pp$7.getToken = function() {
  this.next()
  return new Token(this)
}

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  pp$7[Symbol.iterator] = function () {
    var self = this
    return {next: function () {
      var token = self.getToken()
      return {
        done: token.type === tt.eof,
        value: token
      }
    }}
  }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp$7.setStrict = function(strict) {
  var this$1 = this;

  this.strict = strict
  if (this.type !== tt.num && this.type !== tt.string) return
  this.pos = this.start
  if (this.options.locations) {
    while (this.pos < this.lineStart) {
      this$1.lineStart = this$1.input.lastIndexOf("\n", this$1.lineStart - 2) + 1
      --this$1.curLine
    }
  }
  this.nextToken()
}

pp$7.curContext = function() {
  return this.context[this.context.length - 1]
}

// Read a single token, updating the parser object's token-related
// properties.

pp$7.nextToken = function() {
  var curContext = this.curContext()
  if (!curContext || !curContext.preserveSpace) this.skipSpace()

  this.start = this.pos
  if (this.options.locations) this.startLoc = this.curPosition()
  if (this.pos >= this.input.length) return this.finishToken(tt.eof)

  if (curContext.override) return curContext.override(this)
  else this.readToken(this.fullCharCodeAtPos())
}

pp$7.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    return this.readWord()

  return this.getTokenFromCode(code)
}

pp$7.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos)
  if (code <= 0xd7ff || code >= 0xe000) return code
  var next = this.input.charCodeAt(this.pos + 1)
  return (code << 10) + next - 0x35fdc00
}

pp$7.skipBlockComment = function() {
  var this$1 = this;

  var startLoc = this.options.onComment && this.curPosition()
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2)
  if (end === -1) this.raise(this.pos - 2, "Unterminated comment")
  this.pos = end + 2
  if (this.options.locations) {
    lineBreakG.lastIndex = start
    var match
    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this$1.curLine
      this$1.lineStart = match.index + match[0].length
    }
  }
  if (this.options.onComment)
    this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition())
}

pp$7.skipLineComment = function(startSkip) {
  var this$1 = this;

  var start = this.pos
  var startLoc = this.options.onComment && this.curPosition()
  var ch = this.input.charCodeAt(this.pos+=startSkip)
  while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
    ++this$1.pos
    ch = this$1.input.charCodeAt(this$1.pos)
  }
  if (this.options.onComment)
    this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition())
}

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp$7.skipSpace = function() {
  var this$1 = this;

  loop: while (this.pos < this.input.length) {
    var ch = this$1.input.charCodeAt(this$1.pos)
    switch (ch) {
      case 32: case 160: // ' '
        ++this$1.pos
        break
      case 13:
        if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
          ++this$1.pos
        }
      case 10: case 8232: case 8233:
        ++this$1.pos
        if (this$1.options.locations) {
          ++this$1.curLine
          this$1.lineStart = this$1.pos
        }
        break
      case 47: // '/'
        switch (this$1.input.charCodeAt(this$1.pos + 1)) {
          case 42: // '*'
            this$1.skipBlockComment()
            break
          case 47:
            this$1.skipLineComment(2)
            break
          default:
            break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this$1.pos
        } else {
          break loop
        }
    }
  }
}

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp$7.finishToken = function(type, val) {
  this.end = this.pos
  if (this.options.locations) this.endLoc = this.curPosition()
  var prevType = this.type
  this.type = type
  this.value = val

  this.updateContext(prevType)
}

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp$7.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1)
  if (next >= 48 && next <= 57) return this.readNumber(true)
  var next2 = this.input.charCodeAt(this.pos + 2)
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3
    return this.finishToken(tt.ellipsis)
  } else {
    ++this.pos
    return this.finishToken(tt.dot)
  }
}

pp$7.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1)
  if (this.exprAllowed) {++this.pos; return this.readRegexp()}
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.slash, 1)
}

pp$7.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1)
  var size = 1
  var tokentype = code === 42 ? tt.star : tt.modulo

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && next === 42) {
    ++size
    tokentype = tt.starstar
    next = this.input.charCodeAt(this.pos + 2)
  }

  if (next === 61) return this.finishOp(tt.assign, size + 1)
  return this.finishOp(tokentype, size)
}

pp$7.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === code) return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2)
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1)
}

pp$7.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.bitwiseXOR, 1)
}

pp$7.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === code) {
    if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 &&
        lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
      // A `-->` line comment
      this.skipLineComment(3)
      this.skipSpace()
      return this.nextToken()
    }
    return this.finishOp(tt.incDec, 2)
  }
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.plusMin, 1)
}

pp$7.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1)
  var size = 1
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2
    if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1)
    return this.finishOp(tt.bitShift, size)
  }
  if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 &&
      this.input.charCodeAt(this.pos + 3) == 45) {
    if (this.inModule) this.unexpected()
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4)
    this.skipSpace()
    return this.nextToken()
  }
  if (next === 61) size = 2
  return this.finishOp(tt.relational, size)
}

pp$7.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2)
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2
    return this.finishToken(tt.arrow)
  }
  return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1)
}

pp$7.getTokenFromCode = function(code) {
  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

    // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(tt.parenL)
  case 41: ++this.pos; return this.finishToken(tt.parenR)
  case 59: ++this.pos; return this.finishToken(tt.semi)
  case 44: ++this.pos; return this.finishToken(tt.comma)
  case 91: ++this.pos; return this.finishToken(tt.bracketL)
  case 93: ++this.pos; return this.finishToken(tt.bracketR)
  case 123: ++this.pos; return this.finishToken(tt.braceL)
  case 125: ++this.pos; return this.finishToken(tt.braceR)
  case 58: ++this.pos; return this.finishToken(tt.colon)
  case 63: ++this.pos; return this.finishToken(tt.question)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) break
    ++this.pos
    return this.finishToken(tt.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1)
    if (next === 120 || next === 88) return this.readRadixNumber(16) // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) return this.readRadixNumber(8) // '0o', '0O' - octal number
      if (next === 98 || next === 66) return this.readRadixNumber(2) // '0b', '0B' - binary number
    }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

    // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 126: // '~'
    return this.finishOp(tt.prefix, 1)
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'")
}

pp$7.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size)
  this.pos += size
  return this.finishToken(type, str)
}

// Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.

function tryCreateRegexp(src, flags, throwErrorAt, parser) {
  try {
    return new RegExp(src, flags)
  } catch (e) {
    if (throwErrorAt !== undefined) {
      if (e instanceof SyntaxError) parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message)
      throw e
    }
  }
}

var regexpUnicodeSupport = !!tryCreateRegexp("\uffff", "u")

pp$7.readRegexp = function() {
  var this$1 = this;

  var escaped, inClass, start = this.pos
  for (;;) {
    if (this$1.pos >= this$1.input.length) this$1.raise(start, "Unterminated regular expression")
    var ch = this$1.input.charAt(this$1.pos)
    if (lineBreak.test(ch)) this$1.raise(start, "Unterminated regular expression")
    if (!escaped) {
      if (ch === "[") inClass = true
      else if (ch === "]" && inClass) inClass = false
      else if (ch === "/" && !inClass) break
      escaped = ch === "\\"
    } else escaped = false
    ++this$1.pos
  }
  var content = this.input.slice(start, this.pos)
  ++this.pos
  // Need to use `readWord1` because '\uXXXX' sequences are allowed
  // here (don't ask).
  var mods = this.readWord1()
  var tmp = content, tmpFlags = ""
  if (mods) {
    var validFlags = /^[gim]*$/
    if (this.options.ecmaVersion >= 6) validFlags = /^[gimuy]*$/
    if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag")
    if (mods.indexOf("u") >= 0) {
      if (regexpUnicodeSupport) {
        tmpFlags = "u"
      } else {
        // Replace each astral symbol and every Unicode escape sequence that
        // possibly represents an astral symbol or a paired surrogate with a
        // single ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        // Note: replacing with the ASCII symbol `x` might cause false
        // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
        // perfectly valid pattern that is equivalent to `[a-b]`, but it would
        // be replaced by `[x-b]` which throws an error.
        tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
          code = Number("0x" + code)
          if (code > 0x10FFFF) this$1.raise(start + offset + 3, "Code point out of bounds")
          return "x"
        })
        tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x")
        tmpFlags = tmpFlags.replace("u", "")
      }
    }
  }
  // Detect invalid regular expressions.
  var value = null
  // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
  // so don't do detection if we are running under Rhino
  if (!isRhino) {
    tryCreateRegexp(tmp, tmpFlags, start, this)
    // Get a regular expression object for this pattern-flag pair, or `null` in
    // case the current environment doesn't support the flags it uses.
    value = tryCreateRegexp(content, mods)
  }
  return this.finishToken(tt.regexp, {pattern: content, flags: mods, value: value})
}

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp$7.readInt = function(radix, len) {
  var this$1 = this;

  var start = this.pos, total = 0
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this$1.input.charCodeAt(this$1.pos), val
    if (code >= 97) val = code - 97 + 10 // a
    else if (code >= 65) val = code - 65 + 10 // A
    else if (code >= 48 && code <= 57) val = code - 48 // 0-9
    else val = Infinity
    if (val >= radix) break
    ++this$1.pos
    total = total * radix + val
  }
  if (this.pos === start || len != null && this.pos - start !== len) return null

  return total
}

pp$7.readRadixNumber = function(radix) {
  this.pos += 2 // 0x
  var val = this.readInt(radix)
  if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix)
  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number")
  return this.finishToken(tt.num, val)
}

// Read an integer, octal integer, or floating-point number.

pp$7.readNumber = function(startsWithDot) {
  var start = this.pos, isFloat = false, octal = this.input.charCodeAt(this.pos) === 48
  if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number")
  if (octal && this.pos == start + 1) octal = false
  var next = this.input.charCodeAt(this.pos)
  if (next === 46 && !octal) { // '.'
    ++this.pos
    this.readInt(10)
    isFloat = true
    next = this.input.charCodeAt(this.pos)
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos)
    if (next === 43 || next === 45) ++this.pos // '+-'
    if (this.readInt(10) === null) this.raise(start, "Invalid number")
    isFloat = true
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number")

  var str = this.input.slice(start, this.pos), val
  if (isFloat) val = parseFloat(str)
  else if (!octal || str.length === 1) val = parseInt(str, 10)
  else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number")
  else val = parseInt(str, 8)
  return this.finishToken(tt.num, val)
}

// Read a string value, interpreting backslash-escapes.

pp$7.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code

  if (ch === 123) {
    if (this.options.ecmaVersion < 6) this.unexpected()
    var codePos = ++this.pos
    code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos)
    ++this.pos
    if (code > 0x10FFFF) this.raise(codePos, "Code point out of bounds")
  } else {
    code = this.readHexChar(4)
  }
  return code
}

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) return String.fromCharCode(code)
  code -= 0x10000
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

pp$7.readString = function(quote) {
  var this$1 = this;

  var out = "", chunkStart = ++this.pos
  for (;;) {
    if (this$1.pos >= this$1.input.length) this$1.raise(this$1.start, "Unterminated string constant")
    var ch = this$1.input.charCodeAt(this$1.pos)
    if (ch === quote) break
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos)
      out += this$1.readEscapedChar(false)
      chunkStart = this$1.pos
    } else {
      if (isNewLine(ch)) this$1.raise(this$1.start, "Unterminated string constant")
      ++this$1.pos
    }
  }
  out += this.input.slice(chunkStart, this.pos++)
  return this.finishToken(tt.string, out)
}

// Reads template string tokens.

pp$7.readTmplToken = function() {
  var this$1 = this;

  var out = "", chunkStart = this.pos
  for (;;) {
    if (this$1.pos >= this$1.input.length) this$1.raise(this$1.start, "Unterminated template")
    var ch = this$1.input.charCodeAt(this$1.pos)
    if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) { // '`', '${'
      if (this$1.pos === this$1.start && this$1.type === tt.template) {
        if (ch === 36) {
          this$1.pos += 2
          return this$1.finishToken(tt.dollarBraceL)
        } else {
          ++this$1.pos
          return this$1.finishToken(tt.backQuote)
        }
      }
      out += this$1.input.slice(chunkStart, this$1.pos)
      return this$1.finishToken(tt.template, out)
    }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos)
      out += this$1.readEscapedChar(true)
      chunkStart = this$1.pos
    } else if (isNewLine(ch)) {
      out += this$1.input.slice(chunkStart, this$1.pos)
      ++this$1.pos
      switch (ch) {
        case 13:
          if (this$1.input.charCodeAt(this$1.pos) === 10) ++this$1.pos
        case 10:
          out += "\n"
          break
        default:
          out += String.fromCharCode(ch)
          break
      }
      if (this$1.options.locations) {
        ++this$1.curLine
        this$1.lineStart = this$1.pos
      }
      chunkStart = this$1.pos
    } else {
      ++this$1.pos
    }
  }
}

// Used to read escaped characters

pp$7.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos)
  ++this.pos
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) ++this.pos // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine }
    return ""
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0]
      var octal = parseInt(octalStr, 8)
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1)
        octal = parseInt(octalStr, 8)
      }
      if (octalStr !== "0" && (this.strict || inTemplate)) {
        this.raise(this.pos - 2, "Octal literal in strict mode")
      }
      this.pos += octalStr.length - 1
      return String.fromCharCode(octal)
    }
    return String.fromCharCode(ch)
  }
}

// Used to read character escape sequences ('\x', '\u', '\U').

pp$7.readHexChar = function(len) {
  var codePos = this.pos
  var n = this.readInt(16, len)
  if (n === null) this.raise(codePos, "Bad character escape sequence")
  return n
}

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp$7.readWord1 = function() {
  var this$1 = this;

  this.containsEsc = false
  var word = "", first = true, chunkStart = this.pos
  var astral = this.options.ecmaVersion >= 6
  while (this.pos < this.input.length) {
    var ch = this$1.fullCharCodeAtPos()
    if (isIdentifierChar(ch, astral)) {
      this$1.pos += ch <= 0xffff ? 1 : 2
    } else if (ch === 92) { // "\"
      this$1.containsEsc = true
      word += this$1.input.slice(chunkStart, this$1.pos)
      var escStart = this$1.pos
      if (this$1.input.charCodeAt(++this$1.pos) != 117) // "u"
        this$1.raise(this$1.pos, "Expecting Unicode escape sequence \\uXXXX")
      ++this$1.pos
      var esc = this$1.readCodePoint()
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        this$1.raise(escStart, "Invalid Unicode escape")
      word += codePointToString(esc)
      chunkStart = this$1.pos
    } else {
      break
    }
    first = false
  }
  return word + this.input.slice(chunkStart, this.pos)
}

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp$7.readWord = function() {
  var word = this.readWord1()
  var type = tt.name
  if ((this.options.ecmaVersion >= 6 || !this.containsEsc) && this.keywords.test(word))
    type = keywordTypes[word]
  return this.finishToken(type, word)
}

var version = "4.0.3"

// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

function parse(input, options) {
  return new Parser(options, input).parse()
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
  var p = new Parser(options, input, pos)
  p.nextToken()
  return p.parseExpression()
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
  return new Parser(options, input)
}

// This is a terrible kludge to support the existing, pre-ES6
// interface where the loose parser module retroactively adds exports
// to this module.
function addLooseExports(parse, Parser, plugins) {
  parse_dammit = parse
  LooseParser = Parser
  pluginsLoose = plugins
}

//export { version, parse, parseExpressionAt, tokenizer, parse_dammit, LooseParser, pluginsLoose, addLooseExports, Parser, plugins, defaultOptions, Position, SourceLocation, getLineInfo, Node, TokenType, tt as tokTypes, TokContext, types as tokContexts, isIdentifierChar, isIdentifierStart, Token, isNewLine, lineBreak, lineBreakG };

//var exports = {
//		acorn_parse: parse
//	}

//Export(exports)

window.call_acorn_parse = parse // Bruce Sherwood; makes acorn accessible to GlowScript compiler

})()
// vector operator overloading, extracted by Salvatore di Dio from the
// PaperScript project of Juerg Lehni. Modified by Bruce Sherwood for greater speed.
// The GlowScript vector class is in file vectors.js.

/*
Salvatore di Dio demonstrated in his RapydGlow experiment (http://salvatore.pythonanywhere.com/RapydGlow)
how he was able to use the RapydScript Python-to-JavaScript compiler with GlowScript graphics.
This inspired the implementation of the VPython (vpython.org) API at glowscript.org.
He provided this file for operator overloading, based on the work of
    Juerg Lehni (PaperScript: http://scratchdisk.com/posts/operator-overloading).
He also assembled support for operator overloading and the ability to write synchronous code
in the file transform-all.js, based on the work of
    Bruno Jouhier (Streamline: https://github.com/Sage/streamlinejs), and
    Marijn Haverbeke (Acorn.js: https://github.com/marijnh).
Supporting the VPython API in a browser is possible thanks to the work of
    Alexander Tsepkov (RapydScript: https://bitbucket.org/pyjeon/rapydscript) and
    Charles Law (browser-based RapydScript: http://pyjeon.pythonanywhere.com/static/rapydscript_online/index.html).

When the GlowScript project was launched in 2011 by David Scherer and Bruce Sherwood,
Scherer implemented operator overloading and synchronous code using libraries existing at that time.
In 2015 it became necessary to upgrade to newer libraries because compilation failed on some browsers.

In December 2016 Bruce Sherwood deleted an old embedded version of acorn and invoked up-to-date acorn.es.js
*/

function isNumeric(num ) {
    return ((num >= 0) || (num < 0) && (parseInt(num) === num));
}
		
var binaryOperators = { // These are functions in the vector class, in vector.js
    '+': 'add',
    '-': 'sub',
    '*': 'multiply',
    '/': 'divide',
    '>': 'greater',
    '>=': 'greaterorequal',
    '<': 'less',
    '<=': 'lessorequal',
    '+=': 'plusequal',
    '-=': 'minusequal',
    '*=': 'timesequal',
    '/=': 'divideequal'
    //'===': 'equal',    // Could not make this work in RapydScript environment, which does its own equality tests
    //'!==': 'notequal', // Could not make this work in RapydScript environment, which does its own equality tests
};

var unaryOperators = {
    '-': 'negate',
    '+': 'plus'
};

function papercompile(code) {

    var insertions = [];

    function getOffset(offset) {
        for (var i = 0, l = insertions.length; i < l; i++) {
            var insertion = insertions[i];
            if (insertion[0] >= offset)
                break;
            offset += insertion[1];
        }
        return offset;
    }

    function getCode(node) {
        return code.substring(getOffset(node.range[0]),
            getOffset(node.range[1]));
    }

    function replaceCode(node, str) {
        var start = getOffset(node.range[0]),
            end = getOffset(node.range[1]);
        var insert = 0;
        for (var i = insertions.length - 1; i >= 0; i--) {
            if (start > insertions[i][0]) {
                insert = i + 1;
                break;
            }
        }
        insertions.splice(insert, 0, [start, str.length - end + start]);
        code = code.substring(0, start) + str + code.substring(end);
    }

    function walkAST(node, parent) {
        if (!node)
            return;
        for (var key in node) {
            if (key === 'range')
                continue;
            var value = node[key];
            if (Array.isArray(value)) {
                for (var i = 0, l = value.length; i < l; i++)
                    walkAST(value[i], node);
            } else if (value && typeof value === 'object') {
                walkAST(value, node);
            }
        }
        var left;
        var right;
        var arg;
        switch (node && node.type) {
	        case 'BinaryExpression': // This converts a+b => a["+"](b)
	        	if (node.operator in binaryOperators) {
	                left = getCode(node.left);
	                right = getCode(node.right);
	                arg = binaryOperators[node.operator]
	                // Could not make this work in RapydScript environment, which does its own equality tests
	                //if (node.operator == '===') replaceCode(node, left+'["eq"]('+right+')');
	                //else if (node.operator == '!==') replaceCode(node, left+'["ne"]('+right+')');
	                //else replaceCode(node, left+'["'+node.operator+'"]('+right+')');
	                replaceCode(node, left+'["'+node.operator+'"]('+right+')');
	            }
	            break;
	        case 'AssignmentExpression':
	            if (node.operator in binaryOperators) { // += or -= or *= or /=
	                left = getCode(node.left);
	                right = getCode(node.right);
	                replaceCode(node, left + '=' +left+'["'+node.operator+'"]('+right+')');
	            }
	            break;
	        /*
	        case 'UpdateExpression': // an example is ++
	            if (!node.prefix && !(parent && (
	                parent.type === 'BinaryExpression'
	                    && /^[=!<>]/.test(parent.operator)
	                    || parent.type === 'MemberExpression'
	                        && parent.computed))) {
	                arg = getCode(node.argument);
	                replaceCode(node, arg + ' = _$_(' + arg + ', "' + node.operator[0] + '", 1)');
	            }
	            break;
	        */
	        case 'UnaryExpression': // This converts -a => a["-a]() and +a => a
	            if (node.operator in unaryOperators) {
	                arg = getCode(node.argument);
	                if (node.operator == "-") replaceCode(node, arg+'["-u"]()');
	                else replaceCode(node, arg);
	            }
	            break;
        }
    }
    walkAST(window.call_acorn_parse(code, { ranges: true })); 
    return code;
}

// This library was prepared by Salvatore di Dio from the work of 
// Jurg Lehni (PaperScript: http://scratchdisk.com/posts/operator-overloading),
// Bruno Jouhier (Streamline: https://github.com/Sage/streamlinejs), and
// Marijn Haverbeke (Acorn.js: https://github.com/marijnh).
// Salvatore wishes also to thank 
//    Alexander Tsepkov (RapydScript: https://bitbucket.org/pyjeon/rapydscript), 
//    Charles Law (browser-based RapydScript: http://pyjeon.pythonanywhere.com/static/rapydscript_online/index.html),
//    and Vitali Malinouski (W2UI: http://w2ui.com/web/)

// #### Marks changes to this file by Bruce Sherwood to send errors to the error handler in run.js
// #### Changed "require" to "srequire" to try to avoid collision with standard require function.

if (!Object.create || !Object.defineProperty || !Object.defineProperties) alert("Example will fail because your browser does not support ECMAScript 5. Try with another browser!");
var __filename = "" + window.location;

window.Streamline = { globals: {} };

function srequire(str) { // #### require -> srequire
	if (str == "streamline/lib/util/flows") return Streamline.flows;
	else if (str == "streamline/lib/globals") return Streamline.globals;
	else if (str == "streamline/lib/version") return Streamline.version;
	else if (str == "streamline/lib/callbacks/runtime") return Streamline.runtime;
	else if (str == "streamline/lib/callbacks/transform") return Streamline;
	else if (str == "streamline/lib/callbacks/builtins") return Streamline.builtins;
	else if (str == "streamline/lib/util/future") return Streamline.future;
	else if (str == "streamline/lib/util/source-map") return Streamline.sourceMap.exports;
	else throw new Error("Cannot require " + str) // #### was an alert
}
/* vim: set sw=4 ts=4 et tw=78: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narcissus JavaScript engine.
 *
 * The Initial Developer of the Original Code is
 * Brendan Eich <brendan@mozilla.org>.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Tom Austin <taustin@ucsc.edu>
 *   Brendan Eich <brendan@mozilla.org>
 *   Shu-Yu Guo <shu@rfrn.org>
 *   Dave Herman <dherman@mozilla.com>
 *   Dimitris Vardoulakis <dimvar@ccs.neu.edu>
 *   Patrick Walton <pcwalton@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * Narcissus - JS implemented in JS.
 *
 * Well-known constants and lookup tables.  Many consts are generated from the
 * tokens table via eval to minimize redundancy, so consumers must be compiled
 * separately to take advantage of the simple switch-case constant propagation
 * done by SpiderMonkey.
 */

(function() {

    var narcissus = {
        options: {
            version: 185,
        },
        hostGlobal: this
    };
    Narcissus = narcissus;
})();

Narcissus.definitions = (function() {

    var tokens = [
        // End of source.
        "END",

        // Operators and punctuators.  Some pair-wise order matters, e.g. (+, -)
        // and (UNARY_PLUS, UNARY_MINUS).
        "\n", ";",
        ",",
        "=",
        "?", ":", "CONDITIONAL",
        "||",
        "&&",
        "|",
        "^",
        "&",
        "==", "!=", "===", "!==",
        "<", "<=", ">=", ">",
        "<<", ">>", ">>>",
        "+", "-",
        "*", "/", "%",
        "!", "~", "UNARY_PLUS", "UNARY_MINUS",
        "++", "--",
        ".",
        "[", "]",
        "{", "}",
        "(", ")",

        // Nonterminal tree node type codes.
        "SCRIPT", "BLOCK", "LABEL", "FOR_IN", "CALL", "NEW_WITH_ARGS", "INDEX",
        "ARRAY_INIT", "OBJECT_INIT", "PROPERTY_INIT", "GETTER", "SETTER",
        "GROUP", "LIST", "LET_BLOCK", "ARRAY_COMP", "GENERATOR", "COMP_TAIL",

        // Terminals.
        "IDENTIFIER", "NUMBER", "STRING", "REGEXP",

        // Keywords.
        "break",
        "case", "catch", "const", "continue",
        "debugger", "default", "delete", "do",
        "else",
        "false", "finally", "for", "function",
        "if", "in", "instanceof",
        "let",
        "new", "null",
        "return",
        "switch",
        "this", "throw", "true", "try", "typeof",
        "var", "void",
        "yield",
        "while", "with",
    ];

    var statementStartTokens = [
        "break",
        "const", "continue",
        "debugger", "do",
        "for",
        "if",
        "return",
        "switch",
        "throw", "try",
        "var",
        "yield",
        "while", "with",
    ];

    // Operator and punctuator mapping from token to tree node type name.
    // NB: because the lexer doesn't backtrack, all token prefixes must themselves
    // be valid tokens (e.g. !== is acceptable because its prefixes are the valid
    // tokens != and !).
    var opTypeNames = {
        '\n':   "NEWLINE",
        ';':    "SEMICOLON",
        ',':    "COMMA",
        '?':    "HOOK",
        ':':    "COLON",
        '||':   "OR",
        '&&':   "AND",
        '|':    "BITWISE_OR",
        '^':    "BITWISE_XOR",
        '&':    "BITWISE_AND",
        '===':  "STRICT_EQ",
        '==':   "EQ",
        '=':    "ASSIGN",
        '!==':  "STRICT_NE",
        '!=':   "NE",
        '<<':   "LSH",
        '<=':   "LE",
        '<':    "LT",
        '>>>':  "URSH",
        '>>':   "RSH",
        '>=':   "GE",
        '>':    "GT",
        '++':   "INCREMENT",
        '--':   "DECREMENT",
        '+':    "PLUS",
        '-':    "MINUS",
        '*':    "MUL",
        '/':    "DIV",
        '%':    "MOD",
        '!':    "NOT",
        '~':    "BITWISE_NOT",
        '.':    "DOT",
        '[':    "LEFT_BRACKET",
        ']':    "RIGHT_BRACKET",
        '{':    "LEFT_CURLY",
        '}':    "RIGHT_CURLY",
        '(':    "LEFT_PAREN",
        ')':    "RIGHT_PAREN"
    };

    // Hash of keyword identifier to tokens index.  NB: we must null __proto__ to
    // avoid toString, etc. namespace pollution.
    var keywords = {__proto__: null};

    // Define const END, etc., based on the token names.  Also map name to index.
    var tokenIds = {};

    // Building up a string to be eval'd in different contexts.
    var consts = "var ";
    for (var i = 0, j = tokens.length; i < j; i++) {
        if (i > 0)
            consts += ", ";
        var t = tokens[i];
        var name;
        if (/^[a-z]/.test(t)) {
            name = t.toUpperCase();
            keywords[t] = i;
        } else {
            name = (/^\W/.test(t) ? opTypeNames[t] : t);
        }
        consts += name + " = " + i;
        tokenIds[name] = i;
        tokens[t] = i;
    }
    consts += ";";

    var isStatementStartCode = {__proto__: null};
    for (i = 0, j = statementStartTokens.length; i < j; i++)
        isStatementStartCode[keywords[statementStartTokens[i]]] = true;

    // Map assignment operators to their indexes in the tokens array.
    var assignOps = ['|', '^', '&', '<<', '>>', '>>>', '+', '-', '*', '/', '%'];

    for (i = 0, j = assignOps.length; i < j; i++) {
        t = assignOps[i];
        assignOps[t] = tokens[t];
    }

    function defineGetter(obj, prop, fn, dontDelete, dontEnum) {
        Object.defineProperty(obj, prop,
                              { get: fn, configurable: !dontDelete, enumerable: !dontEnum });
    }

    function defineProperty(obj, prop, val, dontDelete, readOnly, dontEnum) {
        Object.defineProperty(obj, prop,
                              { value: val, writable: !readOnly, configurable: !dontDelete,
                                enumerable: !dontEnum });
    }

    // Returns true if fn is a native function.  (Note: SpiderMonkey specific.)
    function isNativeCode(fn) {
        // Relies on the toString method to identify native code.
        return ((typeof fn) === "function") && fn.toString().match(/\[native code\]/);
    }

    function getPropertyDescriptor(obj, name) {
        while (obj) {
            if (({}).hasOwnProperty.call(obj, name))
                return Object.getOwnPropertyDescriptor(obj, name);
            obj = Object.getPrototypeOf(obj);
        }
    }

    function getOwnProperties(obj) {
        var map = {};
        for (var name in Object.getOwnPropertyNames(obj))
            map[name] = Object.getOwnPropertyDescriptor(obj, name);
        return map;
    }

    function makePassthruHandler(obj) {
        // Handler copied from
        // http://wiki.ecmascript.org/doku.php?id=harmony:proxies&s=proxy%20object#examplea_no-op_forwarding_proxy
        return {
            getOwnPropertyDescriptor: function(name) {
                var desc = Object.getOwnPropertyDescriptor(obj, name);

                // a trapping proxy's properties must always be configurable
                desc.configurable = true;
                return desc;
            },
            getPropertyDescriptor: function(name) {
                var desc = getPropertyDescriptor(obj, name);

                // a trapping proxy's properties must always be configurable
                desc.configurable = true;
                return desc;
            },
            getOwnPropertyNames: function() {
                return Object.getOwnPropertyNames(obj);
            },
            defineProperty: function(name, desc) {
                Object.defineProperty(obj, name, desc);
            },
            "delete": function(name) { return delete obj[name]; },
            fix: function() {
                if (Object.isFrozen(obj)) {
                    return getOwnProperties(obj);
                }

                // As long as obj is not frozen, the proxy won't allow itself to be fixed.
                return undefined; // will cause a TypeError to be thrown
            },

            has: function(name) { return name in obj; },
            hasOwn: function(name) { return ({}).hasOwnProperty.call(obj, name); },
            get: function(receiver, name) { return obj[name]; },

            // bad behavior when set fails in non-strict mode
            set: function(receiver, name, val) { obj[name] = val; return true; },
            enumerate: function() {
                var result = [];
                for (name in obj) { result.push(name); };
                return result;
            },
            keys: function() { return Object.keys(obj); }
        };
    }

    // default function used when looking for a property in the global object
    function noPropFound() { return undefined; }

    var hasOwnProperty = ({}).hasOwnProperty;

    function StringMap() {
        this.table = Object.create(null, {});
        this.size = 0;
    }

    StringMap.prototype = {
        has: function(x) { return hasOwnProperty.call(this.table, x); },
        set: function(x, v) {
            if (!hasOwnProperty.call(this.table, x))
                this.size++;
            this.table[x] = v;
        },
        get: function(x) { return this.table[x]; },
        getDef: function(x, thunk) {
            if (!hasOwnProperty.call(this.table, x)) {
                this.size++;
                this.table[x] = thunk();
            }
            return this.table[x];
        },
        forEach: function(f) {
            var table = this.table;
            for (var key in table)
                f.call(this, key, table[key]);
        },
        toString: function() { return "[object StringMap]" }
    };

    // non-destructive stack
    function Stack(elts) {
        this.elts = elts || null;
    }

    Stack.prototype = {
        push: function(x) {
            return new Stack({ top: x, rest: this.elts });
        },
        top: function() {
            if (!this.elts)
                throw new Error("empty stack");
            return this.elts.top;
        },
        isEmpty: function() {
            return this.top === null;
        },
        find: function(test) {
            for (var elts = this.elts; elts; elts = elts.rest) {
                if (test(elts.top))
                    return elts.top;
            }
            return null;
        },
        has: function(x) {
            return Boolean(this.find(function(elt) { return elt === x }));
        },
        forEach: function(f) {
            for (var elts = this.elts; elts; elts = elts.rest) {
                f(elts.top);
            }
        }
    };

    return {
        tokens: tokens,
        opTypeNames: opTypeNames,
        keywords: keywords,
        isStatementStartCode: isStatementStartCode,
        tokenIds: tokenIds,
        consts: consts,
        assignOps: assignOps,
        defineGetter: defineGetter,
        defineProperty: defineProperty,
        isNativeCode: isNativeCode,
        makePassthruHandler: makePassthruHandler,
        noPropFound: noPropFound,
        StringMap: StringMap,
        Stack: Stack
    };
}());
/* vim: set sw=4 ts=4 et tw=78: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narcissus JavaScript engine.
 *
 * The Initial Developer of the Original Code is
 * Brendan Eich <brendan@mozilla.org>.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Tom Austin <taustin@ucsc.edu>
 *   Brendan Eich <brendan@mozilla.org>
 *   Shu-Yu Guo <shu@rfrn.org>
 *   Dave Herman <dherman@mozilla.com>
 *   Dimitris Vardoulakis <dimvar@ccs.neu.edu>
 *   Patrick Walton <pcwalton@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * Narcissus - JS implemented in JS.
 *
 * Lexical scanner.
 */

Narcissus.lexer = (function() {

    var definitions = Narcissus.definitions;

    // Set constants in the local scope.
    eval(definitions.consts);

    // Build up a trie of operator tokens.
    var opTokens = {};
    for (var op in definitions.opTypeNames) {
        if (op === '\n' || op === '.')
            continue;

        var node = opTokens;
        for (var i = 0; i < op.length; i++) {
            var ch = op[i];
            if (!(ch in node))
                node[ch] = {};
            node = node[ch];
            node.op = op;
        }
    }

    /*
     * Tokenizer :: (source, filename, line number) -> Tokenizer
     */
    function Tokenizer(s, f, l) {
        this.cursor = 0;
        this.source = String(s);
        this.tokens = [];
        this.tokenIndex = 0;
        this.lookahead = 0;
        this.scanNewlines = false;
        this.unexpectedEOF = false;
        this.filename = f || "";
        this.lineno = l || 1;
    }

    Tokenizer.prototype = {
        get done() {
            // We need to set scanOperand to true here because the first thing
            // might be a regexp.
            return this.peek(true) === END;
        },

        get token() {
            return this.tokens[this.tokenIndex];
        },

        match: function (tt, scanOperand) {
            return this.get(scanOperand) === tt || this.unget();
        },

        mustMatch: function (tt) {
            if (!this.match(tt)) {
                throw this.newSyntaxError("Missing " +
                                          definitions.tokens[tt].toLowerCase());
            }
            return this.token;
        },

        forceIdentifier: function() {
        	if (!this.match(IDENTIFIER)) {
        		// keywords are valid property names in ES 5
        		if (this.get() >= definitions.keywords[0] || this.unget) {
        			this.token.type = IDENTIFIER;
        		}
        		else {
        			throw this.newSyntaxError("Missing identifier");
        		}
        	}
        	return this.token;
        },

        peek: function (scanOperand) {
            var tt, next;
            if (this.lookahead) {
                next = this.tokens[(this.tokenIndex + this.lookahead) & 3];
                tt = (this.scanNewlines && next.lineno !== this.lineno)
                     ? NEWLINE
                     : next.type;
            } else {
                tt = this.get(scanOperand);
                this.unget();
            }
            return tt;
        },

        peekOnSameLine: function (scanOperand) {
            this.scanNewlines = true;
            var tt = this.peek(scanOperand);
            this.scanNewlines = false;
            return tt;
        },

        // Eat comments and whitespace.
        skip: function () {
            var input = this.source;
            for (;;) {
                var ch = input[this.cursor++];
                var next = input[this.cursor];
                if (ch === '\n' && !this.scanNewlines) {
                    this.lineno++;
                } else if (ch === '/' && next === '*') {
                    this.cursor++;
                    for (;;) {
                        ch = input[this.cursor++];
                        if (ch === undefined)
                            throw this.newSyntaxError("Unterminated comment");

                        if (ch === '*') {
                            next = input[this.cursor];
                            if (next === '/') {
                                this.cursor++;
                                break;
                            }
                        } else if (ch === '\n') {
                            this.lineno++;
                        }
                    }
                } else if (ch === '/' && next === '/') {
                    this.cursor++;
                    for (;;) {
                        ch = input[this.cursor++];
                        if (ch === undefined)
                            return;

                        if (ch === '\n') {
                            this.lineno++;
                            break;
                        }
                    }
                } else if (ch !== ' ' && ch !== '\t') {
                    this.cursor--;
                    return;
                }
            }
        },

        // Lex the exponential part of a number, if present. Return true iff an
        // exponential part was found.
        lexExponent: function() {
            var input = this.source;
            var next = input[this.cursor];
            if (next === 'e' || next === 'E') {
                this.cursor++;
                ch = input[this.cursor++];
                if (ch === '+' || ch === '-')
                    ch = input[this.cursor++];

                if (ch < '0' || ch > '9')
                    throw this.newSyntaxError("Missing exponent");

                do {
                    ch = input[this.cursor++];
                } while (ch >= '0' && ch <= '9');
                this.cursor--;

                return true;
            }

            return false;
        },

        lexZeroNumber: function (ch) {
            var token = this.token, input = this.source;
            token.type = NUMBER;

            ch = input[this.cursor++];
            if (ch === '.') {
                do {
                    ch = input[this.cursor++];
                } while (ch >= '0' && ch <= '9');
                this.cursor--;

                this.lexExponent();
                token.value = parseFloat(input.substring(token.start, this.cursor));
            } else if (ch === 'x' || ch === 'X') {
                do {
                    ch = input[this.cursor++];
                } while ((ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f') ||
                         (ch >= 'A' && ch <= 'F'));
                this.cursor--;

                token.value = parseInt(input.substring(token.start, this.cursor));
            } else if (ch >= '0' && ch <= '7') {
                do {
                    ch = input[this.cursor++];
                } while (ch >= '0' && ch <= '7');
                this.cursor--;

                token.value = parseInt(input.substring(token.start, this.cursor), 8);
                token.value.isOctal = true; // mark it to decomp as octal so that strict mode catches it
            } else {
                this.cursor--;
                this.lexExponent();     // 0E1, &c.
                token.value = 0;
            }
        },

        lexNumber: function (ch) {
            var token = this.token, input = this.source;
            token.type = NUMBER;

            var floating = false;
            do {
                ch = input[this.cursor++];
                if (ch === '.' && !floating) {
                    floating = true;
                    ch = input[this.cursor++];
                }
            } while (ch >= '0' && ch <= '9');

            this.cursor--;

            var exponent = this.lexExponent();
            floating = floating || exponent;

            var str = input.substring(token.start, this.cursor);
            token.value = floating ? parseFloat(str) : parseInt(str);
        },

        lexDot: function (ch) {
            var token = this.token, input = this.source;
            var next = input[this.cursor];
            if (next >= '0' && next <= '9') {
                do {
                    ch = input[this.cursor++];
                } while (ch >= '0' && ch <= '9');
                this.cursor--;

                this.lexExponent();

                token.type = NUMBER;
                token.value = parseFloat(input.substring(token.start, this.cursor));
            } else {
                token.type = DOT;
                token.assignOp = null;
                token.value = '.';
            }
        },

        lexString: function (ch) {
            var token = this.token, input = this.source;
            token.type = STRING;

            var hasEscapes = false;
            var delim = ch;
            while ((ch = input[this.cursor++]) !== delim) {
                if (this.cursor == input.length)
                    throw this.newSyntaxError("Unterminated string literal");
                if (ch === '\\') {
                    hasEscapes = true;
                    if (input[this.cursor] === '\n') this.lineno++; // fix for escaped newline
                    if (++this.cursor == input.length)
                        throw this.newSyntaxError("Unterminated string literal");
                }
            }

            token.value = hasEscapes
                          ? eval(input.substring(token.start, this.cursor))
                          : input.substring(token.start + 1, this.cursor - 1);
        },

        lexRegExp: function (ch) {
            var token = this.token, input = this.source;
            token.type = REGEXP;

            do {
                ch = input[this.cursor++];
                if (ch === '\\') {
                    this.cursor++;
                } else if (ch === '[') {
                    do {
                        if (ch === undefined)
                            throw this.newSyntaxError("Unterminated character class");

                        if (ch === '\\')
                            this.cursor++;

                        ch = input[this.cursor++];
                    } while (ch !== ']');
                } else if (ch === undefined) {
                    throw this.newSyntaxError("Unterminated regex");
                }
            } while (ch !== '/');

            do {
                ch = input[this.cursor++];
            } while (ch >= 'a' && ch <= 'z');

            this.cursor--;

            token.value = eval(input.substring(token.start, this.cursor));
        },

        lexOp: function (ch) {
            var token = this.token, input = this.source;

            // A bit ugly, but it seems wasteful to write a trie lookup routine
            // for only 3 characters...
            var node = opTokens[ch];
            var next = input[this.cursor];
            if (next in node) {
                node = node[next];
                this.cursor++;
                next = input[this.cursor];
                if (next in node) {
                    node = node[next];
                    this.cursor++;
                    next = input[this.cursor];
                }
            }

            var op = node.op;
            if (definitions.assignOps[op] && input[this.cursor] === '=') {
                this.cursor++;
                token.type = ASSIGN;
                token.assignOp = definitions.tokenIds[definitions.opTypeNames[op]];
                op += '=';
            } else {
                token.type = definitions.tokenIds[definitions.opTypeNames[op]];
                token.assignOp = null;
            }

            token.value = op;
        },

        // FIXME: Unicode escape sequences
        // FIXME: Unicode identifiers
        lexIdent: function (ch) {
            var token = this.token, input = this.source;

            do {
                ch = input[this.cursor++];
            } while ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
                     (ch >= '0' && ch <= '9') || ch === '$' || ch === '_');

            this.cursor--;  // Put the non-word character back.

            var id = input.substring(token.start, this.cursor);
            token.type = definitions.keywords[id] || IDENTIFIER;
            token.value = id;
        },

        /*
         * Tokenizer.get :: void -> token type
         *
         * Consume input *only* if there is no lookahead.
         * Dispatch to the appropriate lexing function depending on the input.
         */
        get: function (scanOperand) {
            var token;
            while (this.lookahead) {
                --this.lookahead;
                this.tokenIndex = (this.tokenIndex + 1) & 3;
                token = this.tokens[this.tokenIndex];
                if (token.type !== NEWLINE || this.scanNewlines)
                    return token.type;
            }

            this.skip();

            this.tokenIndex = (this.tokenIndex + 1) & 3;
            token = this.tokens[this.tokenIndex];
            if (!token)
                this.tokens[this.tokenIndex] = token = {};

            var input = this.source;
            if (this.cursor === input.length)
                return token.type = END;

            token.start = this.cursor;
            token.lineno = this.lineno;

            var ch = input[this.cursor++];
            if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '$' || ch === '_') {
                this.lexIdent(ch);
            } else if (scanOperand && ch === '/') {
                this.lexRegExp(ch);
            } else if (ch in opTokens) {
                this.lexOp(ch);
            } else if (ch === '.') {
                this.lexDot(ch);
            } else if (ch >= '1' && ch <= '9') {
                this.lexNumber(ch);
            } else if (ch === '0') {
                this.lexZeroNumber(ch);
            } else if (ch === '"' || ch === "'") {
                this.lexString(ch);
            } else if (this.scanNewlines && ch === '\n') {
                token.type = NEWLINE;
                token.value = '\n';
                this.lineno++;
            } else {
                throw this.newSyntaxError("Illegal token");
            }

            token.end = this.cursor;
            return token.type;
        },

        /*
         * Tokenizer.unget :: void -> undefined
         *
         * Match depends on unget returning undefined.
         */
        unget: function () {
            if (++this.lookahead === 4) throw "PANIC: too much lookahead!";
            this.tokenIndex = (this.tokenIndex - 1) & 3;
        },

        newSyntaxError: function (m) {
            var e = new SyntaxError(this.filename + ":" + this.lineno + ":" + m);
            e.source = this.source;
            e.cursor = this.lookahead
                       ? this.tokens[(this.tokenIndex + this.lookahead) & 3].start
                       : this.cursor;
            return e;
        },
    };

    return { Tokenizer: Tokenizer };

}());
/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; -*-
 * vim: set sw=4 ts=4 et tw=78:
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narcissus JavaScript engine.
 *
 * The Initial Developer of the Original Code is
 * Brendan Eich <brendan@mozilla.org>.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Tom Austin <taustin@ucsc.edu>
 *   Brendan Eich <brendan@mozilla.org>
 *   Shu-Yu Guo <shu@rfrn.org>
 *   Dave Herman <dherman@mozilla.com>
 *   Dimitris Vardoulakis <dimvar@ccs.neu.edu>
 *   Patrick Walton <pcwalton@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * Narcissus - JS implemented in JS.
 *
 * Parser.
 */

Narcissus.parser = (function() {

    var lexer = Narcissus.lexer;
    var definitions = Narcissus.definitions;

    const StringMap = definitions.StringMap;
    const Stack = definitions.Stack;

    // Set constants in the local scope.
    eval(definitions.consts);

    /*
     * pushDestructuringVarDecls :: (node, hoisting node) -> void
     *
     * Recursively add all destructured declarations to varDecls.
     */
    function pushDestructuringVarDecls(n, s) {
        for (var i in n) {
            var sub = n[i];
            if (sub.type === IDENTIFIER) {
                s.varDecls.push(sub);
            } else {
                pushDestructuringVarDecls(sub, s);
            }
        }
    }

    // NESTING_TOP: top-level
    // NESTING_SHALLOW: nested within static forms such as { ... } or labeled statement
    // NESTING_DEEP: nested within dynamic forms such as if, loops, etc.
    const NESTING_TOP = 0, NESTING_SHALLOW = 1, NESTING_DEEP = 2;

    function StaticContext(parentScript, parentBlock, inFunction, inForLoopInit, nesting) {
        this.parentScript = parentScript;
        this.parentBlock = parentBlock;
        this.inFunction = inFunction;
        this.inForLoopInit = inForLoopInit;
        this.nesting = nesting;
        this.allLabels = new Stack();
        this.currentLabels = new Stack();
        this.labeledTargets = new Stack();
        this.defaultTarget = null;
        Narcissus.options.ecma3OnlyMode && (this.ecma3OnlyMode = true);
        Narcissus.options.parenFreeMode && (this.parenFreeMode = true);
    }

    StaticContext.prototype = {
        ecma3OnlyMode: false,
        parenFreeMode: false,
        // non-destructive update via prototype extension
        update: function(ext) {
            var desc = {};
            for (var key in ext) {
                desc[key] = {
                    value: ext[key],
                    writable: true,
                    enumerable: true,
                    configurable: true
                }
            }
            return Object.create(this, desc);
        },
        pushLabel: function(label) {
            return this.update({ currentLabels: this.currentLabels.push(label),
                                 allLabels: this.allLabels.push(label) });
        },
        pushTarget: function(target) {
            var isDefaultTarget = target.isLoop || target.type === SWITCH;
            if (isDefaultTarget) target.target = this.defaultTarget;

            if (this.currentLabels.isEmpty()) {
                return isDefaultTarget
                     ? this.update({ defaultTarget: target })
                     : this;
            }

            target.labels = new StringMap();
            this.currentLabels.forEach(function(label) {
                target.labels.set(label, true);
            });
            return this.update({ currentLabels: new Stack(),
                                 labeledTargets: this.labeledTargets.push(target),
                                 defaultTarget: isDefaultTarget
                                                ? target
                                                : this.defaultTarget });
        },
        nest: function(atLeast) {
            var nesting = Math.max(this.nesting, atLeast);
            return (nesting !== this.nesting)
                 ? this.update({ nesting: nesting })
                 : this;
        }
    };

    /*
     * Script :: (tokenizer, boolean) -> node
     *
     * Parses the toplevel and function bodies.
     */
    function Script(t, inFunction) {
        var n = new Node(t, scriptInit());
        var x = new StaticContext(n, n, inFunction, false, NESTING_TOP);
        Statements(t, x, n);
        return n;
    }

    // We extend Array slightly with a top-of-stack method.
    definitions.defineProperty(Array.prototype, "top",
                               function() {
                                   return this.length && this[this.length-1];
                               }, false, false, true);

    /*
     * Node :: (tokenizer, optional init object) -> node
     */
    function Node(t, init) {
        var token = t.token;
        if (token) {
            // If init.type exists it will override token.type.
            this.type = token.type;
            this.value = token.value;
            this.lineno = token.lineno;

            // Start and end are file positions for error handling.
            this.start = token.start;
            this.end = token.end;
        } else {
            this.lineno = t.lineno;
        }

        // Node uses a tokenizer for debugging (getSource, filename getter).
        this.tokenizer = t;
        this.children = [];

        for (var prop in init)
            this[prop] = init[prop];
    }

    var Np = Node.prototype = {};
    Np.constructor = Node;
    Np.toSource = Object.prototype.toSource;

    // Always use push to add operands to an expression, to update start and end.
    Np.push = function (kid) {
        // kid can be null e.g. [1, , 2].
        if (kid !== null) {
            if (kid.start < this.start)
                this.start = kid.start;
            if (this.end < kid.end)
                this.end = kid.end;
        }
        return this.children.push(kid);
    }

    Node.indentLevel = 0;

    function tokenString(tt) {
        var t = definitions.tokens[tt];
        return /^\W/.test(t) ? definitions.opTypeNames[t] : t.toUpperCase();
    }

    Np.toString = function () {
        var a = [];
        for (var i in this) {
            if (this.hasOwnProperty(i) && i !== 'type' && i !== 'target')
                a.push({id: i, value: this[i]});
        }
        a.sort(function (a,b) { return (a.id < b.id) ? -1 : 1; });
        const INDENTATION = "    ";
        var n = ++Node.indentLevel;
        var s = "{\n" + INDENTATION.repeat(n) + "type: " + tokenString(this.type);
        for (i = 0; i < a.length; i++)
            s += ", " + a[i].id + ": " + a[i].value;
            //s += ",\n" + INDENTATION.repeat(n) + a[i].id + ": " + a[i].value;
        n = --Node.indentLevel;
        s += "\n" + INDENTATION.repeat(n) + "}";
        return s;
    }

    Np.getSource = function () {
        return this.tokenizer.source.slice(this.start, this.end);
    };

    /*
     * Helper init objects for common nodes.
     */

    const LOOP_INIT = { isLoop: true };

    function blockInit() {
        return { type: BLOCK, varDecls: [] };
    }

    function scriptInit() {
        return { type: SCRIPT,
                 funDecls: [],
                 varDecls: [],
                 modDecls: [],
                 impDecls: [],
                 expDecls: [],
                 loadDeps: [],
                 hasEmptyReturn: false,
                 hasReturnWithValue: false,
                 isGenerator: false };
    }

    definitions.defineGetter(Np, "filename",
                             function() {
                                 return this.tokenizer.filename;
                             });

    definitions.defineGetter(Np, "length",
                             function() {
                                 throw new Error("Node.prototype.length is gone; " +
                                                 "use n.children.length instead");
                             });

    definitions.defineProperty(String.prototype, "repeat",
                               function(n) {
                                   var s = "", t = this + s;
                                   while (--n >= 0)
                                       s += t;
                                   return s;
                               }, false, false, true);

    function MaybeLeftParen(t, x) {
        if (x.parenFreeMode)
            return t.match(LEFT_PAREN) ? LEFT_PAREN : END;
        return t.mustMatch(LEFT_PAREN).type;
    }

    function MaybeRightParen(t, p) {
        if (p === LEFT_PAREN)
            t.mustMatch(RIGHT_PAREN);
    }

    /*
     * Statements :: (tokenizer, compiler context, node) -> void
     *
     * Parses a sequence of Statements.
     */
    function Statements(t, x, n) {
        try {
            while (!t.done && t.peek(true) !== RIGHT_CURLY)
                n.push(Statement(t, x));
        } catch (e) {
            if (t.done)
                t.unexpectedEOF = true;
            throw e;
        }
    }

    function Block(t, x) {
        t.mustMatch(LEFT_CURLY);
        var n = new Node(t, blockInit());
        Statements(t, x.update({ parentBlock: n }).pushTarget(n), n);
        t.mustMatch(RIGHT_CURLY);
        n.end = t.token.end;
        return n;
    }

    const DECLARED_FORM = 0, EXPRESSED_FORM = 1, STATEMENT_FORM = 2;

    /*
     * Statement :: (tokenizer, compiler context) -> node
     *
     * Parses a Statement.
     */
    function Statement(t, x) {
        var i, label, n, n2, p, c, ss, tt = t.get(true), tt2, x2, x3;

        // Cases for statements ending in a right curly return early, avoiding the
        // common semicolon insertion magic after this switch.
        switch (tt) {
          case FUNCTION:
            // DECLARED_FORM extends funDecls of x, STATEMENT_FORM doesn't.
            return FunctionDefinition(t, x, true,
                                      (x.nesting !== NESTING_TOP)
                                      ? STATEMENT_FORM
                                      : DECLARED_FORM);

          case LEFT_CURLY:
            n = new Node(t, blockInit());
            Statements(t, x.update({ parentBlock: n }).pushTarget(n).nest(NESTING_SHALLOW), n);
            t.mustMatch(RIGHT_CURLY);
            n.end = t.token.end;
            return n;

          case IF:
            n = new Node(t);
            n.condition = HeadExpression(t, x);
            x2 = x.pushTarget(n).nest(NESTING_DEEP);
            n.thenPart = Statement(t, x2);
            n.elsePart = t.match(ELSE) ? Statement(t, x2) : null;
            return n;

          case SWITCH:
            // This allows CASEs after a DEFAULT, which is in the standard.
            n = new Node(t, { cases: [], defaultIndex: -1 });
            n.discriminant = HeadExpression(t, x);
            x2 = x.pushTarget(n).nest(NESTING_DEEP);
            t.mustMatch(LEFT_CURLY);
            while ((tt = t.get()) !== RIGHT_CURLY) {
                switch (tt) {
                  case DEFAULT:
                    if (n.defaultIndex >= 0)
                        throw t.newSyntaxError("More than one switch default");
                    // FALL THROUGH
                  case CASE:
                    n2 = new Node(t);
                    if (tt === DEFAULT)
                        n.defaultIndex = n.cases.length;
                    else
                        n2.caseLabel = Expression(t, x2, COLON);
                    break;

                  default:
                    throw t.newSyntaxError("Invalid switch case");
                }
                t.mustMatch(COLON);
                n2.statements = new Node(t, blockInit());
                while ((tt=t.peek(true)) !== CASE && tt !== DEFAULT &&
                        tt !== RIGHT_CURLY)
                    n2.statements.push(Statement(t, x2));
                n.cases.push(n2);
            }
            n.end = t.token.end;
            return n;

          case FOR:
            n = new Node(t, LOOP_INIT);
            if (t.match(IDENTIFIER)) {
                if (t.token.value === "each")
                    n.isEach = true;
                else
                    t.unget();
            }
            if (!x.parenFreeMode)
                t.mustMatch(LEFT_PAREN);
            x2 = x.pushTarget(n).nest(NESTING_DEEP);
            x3 = x.update({ inForLoopInit: true });
            if ((tt = t.peek()) !== SEMICOLON) {
                if (tt === VAR || tt === CONST) {
                    t.get();
                    n2 = Variables(t, x3);
                } else if (tt === LET) {
                    t.get();
                    if (t.peek() === LEFT_PAREN) {
                        n2 = LetBlock(t, x3, false);
                    } else {
                        // Let in for head, we need to add an implicit block
                        // around the rest of the for.
                        x3.parentBlock = n;
                        n.varDecls = [];
                        n2 = Variables(t, x3);
                    }
                } else {
                    n2 = Expression(t, x3);
                }
            }
            if (n2 && t.match(IN)) {
                n.type = FOR_IN;
                n.object = Expression(t, x3);
                if (n2.type === VAR || n2.type === LET) {
                    c = n2.children;

                    // Destructuring turns one decl into multiples, so either
                    // there must be only one destructuring or only one
                    // decl.
                    if (c.length !== 1 && n2.destructurings.length !== 1) {
                        throw new SyntaxError("Invalid for..in left-hand side",
                                              t.filename, n2.lineno);
                    }
                    if (n2.destructurings.length > 0) {
                        n.iterator = n2.destructurings[0];
                    } else {
                        n.iterator = c[0];
                    }
                    n.varDecl = n2;
                } else {
                    if (n2.type === ARRAY_INIT || n2.type === OBJECT_INIT) {
                        n2.destructuredNames = checkDestructuring(t, x3, n2);
                    }
                    n.iterator = n2;
                }
            } else {
                n.setup = n2;
                t.mustMatch(SEMICOLON);
                if (n.isEach)
                    throw t.newSyntaxError("Invalid for each..in loop");
                n.condition = (t.peek() === SEMICOLON)
                              ? null
                              : Expression(t, x3);
                t.mustMatch(SEMICOLON);
                tt2 = t.peek();
                n.update = (x.parenFreeMode
                            ? tt2 === LEFT_CURLY || definitions.isStatementStartCode[tt2]
                            : tt2 === RIGHT_PAREN)
                           ? null
                           : Expression(t, x3);
            }
            if (!x.parenFreeMode)
                t.mustMatch(RIGHT_PAREN);
            n.body = Statement(t, x2);
            n.end = t.token.end;
            return n;

          case WHILE:
            n = new Node(t, { isLoop: true });
            n.condition = HeadExpression(t, x);
            n.body = Statement(t, x.pushTarget(n).nest(NESTING_DEEP));
            n.end = t.token.end;
            return n;

          case DO:
            n = new Node(t, { isLoop: true });
            n.body = Statement(t, x.pushTarget(n).nest(NESTING_DEEP));
            t.mustMatch(WHILE);
            n.condition = HeadExpression(t, x);
            if (!x.ecmaStrictMode) {
                // <script language="JavaScript"> (without version hints) may need
                // automatic semicolon insertion without a newline after do-while.
                // See http://bugzilla.mozilla.org/show_bug.cgi?id=238945.
                t.match(SEMICOLON);
                n.end = t.token.end;
                return n;
            }
            break;

          case BREAK:
          case CONTINUE:
            n = new Node(t);

            // handle the |foo: break foo;| corner case
            x2 = x.pushTarget(n);

            if (t.peekOnSameLine() === IDENTIFIER) {
                t.get();
                n.label = t.token.value;
            }

            n.target = n.label
                     ? x2.labeledTargets.find(function(target) { return target.labels.has(n.label) })
                     : x2.defaultTarget;

            if (!n.target)
                throw t.newSyntaxError("Invalid " + ((tt === BREAK) ? "break" : "continue"));
            //if (!n.target.isLoop && tt === CONTINUE)
            //    throw t.newSyntaxError("Invalid continue");
            if (tt === CONTINUE) {
                for (var ttt = n.target; ttt && !ttt.isLoop; ttt = ttt.target)
                    ;
                if (!ttt) throw t.newSyntaxError("Invalid continue");
            }

            break;

          case TRY:
            n = new Node(t, { catchClauses: [] });
            n.tryBlock = Block(t, x);
            while (t.match(CATCH)) {
                n2 = new Node(t);
                p = MaybeLeftParen(t, x);
                switch (t.get()) {
                  case LEFT_BRACKET:
                  case LEFT_CURLY:
                    // Destructured catch identifiers.
                    t.unget();
                    n2.varName = DestructuringExpression(t, x, true);
                    break;
                  case IDENTIFIER:
                    n2.varName = t.token.value;
                    break;
                  default:
                    throw t.newSyntaxError("missing identifier in catch");
                    break;
                }
                if (t.match(IF)) {
                    if (x.ecma3OnlyMode)
                        throw t.newSyntaxError("Illegal catch guard");
                    if (n.catchClauses.length && !n.catchClauses.top().guard)
                        throw t.newSyntaxError("Guarded catch after unguarded");
                    n2.guard = Expression(t, x);
                }
                MaybeRightParen(t, p);
                n2.block = Block(t, x);
                n.catchClauses.push(n2);
            }
            if (t.match(FINALLY))
                n.finallyBlock = Block(t, x);
            if (!n.catchClauses.length && !n.finallyBlock)
                throw t.newSyntaxError("Invalid try statement");
            n.end = t.token.end;
            return n;

          case CATCH:
          case FINALLY:
            throw t.newSyntaxError(definitions.tokens[tt] + " without preceding try");

          case THROW:
            n = new Node(t);
            n.exception = Expression(t, x);
            break;

          case RETURN:
            n = ReturnOrYield(t, x);
            break;

          case WITH:
            n = new Node(t);
            n.object = HeadExpression(t, x);
            n.body = Statement(t, x.pushTarget(n).nest(NESTING_DEEP));
            n.end = t.token.end;
            return n;

          case VAR:
          case CONST:
            n = Variables(t, x);
            n.eligibleForASI = true;
            break;

          case LET:
            if (t.peek() === LEFT_PAREN)
                n = LetBlock(t, x, true);
            else
                n = Variables(t, x);
            n.eligibleForASI = true;
            break;

          case DEBUGGER:
            n = new Node(t);
            break;

          case NEWLINE:
          case SEMICOLON:
            n = new Node(t, { type: SEMICOLON });
            n.expression = null;
            return n;

          default:
            if (tt === IDENTIFIER) {
                tt = t.peek();
                // Labeled statement.
                if (tt === COLON) {
                    label = t.token.value;
                    if (x.allLabels.has(label))
                        throw t.newSyntaxError("Duplicate label");
                    t.get();
                    n = new Node(t, { type: LABEL, label: label });
                    n.statement = Statement(t, x.pushLabel(label).nest(NESTING_SHALLOW));
                    n.target = (n.statement.type === LABEL) ? n.statement.target : n.statement;
                    n.end = t.token.end;
                    return n;
                }
            }

            // Expression statement.
            // We unget the current token to parse the expression as a whole.
            n = new Node(t, { type: SEMICOLON });
            t.unget();
            n.expression = Expression(t, x);
            n.end = n.expression.end;
            break;
        }

        MagicalSemicolon(t);
        n.end = t.token.end;
        return n;
    }

    function MagicalSemicolon(t) {
        var tt;
        if (t.lineno === t.token.lineno) {
            tt = t.peekOnSameLine();
            if (tt !== END && tt !== NEWLINE && tt !== SEMICOLON && tt !== RIGHT_CURLY)
                throw t.newSyntaxError("missing ; before statement");
        }
        t.match(SEMICOLON);
    }

    function ReturnOrYield(t, x) {
        var n, b, tt = t.token.type, tt2;

        var parentScript = x.parentScript;

        if (tt === RETURN) {
            // Disabled test because node accepts return at top level in modules
            if (false && !x.inFunction)
                throw t.newSyntaxError("Return not in function");
        } else /* if (tt === YIELD) */ {
            if (!x.inFunction)
                throw t.newSyntaxError("Yield not in function");
            parentScript.isGenerator = true;
        }
        n = new Node(t, { value: undefined });

        tt2 = t.peek(true);
        if (tt2 !== END && tt2 !== NEWLINE &&
            tt2 !== SEMICOLON && tt2 !== RIGHT_CURLY
            && (tt !== YIELD ||
                (tt2 !== tt && tt2 !== RIGHT_BRACKET && tt2 !== RIGHT_PAREN &&
                 tt2 !== COLON && tt2 !== COMMA))) {
            if (tt === RETURN) {
                n.value = Expression(t, x);
                parentScript.hasReturnWithValue = true;
            } else {
                n.value = AssignExpression(t, x);
            }
        } else if (tt === RETURN) {
            parentScript.hasEmptyReturn = true;
        }

        // Disallow return v; in generator.
        if (parentScript.hasReturnWithValue && parentScript.isGenerator)
            throw t.newSyntaxError("Generator returns a value");

        return n;
    }

    /*
     * FunctionDefinition :: (tokenizer, compiler context, boolean,
     *                        DECLARED_FORM or EXPRESSED_FORM or STATEMENT_FORM)
     *                    -> node
     */
    function FunctionDefinition(t, x, requireName, functionForm) {
        var tt;
        var f = new Node(t, { params: [] });
        if (f.type !== FUNCTION)
            f.type = (f.value === "get") ? GETTER : SETTER;
        if (t.match(IDENTIFIER))
            f.name = t.token.value;
        else if (requireName)
            throw t.newSyntaxError("missing function identifier");

        var x2 = new StaticContext(null, null, true, false, NESTING_TOP);

        t.mustMatch(LEFT_PAREN);
        if (!t.match(RIGHT_PAREN)) {
            do {
                switch (t.get()) {
                  case LEFT_BRACKET:
                  case LEFT_CURLY:
                    // Destructured formal parameters.
                    t.unget();
                    f.params.push(DestructuringExpression(t, x2));
                    break;
                  case IDENTIFIER:
                    f.params.push(t.token.value);
                    break;
                  default:
                    throw t.newSyntaxError("missing formal parameter");
                    break;
                }
            } while (t.match(COMMA));
            t.mustMatch(RIGHT_PAREN);
        }

        // Do we have an expression closure or a normal body?
        tt = t.get();
        if (tt !== LEFT_CURLY)
            t.unget();

        if (tt !== LEFT_CURLY) {
            f.body = AssignExpression(t, x2);
            if (f.body.isGenerator)
                throw t.newSyntaxError("Generator returns a value");
        } else {
            f.body = Script(t, true);
        }

        if (tt === LEFT_CURLY)
            t.mustMatch(RIGHT_CURLY);

        f.end = t.token.end;
        f.functionForm = functionForm;
        if (functionForm === DECLARED_FORM)
            x.parentScript.funDecls.push(f);
        return f;
    }

    /*
     * Variables :: (tokenizer, compiler context) -> node
     *
     * Parses a comma-separated list of var declarations (and maybe
     * initializations).
     */
    function Variables(t, x, letBlock) {
        var n, n2, ss, i, s, tt;

        tt = t.token.type;
        switch (tt) {
          case VAR:
          case CONST:
            s = x.parentScript;
            break;
          case LET:
            s = x.parentBlock;
            break;
          case LEFT_PAREN:
            tt = LET;
            s = letBlock;
            break;
        }

        n = new Node(t, { type: tt, destructurings: [] });

        do {
            tt = t.get();
            if (tt === LEFT_BRACKET || tt === LEFT_CURLY) {
                // Need to unget to parse the full destructured expression.
                t.unget();

                var dexp = DestructuringExpression(t, x, true);

                n2 = new Node(t, { type: IDENTIFIER,
                                   name: dexp,
                                   readOnly: n.type === CONST });
                n.push(n2);
                pushDestructuringVarDecls(n2.name.destructuredNames, s);
                n.destructurings.push({ exp: dexp, decl: n2 });

                if (x.inForLoopInit && t.peek() === IN) {
                    continue;
                }

                t.mustMatch(ASSIGN);
                if (t.token.assignOp)
                    throw t.newSyntaxError("Invalid variable initialization");

                n2.initializer = AssignExpression(t, x);

                continue;
            }

            if (tt !== IDENTIFIER)
                throw t.newSyntaxError("missing variable name");

            n2 = new Node(t, { type: IDENTIFIER,
                               name: t.token.value,
                               readOnly: n.type === CONST });
            n.push(n2);
            s.varDecls.push(n2);

            if (t.match(ASSIGN)) {
                if (t.token.assignOp)
                    throw t.newSyntaxError("Invalid variable initialization");

                n2.initializer = AssignExpression(t, x);
            }
        } while (t.match(COMMA));

        n.end = t.token.end;
        return n;
    }

    /*
     * LetBlock :: (tokenizer, compiler context, boolean) -> node
     *
     * Does not handle let inside of for loop init.
     */
    function LetBlock(t, x, isStatement) {
        var n, n2;

        // t.token.type must be LET
        n = new Node(t, { type: LET_BLOCK, varDecls: [] });
        t.mustMatch(LEFT_PAREN);
        n.variables = Variables(t, x, n);
        t.mustMatch(RIGHT_PAREN);

        if (isStatement && t.peek() !== LEFT_CURLY) {
            /*
             * If this is really an expression in let statement guise, then we
             * need to wrap the LET_BLOCK node in a SEMICOLON node so that we pop
             * the return value of the expression.
             */
            n2 = new Node(t, { type: SEMICOLON,
                               expression: n });
            isStatement = false;
        }

        if (isStatement)
            n.block = Block(t, x);
        else
            n.expression = AssignExpression(t, x);

        return n;
    }

    function checkDestructuring(t, x, n, simpleNamesOnly) {
        if (n.type === ARRAY_COMP)
            throw t.newSyntaxError("Invalid array comprehension left-hand side");
        if (n.type !== ARRAY_INIT && n.type !== OBJECT_INIT)
            return;

        var lhss = {};
        var nn, n2, idx, sub, cc, c = n.children;
        for (var i = 0, j = c.length; i < j; i++) {
            if (!(nn = c[i]))
                continue;
            if (nn.type === PROPERTY_INIT) {
                cc = nn.children;
                sub = cc[1];
                idx = cc[0].value;
            } else if (n.type === OBJECT_INIT) {
                // Do we have destructuring shorthand {foo, bar}?
                sub = nn;
                idx = nn.value;
            } else {
                sub = nn;
                idx = i;
            }

            if (sub.type === ARRAY_INIT || sub.type === OBJECT_INIT) {
                lhss[idx] = checkDestructuring(t, x, sub, simpleNamesOnly);
            } else {
                if (simpleNamesOnly && sub.type !== IDENTIFIER) {
                    // In declarations, lhs must be simple names
                    throw t.newSyntaxError("missing name in pattern");
                }

                lhss[idx] = sub;
            }
        }

        return lhss;
    }

    function DestructuringExpression(t, x, simpleNamesOnly) {
        var n = PrimaryExpression(t, x);
        // Keep the list of lefthand sides for varDecls
        n.destructuredNames = checkDestructuring(t, x, n, simpleNamesOnly);
        return n;
    }

    function GeneratorExpression(t, x, e) {
        return new Node(t, { type: GENERATOR,
                             expression: e,
                             tail: ComprehensionTail(t, x) });
    }

    function ComprehensionTail(t, x) {
        var body, n, n2, n3, p;

        // t.token.type must be FOR
        body = new Node(t, { type: COMP_TAIL });

        do {
            // Comprehension tails are always for..in loops.
            n = new Node(t, { type: FOR_IN, isLoop: true });
            if (t.match(IDENTIFIER)) {
                // But sometimes they're for each..in.
                if (t.token.value === "each")
                    n.isEach = true;
                else
                    t.unget();
            }
            p = MaybeLeftParen(t, x);
            switch(t.get()) {
              case LEFT_BRACKET:
              case LEFT_CURLY:
                t.unget();
                // Destructured left side of for in comprehension tails.
                n.iterator = DestructuringExpression(t, x);
                break;

              case IDENTIFIER:
                n.iterator = n3 = new Node(t, { type: IDENTIFIER });
                n3.name = n3.value;
                n.varDecl = n2 = new Node(t, { type: VAR });
                n2.push(n3);
                x.parentScript.varDecls.push(n3);
                // Don't add to varDecls since the semantics of comprehensions is
                // such that the variables are in their own function when
                // desugared.
                break;

              default:
                throw t.newSyntaxError("missing identifier");
            }
            t.mustMatch(IN);
            n.object = Expression(t, x);
            MaybeRightParen(t, p);
            body.push(n);
        } while (t.match(FOR));

        // Optional guard.
        if (t.match(IF))
            body.guard = HeadExpression(t, x);

        return body;
    }

    function HeadExpression(t, x) {
        var p = MaybeLeftParen(t, x);
        var n = ParenExpression(t, x);
        MaybeRightParen(t, p);
        if (p === END && !n.parenthesized) {
            var tt = t.peek();
            if (tt !== LEFT_CURLY && !definitions.isStatementStartCode[tt])
                throw t.newSyntaxError("Unparenthesized head followed by unbraced body");
        }
        return n;
    }

    function ParenExpression(t, x) {
        // Always accept the 'in' operator in a parenthesized expression,
        // where it's unambiguous, even if we might be parsing the init of a
        // for statement.
        var n = Expression(t, x.update({ inForLoopInit: x.inForLoopInit &&
                                                        (t.token.type === LEFT_PAREN) }));

        if (t.match(FOR)) {
            if (n.type === YIELD && !n.parenthesized)
                throw t.newSyntaxError("Yield expression must be parenthesized");
            if (n.type === COMMA && !n.parenthesized)
                throw t.newSyntaxError("Generator expression must be parenthesized");
            n = GeneratorExpression(t, x, n);
        }

        return n;
    }

    /*
     * Expression :: (tokenizer, compiler context) -> node
     *
     * Top-down expression parser matched against SpiderMonkey.
     */
    function Expression(t, x) {
        var n, n2;

        n = AssignExpression(t, x);
        if (t.match(COMMA)) {
            n2 = new Node(t, { type: COMMA });
            n2.push(n);
            n = n2;
            do {
                n2 = n.children[n.children.length-1];
                if (n2.type === YIELD && !n2.parenthesized)
                    throw t.newSyntaxError("Yield expression must be parenthesized");
                n.push(AssignExpression(t, x));
            } while (t.match(COMMA));
        }

        return n;
    }

    function AssignExpression(t, x) {
        var n, lhs;

        // Have to treat yield like an operand because it could be the leftmost
        // operand of the expression.
        if (t.match(YIELD, true))
            return ReturnOrYield(t, x);

        n = new Node(t, { type: ASSIGN });
        lhs = ConditionalExpression(t, x);

        if (!t.match(ASSIGN)) {
            return lhs;
        }

        switch (lhs.type) {
          case OBJECT_INIT:
          case ARRAY_INIT:
            lhs.destructuredNames = checkDestructuring(t, x, lhs);
            // FALL THROUGH
          case IDENTIFIER: case DOT: case INDEX: case CALL:
            break;
          default:
            throw t.newSyntaxError("Bad left-hand side of assignment");
            break;
        }

        n.assignOp = t.token.assignOp;
        n.push(lhs);
        n.push(AssignExpression(t, x));

        return n;
    }

    function ConditionalExpression(t, x) {
        var n, n2;

        n = OrExpression(t, x);
        if (t.match(HOOK)) {
            n2 = n;
            n = new Node(t, { type: HOOK });
            n.push(n2);
            /*
             * Always accept the 'in' operator in the middle clause of a ternary,
             * where it's unambiguous, even if we might be parsing the init of a
             * for statement.
             */
            n.push(AssignExpression(t, x.update({ inForLoopInit: false })));
            if (!t.match(COLON))
                throw t.newSyntaxError("missing : after ?");
            n.push(AssignExpression(t, x));
        }

        return n;
    }

    function OrExpression(t, x) {
        var n, n2;

        n = AndExpression(t, x);
        while (t.match(OR)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(AndExpression(t, x));
            n = n2;
        }

        return n;
    }

    function AndExpression(t, x) {
        var n, n2;

        n = BitwiseOrExpression(t, x);
        while (t.match(AND)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(BitwiseOrExpression(t, x));
            n = n2;
        }

        return n;
    }

    function BitwiseOrExpression(t, x) {
        var n, n2;

        n = BitwiseXorExpression(t, x);
        while (t.match(BITWISE_OR)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(BitwiseXorExpression(t, x));
            n = n2;
        }

        return n;
    }

    function BitwiseXorExpression(t, x) {
        var n, n2;

        n = BitwiseAndExpression(t, x);
        while (t.match(BITWISE_XOR)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(BitwiseAndExpression(t, x));
            n = n2;
        }

        return n;
    }

    function BitwiseAndExpression(t, x) {
        var n, n2;

        n = EqualityExpression(t, x);
        while (t.match(BITWISE_AND)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(EqualityExpression(t, x));
            n = n2;
        }

        return n;
    }

    function EqualityExpression(t, x) {
        var n, n2;

        n = RelationalExpression(t, x);
        while (t.match(EQ) || t.match(NE) ||
               t.match(STRICT_EQ) || t.match(STRICT_NE)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(RelationalExpression(t, x));
            n = n2;
        }

        return n;
    }

    function RelationalExpression(t, x) {
        var n, n2;

        /*
         * Uses of the in operator in shiftExprs are always unambiguous,
         * so unset the flag that prohibits recognizing it.
         */
        var x2 = x.update({ inForLoopInit: false });
        n = ShiftExpression(t, x2);
        while ((t.match(LT) || t.match(LE) || t.match(GE) || t.match(GT) ||
               (!x.inForLoopInit && t.match(IN)) ||
               t.match(INSTANCEOF))) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(ShiftExpression(t, x2));
            n = n2;
        }

        return n;
    }

    function ShiftExpression(t, x) {
        var n, n2;

        n = AddExpression(t, x);
        while (t.match(LSH) || t.match(RSH) || t.match(URSH)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(AddExpression(t, x));
            n = n2;
        }

        return n;
    }

    function AddExpression(t, x) {
        var n, n2;

        n = MultiplyExpression(t, x);
        while (t.match(PLUS) || t.match(MINUS)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(MultiplyExpression(t, x));
            n = n2;
        }

        return n;
    }

    function MultiplyExpression(t, x) {
        var n, n2;

        n = UnaryExpression(t, x);
        while (t.match(MUL) || t.match(DIV) || t.match(MOD)) {
            n2 = new Node(t);
            n2.push(n);
            n2.push(UnaryExpression(t, x));
            n = n2;
        }

        return n;
    }

    function UnaryExpression(t, x) {
        var n, n2, tt;

        switch (tt = t.get(true)) {
          case DELETE: case VOID: case TYPEOF:
          case NOT: case BITWISE_NOT: case PLUS: case MINUS:
            if (tt === PLUS)
                n = new Node(t, { type: UNARY_PLUS });
            else if (tt === MINUS)
                n = new Node(t, { type: UNARY_MINUS });
            else
                n = new Node(t);
            n.push(UnaryExpression(t, x));
            break;

          case INCREMENT:
          case DECREMENT:
            // Prefix increment/decrement.
            n = new Node(t);
            n.push(MemberExpression(t, x, true));
            break;

          default:
            t.unget();
            n = MemberExpression(t, x, true);

            // Don't look across a newline boundary for a postfix {in,de}crement.
            if (t.tokens[(t.tokenIndex + t.lookahead - 1) & 3].lineno ===
                t.lineno) {
                if (t.match(INCREMENT) || t.match(DECREMENT)) {
                    n2 = new Node(t, { postfix: true });
                    n2.push(n);
                    n = n2;
                }
            }
            break;
        }

        return n;
    }

    function MemberExpression(t, x, allowCallSyntax) {
        var n, n2, name, tt;

        if (t.match(NEW)) {
            n = new Node(t);
            n.push(MemberExpression(t, x, false));
            if (t.match(LEFT_PAREN)) {
                n.type = NEW_WITH_ARGS;
                n.push(ArgumentList(t, x));
            }
        } else {
            n = PrimaryExpression(t, x);
        }

        while ((tt = t.get()) !== END) {
            switch (tt) {
              case DOT:
                n2 = new Node(t);
                n2.push(n);
                t.forceIdentifier();
                n2.push(new Node(t));
                break;

              case LEFT_BRACKET:
                n2 = new Node(t, { type: INDEX });
                n2.push(n);
                n2.push(Expression(t, x));
                t.mustMatch(RIGHT_BRACKET);
                n2.end = t.token.end;
                break;

              case LEFT_PAREN:
                if (allowCallSyntax) {
                    n2 = new Node(t, { type: CALL });
                    n2.push(n);
                    n2.push(ArgumentList(t, x));
                    break;
                }

                // FALL THROUGH
              default:
                t.unget();
                return n;
            }

            n = n2;
        }

        return n;
    }

    function ArgumentList(t, x) {
        var n, n2;

        n = new Node(t, { type: LIST });
        if (t.match(RIGHT_PAREN, true)) {
            n.end = t.token.end;
            return n;
        }
        do {
            n2 = AssignExpression(t, x);
            if (n2.type === YIELD && !n2.parenthesized && t.peek() === COMMA)
                throw t.newSyntaxError("Yield expression must be parenthesized");
            if (t.match(FOR)) {
                n2 = GeneratorExpression(t, x, n2);
                if (n.children.length > 1 || t.peek(true) === COMMA)
                    throw t.newSyntaxError("Generator expression must be parenthesized");
            }
            n.push(n2);
        } while (t.match(COMMA));
        t.mustMatch(RIGHT_PAREN);
        n.end = t.token.end;

        return n;
    }

    function PrimaryExpression(t, x) {
        var n, n2, tt = t.get(true);

        switch (tt) {
          case FUNCTION:
            n = FunctionDefinition(t, x, false, EXPRESSED_FORM);
            break;

          case LEFT_BRACKET:
            n = new Node(t, { type: ARRAY_INIT });
            while ((tt = t.peek(true)) !== RIGHT_BRACKET) {
                if (tt === COMMA) {
                    t.get();
                    n.push(null);
                    continue;
                }
                n.push(AssignExpression(t, x));
                if (tt !== COMMA && !t.match(COMMA))
                    break;
            }

            // If we matched exactly one element and got a FOR, we have an
            // array comprehension.
            if (n.children.length === 1 && t.match(FOR)) {
                n2 = new Node(t, { type: ARRAY_COMP,
                                   expression: n.children[0],
                                   tail: ComprehensionTail(t, x) });
                n = n2;
            }
            t.mustMatch(RIGHT_BRACKET);
            n.end = t.token.end;
            break;

          case LEFT_CURLY:
            var id, fd;
            n = new Node(t, { type: OBJECT_INIT });

          object_init:
            if (!t.match(RIGHT_CURLY)) {
                do {
                    tt = t.get();
                    if ((t.token.value === "get" || t.token.value === "set") &&
                        t.peek() === IDENTIFIER) {
                        if (x.ecma3OnlyMode)
                            throw t.newSyntaxError("Illegal property accessor");
                        n.push(FunctionDefinition(t, x, true, EXPRESSED_FORM));
                    } else {
                        switch (tt) {
                          case IDENTIFIER: case NUMBER: case STRING:
                            id = new Node(t, { type: IDENTIFIER });
                            break;
                          case RIGHT_CURLY:
                            if (x.ecma3OnlyMode)
                                throw t.newSyntaxError("Illegal trailing ,");
                            break object_init;
                          default:
                            if (t.token.value in definitions.keywords) {
                                id = new Node(t, { type: IDENTIFIER });
                                break;
                            }
                            throw t.newSyntaxError("Invalid property name");
                        }
                        if (t.match(COLON)) {
                            n2 = new Node(t, { type: PROPERTY_INIT });
                            n2.push(id);
                            n2.push(AssignExpression(t, x));
                            n.push(n2);
                        } else {
                            // Support, e.g., |var {x, y} = o| as destructuring shorthand
                            // for |var {x: x, y: y} = o|, per proposed JS2/ES4 for JS1.8.
                            if (t.peek() !== COMMA && t.peek() !== RIGHT_CURLY)
                                throw t.newSyntaxError("missing : after property");
                            n.push(id);
                        }
                    }
                } while (t.match(COMMA));
                t.mustMatch(RIGHT_CURLY);
            }
            n.end = t.token.end;
            break;

          case LEFT_PAREN:
            var start = t.token.start;
            n = ParenExpression(t, x);
            t.mustMatch(RIGHT_PAREN);
            n.start = start;
            n.end = t.token.end;
            n.parenthesized = true;
            break;

          case LET:
            n = LetBlock(t, x, false);
            break;

          case NULL: case THIS: case TRUE: case FALSE:
          case IDENTIFIER: case NUMBER: case STRING: case REGEXP:
            n = new Node(t);
            break;

          default:
            throw t.newSyntaxError("missing operand");
            break;
        }

        return n;
    }

    /*
     * parse :: (source, filename, line number) -> node
     */
    function parse(s, f, l) {
        var t = new lexer.Tokenizer(s, f, l);
        var n = Script(t, false);
        if (!t.done)
            throw t.newSyntaxError("Syntax error");

        return n;
    }

    /*
     * parseStdin :: (source, {line number}) -> node
     */
    function parseStdin(s, ln) {
        for (;;) {
            try {
                var t = new lexer.Tokenizer(s, "stdin", ln.value);
                var n = Script(t, false);
                ln.value = t.lineno;
                return n;
            } catch (e) {
                if (!t.unexpectedEOF)
                    throw e;
                var more = readline();
                if (!more)
                    throw e;
                s += "\n" + more;
            }
        }
    }

    return {
        parse: parse,
        parseStdin: parseStdin,
        Node: Node,
        DECLARED_FORM: DECLARED_FORM,
        EXPRESSED_FORM: EXPRESSED_FORM,
        STATEMENT_FORM: STATEMENT_FORM,
        Tokenizer: lexer.Tokenizer,
        FunctionDefinition: FunctionDefinition
    };

}());
/* vim: set sw=4 ts=4 et tw=78: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narcissus JavaScript engine.
 *
 * The Initial Developer of the Original Code is
 * Brendan Eich <brendan@mozilla.org>.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Shu-Yu Guo <shu@rfrn.org>
 *   Bruno Jouhier
 *   Gregor Richards
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * Narcissus - JS implemented in JS.
 *
 * Decompiler and pretty-printer.
 */

Narcissus.decompiler = (function() {

    const parser = Narcissus.parser;
    const definitions = Narcissus.definitions;
    const tokens = definitions.tokens;

    // Set constants in the local scope.
    eval(definitions.consts);

    function indent(n, s) {
        var ss = "", d = true;

        for (var i = 0, j = s.length; i < j; i++) {
            if (d)
                for (var k = 0; k < n; k++)
                    ss += " ";
            ss += s[i];
            d = s[i] === '\n';
        }

        return ss;
    }

    function isBlock(n) {
        return n && (n.type === BLOCK);
    }

    function isNonEmptyBlock(n) {
        return isBlock(n) && n.children.length > 0;
    }

    function nodeStr(n) {
        return '"' +
               n.value.replace(/\\/g, "\\\\")
                      .replace(/"/g, "\\\"")
                      .replace(/\n/g, "\\n")
                      .replace(/\r/g, "\\r") +
               '"';
    }

    function pp(n, d, inLetHead) {
        var topScript = false;

        if (!n)
            return "";
        if (!(n instanceof Object))
            return n;
        if (!d) {
            topScript = true;
            d = 1;
        }

        var p = "";

        if (n.parenthesized)
            p += "(";

        switch (n.type) {
          case FUNCTION:
          case GETTER:
          case SETTER:
            if (n.type === FUNCTION)
                p += "function";
            else if (n.type === GETTER)
                p += "get";
            else
                p += "set";

            p += (n.name ? " " + n.name : "") + "(";
            for (var i = 0, j = n.params.length; i < j; i++)
                p += (i > 0 ? ", " : "") + pp(n.params[i], d);
            p += ") " + pp(n.body, d);
            break;

          case SCRIPT:
          case BLOCK:
            var nc = n.children;
            if (topScript) {
                // No indentation.
                for (var i = 0, j = nc.length; i < j; i++) {
                    if (i > 0)
                        p += "\n";
                    p += pp(nc[i], d);
                    var eoc = p[p.length - 1];
                    if (eoc != ";")
                        p += ";";
                }

                break;
            }

            p += "{";
            if (n.id !== undefined)
                p += " /* " + n.id + " */";
            p += "\n";
            for (var i = 0, j = nc.length; i < j; i++) {
                if (i > 0)
                    p += "\n";
                p += indent(4, pp(nc[i], d));
                var eoc = p[p.length - 1];
                if (eoc != ";")
                    p += ";";
            }
            p += "\n}";
            break;

          case LET_BLOCK:
            p += "let (" + pp(n.variables, d, true) + ") ";
            if (n.expression)
                p += pp(n.expression, d);
            else
                p += pp(n.block, d);
            break;

          case IF:
            p += "if (" + pp(n.condition, d) + ") ";

            var tp = n.thenPart, ep = n.elsePart;
            var b = isBlock(tp) || isBlock(ep);
            if (!b)
                p += "{\n";
            p += (b ? pp(tp, d) : indent(4, pp(tp, d))) + "\n";

            if (ep) {
                if (!b)
                    p += "} else {\n";
                else
                    p += " else ";

                p += (b ? pp(ep, d) : indent(4, pp(ep, d))) + "\n";
            }
            if (!b)
                p += "}";
            break;

          case SWITCH:
            p += "switch (" + pp(n.discriminant, d) + ") {\n";
            for (var i = 0, j = n.cases.length; i < j; i++) {
                var ca = n.cases[i];
                if (ca.type === CASE)
                    p += "  case " + pp(ca.caseLabel, d) + ":\n";
                else
                    p += "  default:\n";
                ps = pp(ca.statements, d);
                p += ps.slice(2, ps.length - 2) + "\n";
            }
            p += "}";
            break;

          case FOR:
            p += "for (" + pp(n.setup, d) + "; "
                         + pp(n.condition, d) + "; "
                         + pp(n.update, d) + ") ";

            var pb = pp(n.body, d);
            if (!isBlock(n.body))
                p += "{\n" + indent(4, pb) + ";\n}";
            else if (n.body)
                p += pb;
            break;

          case WHILE:
            p += "while (" + pp(n.condition, d) + ") ";

            var pb = pp(n.body, d);
            if (!isBlock(n.body))
                p += "{\n" + indent(4, pb) + ";\n}";
            else
                p += pb;
            break;

          case FOR_IN:
            var u = n.varDecl;
            p += n.isEach ? "for each (" : "for (";
            p += (u ? pp(u, d) : pp(n.iterator, d)) + " in " +
                 pp(n.object, d) + ") ";

            var pb = pp(n.body, d);
            if (!isBlock(n.body))
                p += "{\n" + indent(4, pb) + ";\n}";
            else if (n.body)
                p += pb;
            break;

          case DO:
            p += "do " + pp(n.body, d);
            p += " while (" + pp(n.condition, d) + ");";
            break;

          case BREAK:
            p += "break" + (n.label ? " " + n.label : "") + ";";
            break;

          case CONTINUE:
            p += "continue" + (n.label ? " " + n.label : "") + ";";
            break;

          case TRY:
            p += "try ";
            p += pp(n.tryBlock, d);
            for (var i = 0, j = n.catchClauses.length; i < j; i++) {
                var t = n.catchClauses[i];
                p += " catch (" + pp(t.varName, d) +
                                (t.guard ? " if " + pp(t.guard, d) : "") +
                                ") ";
                p += pp(t.block, d);
            }
            if (n.finallyBlock) {
                p += " finally ";
                p += pp(n.finallyBlock, d);
            }
            break;

          case THROW:
            p += "throw " + pp(n.exception, d);
            break;

          case RETURN:
            p += "return";
            if (n.value)
              p += " " + pp(n.value, d);
            break;

          case YIELD:
            p += "yield";
            if (n.value.type)
              p += " " + pp(n.value, d);
            break;

          case GENERATOR:
            p += pp(n.expression, d) + " " + pp(n.tail, d);
            break;

          case WITH:
            p += "with (" + pp(n.object, d) + ") ";
            p += pp(n.body, d);
            break;

          case LET:
          case VAR:
          case CONST:
            var nc = n.children;
            if (!inLetHead) {
                p += tokens[n.type] + " ";
            }
            for (var i = 0, j = nc.length; i < j; i++) {
                if (i > 0)
                    p += ", ";
                var u = nc[i];
                p += pp(u.name, d);
                if (u.initializer)
                    p += " = " + pp(u.initializer, d);
            }
            break;

          case DEBUGGER:
            p += "debugger\n";
            break;

          case SEMICOLON:
            if (n.expression) {
                p += pp(n.expression, d) + ";";
            }
            break;

          case LABEL:
            p += n.label + ":\n" + pp(n.statement, d);
            break;

          case COMMA:
          case LIST:
            var nc = n.children;
            for (var i = 0, j = nc.length; i < j; i++) {
                if (i > 0)
                    p += ", ";
                p += pp(nc[i], d);
            }
            break;

          case ASSIGN:
            var nc = n.children;
            var t = n.assignOp;
            p += pp(nc[0], d) + " " + (t ? tokens[t] : "") + "="
                              + " " + pp(nc[1], d);
            break;

          case HOOK:
            var nc = n.children;
            p += "(" + pp(nc[0], d) + " ? "
                     + pp(nc[1], d) + " : "
                     + pp(nc[2], d);
            p += ")";
            break;

          case OR:
          case AND:
            var nc = n.children;
            p += "(" + pp(nc[0], d) + " " + tokens[n.type] + " "
                     + pp(nc[1], d);
            p += ")";
            break;

          case BITWISE_OR:
          case BITWISE_XOR:
          case BITWISE_AND:
          case EQ:
          case NE:
          case STRICT_EQ:
          case STRICT_NE:
          case LT:
          case LE:
          case GE:
          case GT:
          case IN:
          case INSTANCEOF:
          case LSH:
          case RSH:
          case URSH:
          case PLUS:
          case MINUS:
          case MUL:
          case DIV:
          case MOD:
            var nc = n.children;
            p += "(" + pp(nc[0], d) + " " + tokens[n.type] + " "
                     + pp(nc[1], d) + ")";
            break;

          case DELETE:
          case VOID:
          case TYPEOF:
            p += tokens[n.type] + " "  + pp(n.children[0], d);
            break;

          case NOT:
          case BITWISE_NOT:
            p += tokens[n.type] + pp(n.children[0], d);
            break;

          case UNARY_PLUS:
            p += "+" + pp(n.children[0], d);
            break;

          case UNARY_MINUS:
            p += "-" + pp(n.children[0], d);
            break;

          case INCREMENT:
          case DECREMENT:
            if (n.postfix) {
                p += pp(n.children[0], d) + tokens[n.type];
            } else {
                p += tokens[n.type] + pp(n.children[0], d);
            }
            break;

          case DOT:
            var nc = n.children;
            p += pp(nc[0], d) + "." + pp(nc[1], d);
            break;

          case INDEX:
            var nc = n.children;
            p += pp(nc[0], d) + "[" + pp(nc[1], d) + "]";
            break;

          case CALL:
            var nc = n.children;
            p += pp(nc[0], d) + "(" + pp(nc[1], d) + ")";
            break;

          case NEW:
          case NEW_WITH_ARGS:
            var nc = n.children;
            p += "new " + pp(nc[0], d);
            if (nc[1])
                p += "(" + pp(nc[1], d) + ")";
            break;

          case ARRAY_INIT:
            p += "[";
            var nc = n.children;
            for (var i = 0, j = nc.length; i < j; i++) {
                if(nc[i])
                    p += pp(nc[i], d);
                p += ","
            }
            p += "]";
            break;

          case ARRAY_COMP:
            p += "[" + pp (n.expression, d) + " ";
            p += pp(n.tail, d);
            p += "]";
            break;

          case COMP_TAIL:
            var nc = n.children;
            for (var i = 0, j = nc.length; i < j; i++) {
                if (i > 0)
                    p += " ";
                p += pp(nc[i], d);
            }
            if (n.guard)
                p += " if (" + pp(n.guard, d) + ")";
            break;

          case OBJECT_INIT:
            var nc = n.children;
            if (nc[0] && nc[0].type === PROPERTY_INIT)
                p += "{\n";
            else
                p += "{";
            for (var i = 0, j = nc.length; i < j; i++) {
                if (i > 0) {
                    p += ",\n";
                }

                var t = nc[i];
                if (t.type === PROPERTY_INIT) {
                    var tc = t.children;
                    var l;
                    // see if the left needs to be a string
                    if (typeof tc[0].value === "string" && !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(tc[0].value)) {
                        l = nodeStr(tc[0]);
                    } else {
                        l = pp(tc[0], d);
                    }
                    p += indent(4, l) + ": " +
                         indent(4, pp(tc[1], d)).substring(4);
                } else {
                    p += indent(4, pp(t, d));
                }
            }
            p += "\n}";
            break;

          case NULL:
            p += "null";
            break;

          case THIS:
            p += "this";
            break;

          case TRUE:
            p += "true";
            break;

          case FALSE:
            p += "false";
            break;

          case IDENTIFIER:
          case NUMBER:
          case REGEXP:
            if (n.value.isOctal) p += "0" + n.value.toString(8);
            else p += n.value;
            break;

          case STRING:
            p += nodeStr(n);
            break;

          case GROUP:
            p += "(" + pp(n.children[0], d) + ")";
            break;

          default:
            throw "PANIC: unknown operation " + tokens[n.type] + " " + n.toSource();
        }

        if (n.parenthesized)
            p += ")";

        return p;
    }

    return {
        pp: pp
    };

}());
"use strict";
(function(exports) {
	exports.version = "0.10.8";
})(typeof exports !== 'undefined' ? exports : (Streamline.version = Streamline.version || {}));
"use strict";
(function() {
var sourceMap;
if (typeof exports !== 'undefined') {
	var req = srequire; // fool streamline-require so that we don't load source-map client-side
	try { sourceMap = req('source-map'); } catch (ex) {}
}
if (!sourceMap) {
	// Mock it for client-side
	sourceMap = {
		SourceNode: function(lineno, column, source, content) {
			this.children = content ? [content] : [];
		}
	};
	sourceMap.SourceNode.prototype.add = function(elt) {
		if (Array.isArray(elt)) this.children = this.children.concat(elt);
		else this.children.push(elt);
		return this;
	};
	sourceMap.SourceNode.prototype.prepend = function(elt) {
		if (Array.isArray(elt)) this.children = elt.concat(this.children.concat);
		else this.children.unshift(elt);
		return this;
	};
	sourceMap.SourceNode.prototype.toString = function() {
	    var str = "";
	    this.walk(function (chunk) {
	      str += chunk;
	    });
	    return str;
	};
	sourceMap.SourceNode.prototype.walk = function(f) {
		this.children.forEach(function(n) {
			if (n instanceof sourceMap.SourceNode) n.walk(f);
			else f(n);
		});
		return this;
	};
}
(function(module) {
function SourceNode() {
	sourceMap.SourceNode.apply(this, arguments);
}

SourceNode.prototype = Object.create(sourceMap.SourceNode.prototype, {
	constructor: {
		value: SourceNode,
		enumerable: false,
		writable: true,
		configurable: true
	},
	length: {
		get: function() {
			var len = 0;
			this.walk(function(str) { len += str.length; });
			return len;
		}
	}
});
SourceNode.prototype.stripPrefix = function(offset) {
	var _len;
	while (this.children.length > 0 && offset > 0 && (_len = this.children[0].length) <= offset) {
		this.children.shift();
		offset -= _len;
	}
	if (this.children.length == 0 || offset == 0) return this;
	if (typeof this.children[0] == 'string') {
		this.children[0] = this.children[0].substring(offset);
	} else {
		this.children[0].stripPrefix(offset);
	}
	return this;
};
SourceNode.prototype.stripSuffix = function(offset) {
	var _len, chlen;
	while ((chlen = this.children.length) > 0 && offset > 0 && (_len = this.children[chlen - 1].length) <= offset) {
		this.children.pop();
		offset -= _len;
	}
	if (chlen == 0 || offset == 0) return this;
	if (typeof this.children[chlen-1] == 'string') {
		this.children[chlen-1] = this.children[0].slice(0, -offset);
	} else {
		this.children[chlen-1].stripSuffix(offset);
	}
	return this;
};
SourceNode.prototype.map = function(f) {
	this.children = this.children.map(function(chunk) {
		if (chunk instanceof sourceMap.SourceNode) {
			return chunk.map(f);
		} else {
			return f(chunk);
		}
	});
	return this;
};
SourceNode.prototype.lastChar = function() {
	for (var i = this.children.length; i--; ) {
		var ret;
		if (typeof this.children[i] == 'string') {
			ret = this.children[i].slice(-1);
		} else {
			ret = this.children[i].lastChar();
		}
		if (ret) return ret;
	}
	return '';
};
module.exports = Object.create(sourceMap, { SourceNode: { value: SourceNode } });

})(typeof exports !== 'undefined' ? module : (Streamline.sourceMap = Streamline.sourceMap || {}));
})();/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narcissus JavaScript engine.
 *
 * The Initial Developer of the Original Code is
 * Brendan Eich <brendan@mozilla.org>.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Shu-Yu Guo <shu@rfrn.org>
 *   Bruno Jouhier
 *   Gregor Richards
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

if (typeof exports !== 'undefined') {
	var Narcissus = srequire('streamline/deps/narcissus');
}
var sourceMap = srequire('streamline/lib/util/source-map');
(function(exports){
	eval(Narcissus.definitions.consts);
	var tokens = Narcissus.definitions.tokens;
	
	exports.format = function(node, linesOpt) {
		var result = '';
	
		var ppOut = _pp(node);
		if (linesOpt == "sourcemap") {
			return ppOut.source;
		}
		ppOut.source = ppOut.source.toString();
		if (linesOpt == "ignore")
			return ppOut.source;
		
		var lineMap = ppOut.lineMap;
		
		var lines = ppOut.source.split("\n");
		
		if (linesOpt == "preserve") {
			var outputLineNo = 1, bol = true;
			for (var i = 0; i < lines.length; i++) {
				var sourceNodes = (lineMap[i] || []).filter(function(n) { return n._isSourceNode });
				if (sourceNodes.length > 0) {
					var sourceLineNo = sourceNodes[0].lineno;
					while (outputLineNo < sourceLineNo) {
						result += "\n";
						outputLineNo += 1;
						bol = true;
					}
				}
				result += bol ? lines[i] : lines[i].replace(/^\s+/, ' ');
				bol = false;
			}
			result += "\n";
		}
		else if (linesOpt == "mark"){
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i];
				var sourceNodes = (lineMap[i] || []).filter(function(n) { return n._isSourceNode });
				var linePrefix = '            ';
				if (sourceNodes.length > 0) {
					var sourceLineNo = '' + sourceNodes[0].lineno;
					linePrefix = '/* ';
					for (var j = sourceLineNo.length; j < 5; j++) linePrefix += ' ';
					linePrefix += sourceLineNo + ' */ ';
				}
				result += linePrefix + line + "\n";
			}
		}
		else
			throw new Error("bad --lines option: " + linesOpt)
		
		return result;
	}
	
	/** Narcissus.decompiler.pp with line number tracking **/
	function _pp(node) {
		
		var curLineNo = 0;
		var lineNodeMap = {};
		
		var src = pp(node);
		
		return {
			source: src,
			lineMap: lineNodeMap
		};
		
		function countNewline(s) {
			curLineNo += 1;
			return s;
		}
		
		function indent(n, s) {
			var dent = new Array(n+1).join(' ');
			s.map(function(str) {
				return str.replace(/\n/g, "\n" + dent);
			});
			s.prepend(new sourceMap.SourceNode(null, null, null, dent));
			return s;
		}
	
		function isBlock(n) {
			return n && (n.type === BLOCK);
		}
	
		function isNonEmptyBlock(n) {
			return isBlock(n) && n.children.length > 0;
		}

		var lines;
		function sourceNodeFromNode(n, content) {
			var lineno, column, source = n.tokenizer && n.tokenizer.filename;
			source = source || void 0;
			var start = n.start, end = n.end;
			var sourceString = n.tokenizer && n.tokenizer.source;
			if (!source || !start || !end || !sourceString) {
				// no chance
				return new sourceMap.SourceNode(void 0, void 0, void 0, content);
			}
			if (source && !lines) {
				// generate a map of all newlines
				lines = [];
				// -1 is considered a newline for the first line of the file
				lines[-1] = 0
				var lineno = 1;
				for (var index = sourceString.indexOf('\n'); index >= 0; index = sourceString.indexOf('\n', index+1)) {
					lines[index] = lineno;
					lineno++;
				}
			}
			// for some reason, some nodes have a slightly wrong `start` position. so fix it
			while (start < end && " \n\t;{}".indexOf(sourceString[start]) >= 0) start++;
			if (start < end) {
				var fragment = sourceString.substring(start, end);
				var newline = sourceString.lastIndexOf("\n", start)
				lineno = lines[newline] + 1; // lines index from 1
				column = start - (newline + 1);
			} else {
				source = void 0;
			}

			return new sourceMap.SourceNode(lineno, column, source, content);
		}
	
		function nodeStr(n) {
			return sourceNodeFromNode(n, '"' +
				n.value.replace(/\\/g, "\\\\")
				       .replace(/"/g, "\\\"")
				       .replace(/\n/g, "\\n")
				       .replace(/\r/g, "\\r") +
				       '"');
		}
	
		function pp(n, d, inLetHead) {
			var topScript = false;
	
			if (!n)
				return "";
			if (!(n instanceof Object))
				return ""+n;
			if (!d) {
				topScript = true;
				d = 1;
			}
			
			if (!lineNodeMap[curLineNo])
				lineNodeMap[curLineNo] = [];
			
			lineNodeMap[curLineNo].push(n);

			var p = sourceNodeFromNode(n);
	
			if (n.parenthesized)
				p.add("(");
	
			switch (n.type) {
			case FUNCTION:
			case GETTER:
			case SETTER:
				if (n.type === FUNCTION)
					p.add("function");
				else if (n.type === GETTER)
					p.add("get");
				else
					p.add("set");
	
				if (n.name) {
					p.add([' ', sourceNodeFromNode(n, n.name)]);
				}
				p.add("(");
				for (var i = 0, j = n.params.length; i < j; i++) {
					p.add([(i > 0 ? ", " : ""), pp(n.params[i], d)]);
				}
				p.add([") ", pp(n.body, d)]);
				break;
	
			case SCRIPT:
			case BLOCK:
				var nc = n.children;
				if (topScript) {
					// No indentation.
					for (var i = 0, j = nc.length; i < j; i++) {
						if (i > 0) 
							p.add(countNewline("\n"));
						p.add(pp(nc[i], d));
						if (p.lastChar() != ";")
							p.add(";");
					}
	
					break;
				}
	
				p.add("{");
				if (n.id !== undefined)
					p.add(" /* " + n.id + " */");
				p.add(countNewline("\n"));
				for (var i = 0, j = nc.length; i < j; i++) {
					if (i > 0)
						p.add(countNewline("\n"));
					p.add(indent(2, pp(nc[i], d)));
					if (p.lastChar() != ";")
						p.add(';');
				}
				p.add(countNewline("\n}"));
				break;
	
			case LET_BLOCK:
				p.add(["let (", pp(n.variables, d, true), ") "]);
				if (n.expression)
					p.add(pp(n.expression, d));
				else
					p.add(pp(n.block, d));
				break;
	
			case IF:
				p.add(["if (", pp(n.condition, d), ") "]);
	
				var tp = n.thenPart, ep = n.elsePart;
				var b = isBlock(tp) || isBlock(ep);
				if (!b)
					p.add(countNewline("{\n"));
				p.add((b ? pp(tp, d) : indent(2, pp(tp, d))))
				if (ep && ";}".indexOf(p.lastChar()) < 0)
					p.add(";");
				p.add(countNewline("\n"));
	
				if (ep) {
					if (!b)
						p.add(countNewline("} else {\n"));
					else
						p.add(" else ");
	
					p.add([(b ? pp(ep, d) : indent(2, pp(ep, d))), countNewline("\n")]);
				}
				if (!b)
					p.add("}");
				break;
	
			case SWITCH:
				p.add(["switch (", pp(n.discriminant, d), countNewline(") {\n")]);
				for (var i = 0, j = n.cases.length; i < j; i++) {
					var ca = n.cases[i];
					if (ca.type === CASE)
						p.add(["case ", pp(ca.caseLabel, d), countNewline(":\n")]);
					else
						p.add(countNewline("  default:\n"));
					p.add([pp(ca.statements, d).stripPrefix(2).stripSuffix(2), countNewline("\n")]);
					curLineNo -= 2; // stripped out 2 newlines
				}
				p.add("}");
				break;
	
			case FOR:
				p.add(["for (", pp(n.setup, d), "; ", pp(n.condition, d), "; ", pp(n.update, d), ") "]);
	
				var pb = pp(n.body, d);
				if (!isBlock(n.body)) {
					p.add([countNewline("{\n"), indent(2, pb), countNewline(";\n}")]);
				} else if (n.body)
					p.add(pb);
				break;
	
			case WHILE:
				p.add(["while (", pp(n.condition, d), ") "]);
	
				var pb = pp(n.body, d);
				if (!isBlock(n.body)) {
					p.add([countNewline("{\n"), indent(2, pb), countNewline(";\n}")]);
				} else
					p.add(pb);
				break;
	
			case FOR_IN:
				var u = n.varDecl;
				p.add([n.isEach ? "for each (" : "for (", u ? pp(u, d) : pp(n.iterator, d), " in ", pp(n.object, d), ") "]);
	
				var pb = pp(n.body, d);
				if (!isBlock(n.body)) {
					p.add([countNewline("{\n"), indent(2, pb), countNewline(";\n}")]);
				} else if (n.body)
					p.add(pb);
				break;
	
			case DO:
				p.add(["do ", pp(n.body, d), " while (", pp(n.condition, d), ");"]);
				break;
	
			case BREAK:
				p.add(["break", n.label ? " " + n.label : "", ";"]);
				break;
	
			case CONTINUE:
				p.add(["continue", n.label ? " " + n.label : "", ";"]);
				break;
	
			case TRY:
				p.add(["try ", pp(n.tryBlock, d)]);
				for (var i = 0, j = n.catchClauses.length; i < j; i++) {
					var t = n.catchClauses[i];
					p.add([" catch (", pp(t.varName, d), t.guard ? " if " + pp(t.guard, d) : "", ") ", pp(t.block, d)]);
				}
				if (n.finallyBlock) {
					p.add([" finally ", pp(n.finallyBlock, d)]);
				}
				break;
	
			case THROW:
				p.add(["throw ", pp(n.exception, d)]);
				break;
	
			case RETURN:
				p.add("return");
				if (n.value) {
					p.add([" ", pp(n.value, d)]);
				}
				break;
	
			case YIELD:
				p.add("yield");
				if (n.value.type) {
					p.add([" ", pp(n.value, d)]);
				}
				break;
	
			case GENERATOR:
				p.add([pp(n.expression, d), " ", pp(n.tail, d)]);
				break;
	
			case WITH:
				p.add(["with (", pp(n.object, d), ") ", pp(n.body, d)]);
				break;
	
			case LET:
			case VAR:
			case CONST:
				var nc = n.children;
				if (!inLetHead) {
					p.add([tokens[n.type], " "]);
				}
				for (var i = 0, j = nc.length; i < j; i++) {
					if (i > 0)
						p.add(", ");
					var u = nc[i];
					p.add(pp(u.name, d));
					if (u.initializer) {
						p.add([" = ", pp(u.initializer, d)]);
					}
				}
				break;
	
			case DEBUGGER:
				p.add(countNewline("debugger\n"));
				break;
	
			case SEMICOLON:
				if (n.expression) {
					p.add([pp(n.expression, d), ";"]);
				}
				break;
	
			case LABEL:
				p.add([n.label, countNewline(":\n"), pp(n.statement, d)]);
				break;
	
			case COMMA:
			case LIST:
				var nc = n.children;
				for (var i = 0, j = nc.length; i < j; i++) {
					if (i > 0)
						p.add(", ");
					p.add(pp(nc[i], d));
				}
				break;
	
			case ASSIGN:
				var nc = n.children;
				var t = n.assignOp;
				p.add([pp(nc[0], d), " ", t ? tokens[t] : "", "=", " ", pp(nc[1], d)]);
				break;
	
			case HOOK:
				var nc = n.children;
				p.add(["(", pp(nc[0], d), " ? ", pp(nc[1], d), " : ", pp(nc[2], d), ")"]);
				break;
	
			case OR:
			case AND:
				var nc = n.children;
				p.add(["(", pp(nc[0], d), " ", tokens[n.type], " ", pp(nc[1], d), ")"]);
				break;
	
			case BITWISE_OR:
			case BITWISE_XOR:
			case BITWISE_AND:
			case EQ:
			case NE:
			case STRICT_EQ:
			case STRICT_NE:
			case LT:
			case LE:
			case GE:
			case GT:
			case IN:
			case INSTANCEOF:
			case LSH:
			case RSH:
			case URSH:
			case PLUS:
			case MINUS:
			case MUL:
			case DIV:
			case MOD:
				var nc = n.children;
				p.add(["(", pp(nc[0], d), " ", tokens[n.type], " ", pp(nc[1], d), ")"]);
				break;
	
			case DELETE:
			case VOID:
			case TYPEOF:
				p.add([tokens[n.type], " ", pp(n.children[0], d)]);
				break;
	
			case NOT:
			case BITWISE_NOT:
				p.add([tokens[n.type], pp(n.children[0], d)]);
				break;
	
			case UNARY_PLUS:
				p.add(["+", pp(n.children[0], d)]);
				break;
	
			case UNARY_MINUS:
				p.add(["-", pp(n.children[0], d)]);
				break;
	
			case INCREMENT:
			case DECREMENT:
				if (n.postfix) {
					p.add([pp(n.children[0], d), tokens[n.type]]);
				} else {
					p.add([tokens[n.type], pp(n.children[0], d)]);
				}
				break;
	
			case DOT:
				var nc = n.children;
				p.add([pp(nc[0], d), ".", pp(nc[1], d)]);
				break;
	
			case INDEX:
				var nc = n.children;
				p.add([pp(nc[0], d), "[", pp(nc[1], d), "]"]);
				break;
	
			case CALL:
				var nc = n.children;
				p.add([pp(nc[0], d), "(", pp(nc[1], d), ")"]);
				break;
	
			case NEW:
			case NEW_WITH_ARGS:
				var nc = n.children;
				p.add("new ");
				p.add(pp(nc[0], d));
				if (nc[1]) {
					p.add(["(", pp(nc[1], d), ")"]);
				}
				break;
	
			case ARRAY_INIT:
				p.add("[");
				var nc = n.children;
				for (var i = 0, j = nc.length; i < j; i++) {
					if(nc[i])
						p.add(pp(nc[i], d));
					p.add(",");
				}
				p.add("]");
				break;
	
			case ARRAY_COMP:
				p.add(["[", pp(n.expression, d), " ", pp(n.tail, d), "]"]);
				break;
	
			case COMP_TAIL:
				var nc = n.children;
				for (var i = 0, j = nc.length; i < j; i++) {
					if (i > 0)
						p.add(" ");
					p.add(pp(nc[i], d));
				}
				if (n.guard) {
					p.add([" if (", pp(n.guard, d), ")"]);
				}
				break;
	
			case OBJECT_INIT:
				var nc = n.children;
				if (nc[0] && nc[0].type === PROPERTY_INIT)
					p.add(countNewline("{\n"));
				else
					p.add("{");
				for (var i = 0, j = nc.length; i < j; i++) {
					if (i > 0) {
						p.add(countNewline(",\n"));
					}
	
					var t = nc[i];
					if (t.type === PROPERTY_INIT) {
						var tc = t.children;
						var l;
						// see if the left needs to be a string
						if (typeof tc[0].value === "string" && !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(tc[0].value)) {
							l = nodeStr(tc[0]);
							p.add(l);
					} else {
							l = pp(tc[0], d);
							p.add(indent(2, l));
						}
						p.add([": ", indent(2, pp(tc[1], d)).stripPrefix(2)]);
					} else {
						p.add(indent(2, pp(t, d)));
					}
				}
				p.add(countNewline("\n}"));
				break;
	
			case NULL:
				p.add("null");
				break;
	
			case THIS:
				p.add("this");
				break;
	
			case TRUE:
				p.add("true");
				break;
	
			case FALSE:
				p.add("false");
				break;
	
			case IDENTIFIER:
			case NUMBER:
			case REGEXP:
				if (n.value.isOctal) p.add("0" + n.value.toString(8));
				else p.add(""+n.value);
				break;
	
			case STRING:
				p.add(nodeStr(n));
				break;
	
			case GROUP:
				p.add(["(", pp(n.children[0], d), ")"]);
				break;
	
			default:
				throw "PANIC: unknown operation " + tokens[n.type] + " " + n.toSource();
			}
	
			if (n.parenthesized)
				p.add(")");
	
			return p;
		}
	}
})(typeof exports !== 'undefined' ? exports : (window.Streamline = window.Streamline || {}));
/**
 * Copyright (c) 2011 Bruno Jouhier <bruno.jouhier@sage.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
/// !doc
/// 
/// # Transformation engine (callback mode)
/// 
/// `var transform = require('streamline/lib/callbacks/transform')`
/// 
if (typeof exports !== 'undefined') {
	var Narcissus = srequire('../../deps/narcissus');
	var format = srequire('./format').format;
} else {
	var format = Streamline.format;
}(function(exports) {
	//"use strict";
	/// * `version = transform.version`  
	///   current version of the transformation algorithm.
	exports.version = srequire("streamline/lib/version").version + " (callbacks)";

	var parse = Narcissus.parser.parse;
	var pp = Narcissus.decompiler.pp;
	var definitions = Narcissus.definitions;

	eval(definitions.consts.replace(/const /g, "var "));

	function _assert(cond) {
		if (!cond) throw new Error("Assertion failed!")
	}

	function _tag(node) {
		if (!node || !node.type) return "*NOT_A_NODE*";
		var t = definitions.tokens[node.type];
		return /^\W/.test(t) ? definitions.opTypeNames[t] : t.toUpperCase();
	}

	/*
	 * Utility functions
	 */

	function originalLine(options, line, col) {
		if (!options.prevMap) return line;
		// Work around a bug in CoffeeScript's source maps; column number 0 is faulty.
		if (col == null) col = 1000;
		var r = options.prevMap.originalPositionFor({ line: line, column: col }).line
		return r == null ? line : r;
	}

	function originalCol(options, line, col) {
		if (!options.prevMap) return col;
		return options.prevMap.originalPositionFor({ line: line, column: col }).column || 0;
	}

	function _node(ref, type, children) {
		return {
			_scope: ref && ref._scope,
			_async: ref && ref._async,
			type: type,
			children: children
		};
	}

	function _identifier(name, initializer) {
		return {
			_scope: initializer && initializer._scope,
			type: IDENTIFIER,
			name: name,
			value: name,
			initializer: initializer
		};
	}

	function _number(val) {
		return {
			type: NUMBER,
			value: val
		};
	}

	function _string(val) {
		return {
			type: STRING,
			value: val
		};
	}

	function _return(node) {
		return {
			type: RETURN,
			_scope: node._scope,
			value: node
		};
	}

	function _semicolon(node) {
		var stmt = _node(node, SEMICOLON);
		stmt.expression = node;
		return stmt;
	}

	function _safeName(precious, name) {
		if (name.substring(0, 2) === '__') while (precious[name]) name += 'A';
		return name;
	}
	// cosmetic stuff: template logic generates nested blocks. Flatten them.

	function _flatten(node) {
		if (node.type == BLOCK || node.type == SCRIPT) {
			do {
				var found = false;
				var children = [];
				node.children.forEach(function(child) {
					if (child._isFunctionReference || (child.type == SEMICOLON && (child.expression == null || child.expression._isFunction))) return; // eliminate empty statement and dummy function node;
					node._async |= child._async;
					if (child.type == BLOCK || child.type == SCRIPT) {
						children = children.concat(child.children);
						found = true;
					} else children.push(child);
				})
				node.children = children;
			}
			while (found);
		}
		return node;
	}

	// generic helper to traverse parse tree
	// if doAll is true, fn is called on every property, otherwise only on sub-nodes
	// if clone object is passed, values returned by fn are assigned to clone properties

	function _propagate(node, fn, doAll, clone) {
		var result = clone ? clone : node;
		for (var prop in node) {
			// funDecls and expDecls are aliases to children
			// target property creates loop (see Node.prototype.toString)
			if (node.hasOwnProperty(prop) && prop.indexOf("Decls") < 0 && (doAll || prop != 'target') && prop[0] != '_') {
				var child = node[prop];
				if (child != null) {
					if (Array.isArray(child)) {
						if (clone) result[prop] = (child = [].concat(child));
						var undef = false;
						for (var i = 0; i < child.length; i++) {
							if (doAll || (child[i] && child[i].type)) {
								child[i] = fn(child[i], node);
								undef |= typeof child[i] === "undefined"
							}
						}
						if (undef) {
							result[prop] = child.filter(function(elt) {
								return typeof elt !== "undefined";
							});
						}
					} else {
						if (doAll || (child && child.type)) result[prop] = fn(child, node);

					}
				}
			}
		}
		return result;
	}

	// clones the tree rooted at node.

	function _clone(node) {
		var lastId = 0;
		var clones = {}; // target property creates cycles

		function cloneOne(child) {
			if (!child || !child.type) return child;
			var cloneId = child._cloneId;
			if (!cloneId) cloneId = (child._cloneId = ++lastId);
			var clone = clones[cloneId];
			if (clone) return clone;
			clones[cloneId] = (clone = {
				_cloneId: cloneId
			});
			return _propagate(child, cloneOne, true, clone);
		}

		return _propagate(node, cloneOne, true, {});
	}

	/*
	 * Utility class to generate parse trees from code templates
	 */

	function Template(pass, str, isExpression, createScope) {
		// parser the function and set the root
		var _root = parse("function _t(){" + str + "}").children[0].body;
		if (_root.children.length == 1) _root = _root.children[0];
		else _root = _node(_root.children[0], BLOCK, _root.children);

		// if template is an expression rather than a full statement, go one more step down
		//if (isExpression) 
		//	_root = _root.expression;
		// generates a parse tree from a template by substituting bindings.
		this.generate = function(scopeNode, bindings) {
			var scope = scopeNode._scope;
			_assert(scope != null);
			bindings = bindings || {};
			var fn = null;

			function gen(node) {
				if (node.type != SCRIPT && node.type != BLOCK) node._pass = pass;
				if (node.type == FUNCTION && createScope) {
					_assert(fn == null);
					fn = node;
				}
				if (!node || !node.type) {
					if (node == "_") return scope.options.callback;
					// not a parse node - replace if it is a name that matches a binding
					if (typeof node === "string") {
						if (node[0] === "$") return bindings[node];
						return _safeName(scope.options.precious, node);
					}
					return node;
				}
				node._scope = scope;
				// if node is ident; statement (SEMICOLON) or ident expression, try to match with binding
				var ident = node.type == SEMICOLON ? node.expression : node;
				if (ident && ident.type == IDENTIFIER && ident.value[0] === "$") {
					var result = bindings[ident.value];
					// transfer initializer if there is one
					if (ident.initializer) {
						result.initializer = gen(ident.initializer);
						if (result.initializer._async) result._async = true;
					}
					return result;
				} else {
					// recurse through sub nodes
					node = _propagate(node, function(child) {
						child = gen(child);
						// propagate async flag like analyze phase
						if (child && (child._async || (child === scope.options.callback && createScope)) && node.type !== FUNCTION) node._async = true;
						return child;
					}, true);
					node = _flatten(node);
					return node;
				}
			}

			// generate
			var result = gen(_clone(_root));
			if (fn) {
				// parser drops parenthesized flag (because of return)
				fn.parenthesized = true;
				var scope = new Scope(fn.body, fn._scope.options);
				scope.name = fn._scope.name;
				scope.line = fn._scope.line;
				scope.last = fn._scope.last;
				_assert(fn.params[0] === fn._scope.options.callback);
				scope.cbIndex = 0;

				function _changeScope(node, parent) {
					if (node.type == FUNCTION) return node;
					node._scope = scope;
					return _propagate(node, _changeScope);
				}
				_propagate(fn, _changeScope);
			}
			return isExpression ? result.value : result;
		}
		this.root = isExpression ? _root.value : _root; // for simplify pass
	}

	/*
	 * Utility to generate names of intermediate variables
	 */

	function Scope(script, options) {
		this.script = script;
		this.line = 0;
		this.last = 0;
		this.vars = [];
		this.functions = [];
		this.options = options;
		this.cbIndex = -1;
		this.isAsync = function() {
			return this.cbIndex >= 0;
		}
	}

	function _genId(node) {
		return _safeName(node._scope.options.precious, "__" + ++node._scope.last);
	}

	/*
	 * Preliminary pass: mark source nodes so we can map line numbers
	 * Also eliminate _fast_ syntax
	 */
	function _removeFast(node, options) {
		function _isMarker(node) {
			return node.type === IDENTIFIER && node.value === options.callback;
		}
		function _isStar(node) {
			return node.type === CALL && _isMarker(node.children[0]) && node.children[1].children.length === 2;
		}
		// ~_ -> _
		if (node.type === BITWISE_NOT && _isMarker(node.children[0])) {
			options.needsTransform = true;
			return node.children[0];
		}
		// [_] -> _ (with multiple marker)
		if (node.type === ARRAY_INIT && node.children.length === 1 && _isMarker(node.children[0])) {
			options.needsTransform = true;
			node.children[0]._returnArray = true; 
			return node.children[0];
		}
		// _ >> x -> x
		if (node.type === RSH && _isMarker(node.children[0])) {
			options.needsTransform = true;
			return node.children[1];
		}
		// _ << x -> x
		if (node.type === LSH && _isMarker(node.children[0])) {
			options.needsTransform = true;
			return node.children[1];
		}
		// !_ -> null
		if (node.type === NOT && _isMarker(node.children[0])) {
			options.needsTransform = true;
			node.type = FALSE;
			node.children = [];
			return node;
		}
		if (_isStar(node)) {
			node._isStar = true;
			options.needsTransform = true;
			node.children[0].value = _safeName(options.precious, "__rt") + ".streamlinify"
			return node;
		} 
		return node;
	}

	function _markSource(node, options) {
		function _markOne(node) {
			if (typeof node.value === 'string') options.precious[node.value] = true;
			node.params && node.params.forEach(function(param) {
				options.precious[param] = true;
			});
			node._isSourceNode = true;
			_propagate(node, function(child) {
				child = _removeFast(child, options);
				_markOne(child);
				return child;
			});
		}

		_markOne(node);
	}

	/*
	 * Canonicalization pass: wrap top level script if async
	 */

	function _isScriptAsync(script, options) {
		var async = false;

		function _doIt(node, parent) {
			switch (node.type) {
			case FUNCTION:
				// do not propagate into functions
				return node;
			case IDENTIFIER:
				if (node.value == options.callback) {
					async = true;
				} else { // propagate only if async is still false
					_propagate(node, _doIt);
				}
				return node;
			case CALL:
				// special hack for coffeescript top level closure
				var fn = node.children[0],
					args = node.children[1],
					ident;
				if (fn.type === DOT && (ident = fn.children[1]).value === "call" && (fn = fn.children[0]).type === FUNCTION && fn.params.length === 0 && !fn.name && args.children.length === 1 && args.children[0].type === THIS) {
					_propagate(fn.body, _doIt);
					return node;
				}
				// fall through			
			default:
				// do not propagate if async has been found
				if (!async) {
					_propagate(node, _doIt);
				}
				return node;
			}
		}
		_propagate(script, _doIt);
		if (async && options.verbose) console.log("WARNING: async calls found at top level in " + script.filename);
		return async;
	}

	var _rootTemplate = new Template("root",
	// define as string on one line to get lineno = 1
	"(function main(_){ $script }).call(this, __trap);");

	function _canonTopLevelScript(script, options) {
		script._scope = new Scope(script, options);
		if (_isScriptAsync(script, options)) return _rootTemplate.generate(script, {
			$script: script
		});
		else return script;
	}

	/*
	 * Scope canonicalization pass:
	 *   Set _scope on all nodes
	 *   Set _async on all nodes that contain an async marker
	 *   Move vars and functions to beginning of scope.
	 *   Replace this by __this.
	 *   Set _breaks flag on all statements that end with return, throw or break
	 */
	var _assignTemplate = new Template("canon", "$lhs = $rhs;");

	// try to give a meaningful name to an anonymous func

	function _guessName(node, parent) {
		function _sanitize(name) {
			// replace all invalid chars by '_o_'
			name = name.replace(/[^A-Z0-9_$]/ig, '_o_');
			// add '_o_' prefix if name is empty or starts with a digit
			return name && !/^\d/.test(name) ? name : '_o_' + name;
		}
		var id = _genId(node),
			n, nn;
		if (parent.type === IDENTIFIER) return _sanitize(parent.value) + id;
		if (parent.type === ASSIGN) {
			n = parent.children[0];
			var s = "";
			while ((n.type === DOT && (nn = n.children[1]).type === IDENTIFIER) || (n.type === INDEX && (nn = n.children[1]).type === STRING)) {
				s = s ? nn.value + "_" + s : nn.value;
				n = n.children[0];
			}
			if (n.type === IDENTIFIER) s = s ? n.value + "_" + s : n.value;
			if (s) return _sanitize(s) + id;
		} else if (parent.type == PROPERTY_INIT) {
			n = parent.children[0];
			if (n.type === IDENTIFIER || n.type === STRING) return _sanitize(n.value) + id;
		}
		return id;
	}

	function _canonScopes(node, options) {
		function _doIt(node, parent) {
			var scope = parent._scope;
			node._scope = scope;
			var async = scope.isAsync();
			if (!async && node.type !== FUNCTION) {
				if (node.type === IDENTIFIER && node.value === options.callback && !parent._isStar) {
					throw new Error(node.filename + ": Function contains async calls but does not have _ parameter: " + node.name + " at line " + node.lineno);
				}
				return _propagate(node, _doIt);
			}

			if (node.type === TRY) node._async = true;
			switch (node.type) {
			case FUNCTION:
				var result = node;
				var cbIndex = node.params.reduce(function(index, param, i) {
					if (param != options.callback) return index;
					if (index < 0) return i;
					else throw new Error("duplicate _ parameter");
				}, -1);
				if (cbIndex >= 0) {
					// handle coffeescript fat arrow method definition (issue #141)
					if (_isFatArrow(node)) return node;
					// should rename options -> context because transform writes into it.
					options.needsTransform = true;
					// assign names to anonymous functions (for futures)
					if (!node.name) node.name = _guessName(node, parent);
				}
				// if function is a statement, move it away
				if (async && (parent.type === SCRIPT || parent.type === BLOCK)) {
					scope.functions.push(node);
					result = undefined;
				}
				// create new scope for the body
				var bodyScope = new Scope(node.body, options);
				node.body._scope = bodyScope;
				bodyScope.name = node.name;
				bodyScope.cbIndex = cbIndex;
				bodyScope.line = node.lineno;
				node.body = _propagate(node.body, _doIt);
				// insert declarations at beginning of body
				if (cbIndex >= 0) bodyScope.functions.push(_string("BEGIN_BODY")); // will be removed later
				node.body.children = bodyScope.functions.concat(node.body.children);
				if (bodyScope.hasThis && !node._inhibitThis) {
					bodyScope.vars.push(_identifier(_safeName(options.precious, "__this"), _node(node, THIS)));
				}
				if (bodyScope.hasArguments && !node._inhibitArguments) {
					bodyScope.vars.push(_identifier(_safeName(options.precious, "__arguments"), _identifier("arguments")));
				}
				if (bodyScope.vars.length > 0) {
					node.body.children.splice(0, 0, _node(node, VAR, bodyScope.vars));
				}
				// do not set _async flag
				return result;
			case VAR:
				var children = node.children.map(function(child) {
					if (!scope.vars.some(function(elt) {
						return elt.value == child.value;
					})) {
						scope.vars.push(_identifier(child.value));
					}
					if (!child.initializer) return null;
					child = _assignTemplate.generate(parent, {
						$lhs: _identifier(child.value),
						$rhs: child.initializer
					});
					if (parent.type === FOR) child = child.expression;
					return child;
				}).filter(function(child) {
					return child != null;
				});
				if (children.length == 0) {
					return;
				}
				var type = parent.type == BLOCK || parent.type === SCRIPT ? BLOCK : COMMA;
				var result = _node(parent, type, children);
				result = _propagate(result, _doIt);
				parent._async |= result._async;
				return result;
			case THIS:
				scope.hasThis = true;
				return _identifier(_safeName(options.precious, "__this"));
			case IDENTIFIER:
				if (node.value === "arguments") {
					scope.hasArguments = true;
					//if (!options.ninja) throw new Error("To use 'arguments' inside streamlined function, read the doc and set the 'ninja' option");
					return _identifier(_safeName(options.precious, "__arguments"));
				}
				node = _propagate(node, _doIt);
				node._async |= node.value === options.callback;
				if (node._async && !parent.isArgsList && // func(_) is ok
					!(parent.type === PROPERTY_INIT && node === parent.children[0]) && // { _: 1 } is ok
					!(parent.type === DOT && node === parent.children[1]))
					throw new Error("invalid usage of '_'")
				parent._async |= node._async;
				return node;
			case NEW_WITH_ARGS:
				var cbIndex = node.children[1].children.reduce(function(index, arg, i) {
					if (arg.type !== IDENTIFIER || arg.value !== options.callback) return index;
					if (index < 0) return i;
					else throw new Error("duplicate _ argument");
				}, -1);
				if (cbIndex >= 0) {
					var constr = _node(node, CALL, [_identifier(_safeName(options.precious, '__construct')), _node(node, LIST, [node.children[0], _number(cbIndex)])]);
					node = _node(node, CALL, [constr, node.children[1]]);
				}
				node.children[1].isArgsList = true;
				node = _propagate(node, _doIt);
				parent._async |= node._async;
				return node;
			case CALL:
				node.children[1].isArgsList = true;
				_convertCoffeeScriptCalls(node, options);
				_convertApply(node, options);
				node.children[1].isArgsList = true;
				// fall through
			default:
				// todo: set breaks flag
				node = _propagate(node, _doIt);
				_setBreaks(node);
				parent._async |= node._async;
				return node;
			}
		}
		return _propagate(node, _doIt);
	}

	function _convertCoffeeScriptCalls(node, options) {
		// takes care of anonymous functions inserted by 
		// CoffeeScript compiler
		var fn = node.children[0];
		var args = node.children[1];
		if (fn.type === FUNCTION && fn.params.length === 0 && !fn.name && args.children.length == 0) {
			// (function() { ... })() 
			// --> (function(_) { ... })(_)
			fn._noFuture = true;
			fn.name = "___closure";
			fn.params = [options.callback];
			args.children = [_identifier(options.callback)];
		} else if (fn.type === DOT) {
			var ident = fn.children[1];
			fn = fn.children[0];
			if (fn.type === FUNCTION && fn.params.length === 0 && !fn.name && ident.type === IDENTIFIER) {
				if (ident.value === "call" && args.children.length === 1 && args.children[0].type === THIS) {
					// (function() { ... }).call(this) 
					// --> (function(_) { ... })(_)
					node.children[0] = fn;
					fn._noFuture = true;
					fn.name = "___closure";
					fn.params = [options.callback];
					args.children = [_identifier(options.callback)];
					node._scope.hasThis = true;
					fn._inhibitThis = true;
				} else if (ident.value === "apply" && args.children.length === 2 && args.children[0].type === THIS && args.children[1].type === IDENTIFIER && args.children[1].value === "arguments") {
					// (function() { ... }).apply(this, arguments) 
					// --> (function(_) { ... })(_)
					node.children[0] = fn;
					fn._noFuture = true;
					fn.name = "___closure";
					fn.params = [options.callback];
					args.children = [_identifier(options.callback)];
					node._scope.hasThis = true;
					node._scope.hasArguments = true;
					fn._inhibitThis = true;
					fn._inhibitArguments = true;
				}
			}
		}
	}

	function _isFatArrow(node) {
		//this.method = function(_) {
        //	return Test.prototype.method.apply(_this, arguments);
      	//};
      	// Params may vary but so we only test body.
      	if (node.body.children.length !== 1) return false;
      	var n = node.body.children[0];
      	if (n.type !== RETURN || !n.value) return false;
      	n = n.value;
      	if (n.type !== CALL) return false;
      	var args = n.children[1].children;
      	var target = n.children[0];
      	if (args.length !== 2 || args[0].value !== '_this' || args[1].value !== 'arguments') return false;
      	if (target.type !== DOT || target.children[1].value !== 'apply') return false;
      	target = target.children[0];
      	if (target.type !== DOT || target.children[1].type !== IDENTIFIER) return false;
      	target = target.children[0];
      	if (target.type !== DOT || target.children[1].value !== 'prototype') return false;
      	target = target.children[0];
      	if (target.type !== IDENTIFIER) return false;
      	// Got it. Params are useless so nuke them
      	node.params = [];
      	return true;
    }

	function _convertApply(node, options) {
		// f.apply(this, arguments) -> __apply(_, f, __this, __arguments, cbIndex)
		var dot = node.children[0];
		var args = node.children[1];
		if (dot.type === DOT) {
			var ident = dot.children[1];
			if (ident.type === IDENTIFIER && ident.value === "apply" && args.children.length === 2 && args.children[0].type === THIS && args.children[1].type === IDENTIFIER && args.children[1].value === "arguments") {
				var f = dot.children[0];
				node.children[0] = _identifier('__apply');
				args.children = [_identifier(options.callback), f, _identifier('__this'), _identifier('__arguments'), _number(node._scope.cbIndex)];
				node._scope.hasThis = true;
				node._scope.hasArguments = true;
			}
		}
	}

	var _switchVarTemplate = new Template("canon", "{ var $v = true; }");
	var _switchIfTemplate = new Template("canon", "if ($v) { $block; }");

	function _setBreaks(node) {
		switch (node.type) {
		case IF:
			node._breaks = node.thenPart._breaks && node.elsePart && node.elsePart._breaks;
			break;
		case SWITCH:
			for (var i = 0; i < node.cases.length; i++) {
				var stmts = node.cases[i].statements;
				if (node._async && stmts.children.length > 0 && !stmts._breaks) {
					// narcissus has the strange idea of inserting an empty default after last case.
					// If we detect this and if the last case is not terminated by a break, we do not consider it an error 
					// and we just fix it by adding a break.
					if (i == node.cases.length - 2 && node.cases[i + 1].type === DEFAULT && node.cases[i + 1].statements.children.length === 1 && node.cases[i + 1].statements.children[0].type === SEMICOLON && node.cases[i + 1].statements.children[0].expression == null) {
						stmts.children.push(_node(node, BREAK));
						stmts._breaks = true;
					} else if (i === node.cases.length - 1) {
						stmts.children.push(_node(node, BREAK));
						stmts._breaks = true;
					} else {
						// we rewrite:
						//		case A: no_break_A
						//		case B: no_break_B
						//		case C: breaking_C
						//
						// as:
						//		case A: var __A = true;
						//		case B: var __B = true;
						//		case C:
						//			if (__A) no_break_A
						//			if (__B) no_break_B
						//			breaking_C
						var v = _identifier(_genId(node));
						node.cases[i].statements = _switchVarTemplate.generate(node.cases[i], {
							$v: v,
						});
						var ifStmt = _switchIfTemplate.generate(node.cases[i], {
							$v: v,
							$block: stmts,
						});
						node.cases[i + 1].statements.children.splice(0, 0, ifStmt);
					}
				}
			}
			break;
		case TRY:
			node._breaks = node.tryBlock._breaks && node.catchClauses[0] && node.catchClauses[0].block._breaks;
			break;
		case BLOCK:
		case SCRIPT:
			node.children.forEach(function(child) {
				node._breaks |= child._breaks;
			});
			break;
		case RETURN:
		case THROW:
		case BREAK:
			node._breaks = true;
			break;
		}
	}

	/*
	 * Flow canonicalization pass:
	 *   Converts all loops to FOR format
	 *   Converts lazy expressions
	 *   Splits try/catch/finally
	 *   Wraps isolated statements into blocks
	 */

	function _statementify(exp) {
		if (!exp) return exp;
		var block = _node(exp, BLOCK, []);

		function uncomma(node) {
			if (node.type === COMMA) {
				node.children.forEach(uncomma);
			} else {
				block.children.push(node.type == SEMICOLON ? node : _semicolon(node));
			}
		}
		uncomma(exp);
		return block;

	}

	function _blockify(node) {
		if (!node || node.type == BLOCK) return node;
		if (node.type == COMMA) return _statementify(node);
		var block = _node(node, BLOCK, [node]);
		block._async = node._async;
		return block;
	}

	var _flowsTemplates = {
		WHILE: new Template("flows", "{" + //
		"	for (; $condition;) {" + //
		"		$body;" + //
		"	}" + //
		"}"),

		DO: new Template("flows", "{" + //
		"	var $firstTime = true;" + //
		"	for (; $firstTime || $condition;) {" + //
		"		$firstTime = false;" + //
		"		$body;" + //
		"	}" + //
		"}"),

		FOR: new Template("flows", "{" + //
		"	$setup;" + //
		"	for (; $condition; $update) {" + //
		"		$body;" + //
		"	}" + //
		"}"),

		FOR_IN: new Template("flows", "{" + //
		"	var $array = __forIn($object);" + //
		"	var $i = 0;" + //
		"	for (; $i < $array.length;) {" + //
		"		$iter = $array[$i++];" + //
		"		$body;" + //
		"	}" + //
		"}"),

		TRY: new Template("flows", "" + //
		"try {" + //
		"	try { $try; }" + //
		"	catch ($ex) { $catch; }" + //
		"}" + //
		"finally { $finally; }"),

		AND: new Template("flows", "" + //
		"return (function $name(_){" + //
		"	var $v = $op1;" + //
		"	if (!$v) {" + //
		"		return $v;" + //
		"	}" + //
		"	return $op2;" + //
		"})(_)", true, true),

		OR: new Template("flows", "" + //
		"return (function $name(_){" + //
		"	var $v = $op1;" + //
		"	if ($v) {" + //
		"		return $v;" + //
		"	}" + //
		"	return $op2;" + //
		"})(_)", true, true),

		HOOK: new Template("flows", "" + //
		"return (function $name(_){" + //
		"	var $v = $condition;" + //
		"	if ($v) {" + //
		"		return $true;" + //
		"	}" + //
		"	return $false;" + //
		"})(_);", true, true),

		COMMA: new Template("flows", "" + //
		"return (function $name(_){" + //
		"	$body;" + //
		"	return $result;" + //
		"})(_);", true, true),

		CONDITION: new Template("flows", "" + //
		"return (function $name(_){" + //
		"	return $condition;" + //
		"})(_);", true, true),

		UPDATE: new Template("flows", "" + //
		"return (function $name(_){" + //
		"	$update;" + //
		"})(_);", true, true)
	};

	function _canonFlows(node, options) {
		function _doIt(node, parent, force) {
			var scope = node._scope;

			function _doAsyncFor(node) {
				// extra pass to wrap async condition and update
				if (node.condition && node.condition._async && node.condition.type !== CALL) node.condition = _flowsTemplates.CONDITION.generate(node, {
					$name: "__$" + node._scope.name,
					$condition: _doIt(node.condition, node, true),
				});
				if (node.update && node.update._async) node.update = _flowsTemplates.UPDATE.generate(node, {
					$name: "__$" + node._scope.name,
					$update: _statementify(node.update)
				});
			}
			if (node.type == FOR && node._pass === "flows") _doAsyncFor(node);
			if (!scope || !scope.isAsync() || (!force && node._pass === "flows")) return _propagate(node, _doIt);

			switch (node.type) {
			case IF:
				node.thenPart = _blockify(node.thenPart);
				node.elsePart = _blockify(node.elsePart);
				break;
			case SWITCH:
				if (node._async) {
					var def = node.cases.filter(function(n) {
						return n.type == DEFAULT
					})[0];
					if (!def) {
						def = _node(node, DEFAULT);
						def.statements = _node(node, BLOCK, []);
						node.cases.push(def);
					}
					if (!def._breaks) {
						def.statements.children.push(_node(node, BREAK))
					}
				}
				break;
			case WHILE:
				node.body = _blockify(node.body);
				if (node._async) {
					node = _flowsTemplates.WHILE.generate(node, {
						$condition: node.condition,
						$body: node.body
					});
				}
				break;
			case DO:
				node.body = _blockify(node.body);
				if (node._async) {
					node = _flowsTemplates.DO.generate(node, {
						$firstTime: _identifier(_genId(node)),
						$condition: node.condition,
						$body: node.body
					});
				}
				break;
			case FOR:
				node.condition = node.condition || _number(1);
				node.body = _blockify(node.body);
				if (node._async) {
					if (node.setup) {
						node = _flowsTemplates.FOR.generate(node, {
							$setup: _statementify(node.setup),
							$condition: node.condition,
							$update: node.update,
							$body: node.body
						});
					} else {
						if (node._pass !== "flows") {
							node._pass = "flows";
							_doAsyncFor(node);
						}
					}
				}
				break;
			case FOR_IN:
				node.body = _blockify(node.body);
				if (node._async) {
					if (node.iterator.type != IDENTIFIER) {
						throw new Error("unsupported 'for ... in' syntax: type=" + _tag(node.iterator));
					}
					node = _flowsTemplates.FOR_IN.generate(node, {
						$array: _identifier(_genId(node)),
						$i: _identifier(_genId(node)),
						$object: node.object,
						$iter: node.iterator,
						$body: node.body
					});
				}
				break;
			case TRY:
				if (node.tryBlock && node.catchClauses[0] && node.finallyBlock) {
					node = _flowsTemplates.TRY.generate(node, {
						$try: node.tryBlock,
						$catch: node.catchClauses[0].block,
						$ex: node.catchClauses[0].varName,
						$finally: node.finallyBlock
					})
				}
				break;
			case AND:
			case OR:
				if (node._async) {
					node = _flowsTemplates[_tag(node)].generate(node, {
						$name: "__$" + node._scope.name,
						$v: _identifier(_genId(node)),
						$op1: node.children[0],
						$op2: node.children[1]
					});
				}
				break;
			case HOOK:
				if (node._async) {
					node = _flowsTemplates.HOOK.generate(node, {
						$name: "__$" + node._scope.name,
						$v: _identifier(_genId(node)),
						$condition: node.children[0],
						$true: node.children[1],
						$false: node.children[2]
					});
				}
				break;

			case COMMA:
				if (node._async) {
					node = _flowsTemplates.COMMA.generate(node, {
						$name: "__$" + node._scope.name,
						$body: _node(node, BLOCK, node.children.slice(0, node.children.length - 1).map(_semicolon)),
						$result: node.children[node.children.length - 1]
					});
				}
				break;
			}
			return _propagate(node, _doIt);
		}
		return _propagate(node, _doIt);
	}

	/*
	 * Disassembly pass
	 */

	function _split(node, prop) {
		var exp = node[prop];
		if (!exp || !exp._async) return node;
		var id = _genId(node);
		var v = _identifier(id, exp);
		node[prop] = _identifier(id);
		return _node(node, BLOCK, [_node(node, VAR, [v]), node]);
	}

	function _disassemble(node, options) {
		function _disassembleIt(node, parent, noResult) {
			if (!node._async) return _propagate(node, _scanIt);
			node = _propagate(node, _disassembleIt);
			if (node.type === CALL) {
				if (node.children[0].type === IDENTIFIER && node.children[0].value.indexOf('__wrap') == 0) {
					node._isWrapper = true;
					return node;
				}
				var args = node.children[1];
				if (args.children.some(function(arg) {
					return (arg.type === IDENTIFIER && arg.value === options.callback) || arg._isWrapper;
				})) {
					if (noResult) {
						node._scope.disassembly.push(_statementify(node));
						return;
					} else {
						if (parent.type == IDENTIFIER && parent.value.indexOf('__') === 0) {
							// don't generate another ID, use the parent one
							node._skipDisassembly = true;
							return node;
						}
						var id = _genId(node);
						var v = _identifier(id, node);
						node = _node(node, VAR, [v]);
						node._scope.disassembly.push(node);
						return _identifier(id);
					}
				}
			}
			return node;
		}

		function _scanIt(node, parent) {
			var scope = node._scope;
			if (!scope || !scope.isAsync() || !node._async) return _propagate(node, _scanIt);
			switch (node.type) {
			case IF:
				node = _split(node, "condition");
				break;
			case SWITCH:
				node = _split(node, "discriminant");
				break;
			case FOR:
				break;
			case RETURN:
				node = _split(node, "value");
				break;
			case THROW:
				node = _split(node, "exception");
				break;
			case VAR:
				_assert(node.children.length === 1);
				var ident = node.children[0];
				scope.disassembly = [];
				ident.initializer = _disassembleIt(ident.initializer, ident);
				node._async = ident.initializer._skipDisassembly;
				scope.disassembly.push(node);
				return _node(parent, BLOCK, scope.disassembly);
			case SEMICOLON:
				scope.disassembly = [];
				node.expression = _disassembleIt(node.expression, node, true);
				if (node.expression) {
					node._async = false;
					scope.disassembly.push(node);
				}
				return _node(parent, BLOCK, scope.disassembly);
			}
			return _propagate(node, _scanIt);
		}
		return _propagate(node, _scanIt);

	}

	/*
	 * Transformation pass - introducing callbacks
	 */
	var _cbTemplates = {
		FUNCTION: new Template("cb", "{" + //
		"	$decls;" + //
		"	var __frame = { name: $fname, line: $line };" + //
		"	return __func(_, this, arguments, $fn, $index, __frame, function $name(){" + //
		"		$body;" + //
		"		_();" + //
		"	});" + //
		"}"),

		FUNCTION_INTERNAL: new Template("cb", "{ $decls; $body; _(); }"),

		RETURN: new Template("cb", "return _(null, $value);"),

		RETURN_UNDEFINED: new Template("cb", "return _(null);"),

		THROW: new Template("cb", "return _($exception);"),

		IF: new Template("cb", "" + //
		"return (function $name(__then){" + //
		"	if ($condition) { $then; __then(); }" + //
		"	else { $else; __then(); }" + //
		"})(function $name(){ $tail; });"),

		SWITCH: new Template("cb", "" + // 
		"return (function $name(__break){" + //
		"	$statement;" + //
		"})(function $name(){ $tail; });"),

		LABEL: new Template("cb", "" + // 
		"$statement;" + //
		"$tail;"),

		BREAK: new Template("cb", "return __break();"),
		
		LABELLED_BREAK: new Template("cb", "return $break();"),

		CONTINUE: new Template("cb", "" + //
		"while (__more) { __loop(); } __more = true;" + //
		"return;"),

		LABELLED_CONTINUE: new Template("cb", "" + //
		"while ($more.get()) { $loop(); } $more.set(true);" + //
		"return;"),

		LOOP1: new Template("cb", "" + //
		"if ($v) {" + //
		"	$body;" + //
		"	while (__more) { __loop(); } __more = true;" + //
		"}" + //
		"else { __break(); }"),

		// LOOP2 is in temp pass so that it gets transformed if update is async
		LOOP2: new Template("temp", "var $v = $condition; $loop1;"),

		LOOP2_UPDATE: new Template("temp", "" + //
		"if ($beenHere) { $update; } else { $beenHere = true; }" + //
		"var $v = $condition; $loop1;"),

		FOR: new Template("cb", "" + //
		"return (function ___(__break){" + //
		"	var __more;" + //
		"	var __loop = __cb(_, __frame, 0, 0, function $name(){" + //
		"		__more = false;" + //
		"		$loop2" + //
		"	});" + //
		"	do { __loop(); } while (__more); __more = true;" + //
		"})(function $name(){ $tail;});"),

		LABELLED_FOR: new Template("cb", "" + //
		"return (function ___(__break){" + //
		"	var __more, $more = { get: function() { return __more; }, set: function(v) { __more = v; }};" + //
		"	var __loop = __cb(_, __frame, 0, 0, function $name(){" + //
		"		var $break = __break, $loop = __loop;" + //
		"		__more = false;" + //
		"		$loop2" + //
		"	});" + //
		"	do { __loop(); } while (__more); __more = true;" + //
		"})(function $name(){ $tail;});"),

		FOR_UPDATE: new Template("cb", "" + //
		"var $beenHere = false;" + //
		"return (function ___(__break){" + //
		"	var __more;" + //
		"	var __loop = __cb(_, __frame, 0, 0, function $name(){" + //
		"		__more = false;" + //
		"		$loop2" + //
		"	});" + //
		"	do { __loop(); } while (__more); __more = true;" + //
		"})(function $name(){ $tail; });"),

		LABELLED_FOR_UPDATE: new Template("cb", "" + //
		"var $beenHere = false;" + //
		"return (function ___(__break){" + //
		"	var __more, $more = { get: function() { return __more; }, set: function(v) { __more = v; }};" + //
		"	var __loop = __cb(_, __frame, 0, 0, function $name(){" + //
		"		var $break = __break, $loop = __loop;" + //
		"		__more = false;" + //
		"		$loop2" + //
		"	});" + //
		"	do { __loop(); } while (__more); __more = true;" + //
		"})(function $name(){ $tail; });"),

		CATCH: new Template("cb", "" + //
		"return (function ___(__then){" + //
		"	(function ___(_){" + //
		"		__tryCatch(_, function $name(){ $try; __then(); });" + //
		"	})(function ___($ex, __result){" + //
		"		__catch(function $name(){" + //
		"			if ($ex) { $catch; __then(); }" + //
		"			else { _(null, __result); }" + //
		"		});" + //
		"	});" + //
		"})(function ___(){" + //
		"	__tryCatch(_, function $name(){ $tail; });" + //
		"});"),

		FINALLY: new Template("cb", "" + //
		"return (function ___(__then){" + //
		"	(function ___(_){" + //
		"		__tryCatch(_, function $name(){ $try; _(null, null, true); });" + //
		"	})(function ___(__e, __r, __cont){" + //
		"		(function ___(__then){" + //
		"			__tryCatch(_, function $name(){ $finally; __then(); });" + //
		"		})(function ___(){" + //
		"			__tryCatch(_, function ___(){" + //
		"				if (__cont) __then(); else _(__e, __r);" + //
		"			});" + //
		"		})" + //
		"	});" + //
		"})(function ___(){" + //
		"	__tryCatch(_, function $name(){ $tail; });" + //
		"});"),

		CALL_VOID: new Template("cb", "return __cb(_, __frame, $offset, $col, function $name(){ $tail; }, true, $returnArray)", true),

		CALL_TMP: new Template("cb", "return __cb(_, __frame, $offset, $col, function ___(__0, $result){ $tail }, true, $returnArray)", true),

		CALL_RESULT: new Template("cb", "" + //
		"return __cb(_, __frame, $offset, $col, function $name(__0, $v){" + //
		"	var $result = $v;" + //
		"	$tail" + //
		"}, true, $returnArray)", true)
	};

	function _callbackify(node, options) {
		var label;
		function _scanIt(node, parent) {
			//console.log("CBIT: " + _tag(node) + " " + pp(node))
			node = _flatten(node);
			if (!node._scope || !node._scope.isAsync() || node._pass === "cb") return _propagate(node, _scanIt);
			switch (node.type) {
			case SCRIPT:
				if (parent._pass !== "cb") {
					// isolate the leading decls from the body because 'use strict'
					// do not allow hoisted functions inside try/catch
					var decls;
					for (var cut = 0; cut < node.children.length; cut++) {
						var child = node.children[cut];
						if (child.type === STRING && child.value === "BEGIN_BODY") {
							decls = node.children.splice(0, cut);
							node.children.splice(0, 1);
							break;
						}
					}
					var template = parent._noFuture || parent._pass === "flows" ? _cbTemplates.FUNCTION_INTERNAL : _cbTemplates.FUNCTION;
					node = template.generate(node, {
						$fn: parent.name,
						//node._scope.name ? _identifier(node._scope.name) : _node(node, NULL),
						$name: "__$" + node._scope.name,
						$fname: _string(parent.name),
						$line: _number(originalLine(options, node._scope.line)),
						$index: _number(node._scope.cbIndex),
						$decls: _node(node, BLOCK, decls || []),
						$body: node
					});
				}
				node.type = SCRIPT;
				// continue with block restructure
			case BLOCK:
				for (var i = 0; i < node.children.length; i++) {
					node.children[i] = _restructureIt(node, i);
				}
				return node;
			}
			return _propagate(node, _scanIt);
		}

		function _extractTail(parent, i) {
			return _node(parent, BLOCK, parent.children.splice(i + 1, parent.children.length - i - 1));
		}

		function _restructureIt(parent, i) {
			var node = parent.children[i];
			if (node._pass === "cb") return _propagate(node, _scanIt);
			//console.log("RESTRUCTUREIT: " + _tag(node) + " " + pp(node))
			switch (node.type) {
			case RETURN:
				_extractTail(parent, i);
				var template = node.value ? _cbTemplates.RETURN : _cbTemplates.RETURN_UNDEFINED;
				node = template.generate(node, {
					$value: node.value
				});
				break;
			case THROW:
				_extractTail(parent, i);
				node = _cbTemplates.THROW.generate(node, {
					$exception: node.exception
				});
				break;
			case BREAK:
				if (node.target && !node.target._async) {
					break;
				}
				_extractTail(parent, i);
				if (node.label) {
					node = _cbTemplates.LABELLED_BREAK.generate(node, {
						$break: _safeName(options.precious, '__break__' + node.label)
					});
				} else {
					node = _cbTemplates.BREAK.generate(node, {});					
				}
				break;
			case CONTINUE:
				if (node.target && !node.target._async) {
					break;
				}
				_extractTail(parent, i);
				if (node.label) {
					node = _cbTemplates.LABELLED_CONTINUE.generate(node, {
						$loop: _safeName(options.precious, '__loop__' + node.label),
						$more: _safeName(options.precious, '__more__' + node.label),
					});					
				} else {
					node = _cbTemplates.CONTINUE.generate(node, {});					
				}
				break;
			case TRY:
				var tail = _extractTail(parent, i);
				if (node.catchClauses[0]) {
					node = _cbTemplates.CATCH.generate(node, {
						$name: "__$" + node._scope.name,
						$try: node.tryBlock,
						$catch: node.catchClauses[0].block,
						$ex: node.catchClauses[0].varName,
						$tail: tail
					});
				} else {
					node = _cbTemplates.FINALLY.generate(node, {
						$name: "__$" + node._scope.name,
						$try: node.tryBlock,
						$finally: node.finallyBlock,
						$tail: tail
					});
				}
				break;
			default:
				if (node._async) {
					var tail = _extractTail(parent, i);
					switch (node.type) {
					case IF:
						node = _cbTemplates.IF.generate(node, {
							$name: "__$" + node._scope.name,
							$condition: node.condition,
							$then: node.thenPart,
							$else: node.elsePart || _node(node, BLOCK, []),
							$tail: tail
						});
						break;
					case SWITCH:
						node._pass = "cb"; // avoid infinite recursion
						node = _cbTemplates.SWITCH.generate(node, {
							$name: "__$" + node._scope.name,
							$statement: node,
							$tail: tail
						});
						break;
					case LABEL:
						var l = label;
						label = node.label;
						node = _cbTemplates.LABEL.generate(node, {
							$name: "__$" + node._scope.name,
							$statement: node.statement,
							$tail: tail
						});
						node = _scanIt(node, parent);
						label = l;
						return node;
					case FOR:
						var v = _identifier(_genId(node));
						var loop1 = _cbTemplates.LOOP1.generate(node, {
							$v: v,
							$body: node.body,
						});
						var update = node.update;
						var beenHere = update && _identifier(_genId(node));
						var loop2 = (update ? _cbTemplates.LOOP2_UPDATE : _cbTemplates.LOOP2).generate(node, {
							$v: v,
							$condition: node.condition,
							$beenHere: beenHere,
							$update: _statementify(update),
							$loop1: loop1
						});
						node = (update 
							? (label ? _cbTemplates.LABELLED_FOR_UPDATE : _cbTemplates.FOR_UPDATE) 
							: (label ? _cbTemplates.LABELLED_FOR : _cbTemplates.FOR)).generate(node, {
							$name: "__$" + node._scope.name,
							$loop: _identifier(_safeName(options.precious, '__loop__' + label)),
							$break: _identifier(_safeName(options.precious, '__break__' + label)),
							$more: _identifier(_safeName(options.precious, '__more__' + label)),
							$beenHere: beenHere,
							$loop2: loop2,
							$tail: tail

						});
						break;
					case VAR:
						_assert(node.children.length == 1);
						var ident = node.children[0];
						_assert(ident.type === IDENTIFIER);
						var call = ident.initializer;
						delete ident.initializer;
						_assert(call && call.type === CALL);
						return _restructureCall(call, tail, ident.value);
					case SEMICOLON:
						var call = node.expression;
						_assert(call.type === CALL)
						return _restructureCall(call, tail);
					default:
						throw new Error("internal error: bad node type: " + _tag(node) + ": " + pp(node));
					}
				}
			}
			return _scanIt(node, parent);

			function _restructureCall(node, tail, result) {
				var args = node.children[1];

				function _cbIndex(args) {
					return args.children.reduce(function(index, arg, i) {
						if ((arg.type == IDENTIFIER && arg.value === options.callback) || arg._isWrapper) return i;
						else return index;
					}, -1);
				}
				var i = _cbIndex(args);
				_assert(i >= 0);
				var returnArray = args.children[i]._returnArray;
				if (args.children[i]._isWrapper) {
					args = args.children[i].children[1];
					i = _cbIndex(args);
				}
				// find the appropriate node for this call:
				// e.g. for "a.b(_)", find the node "b"
				var identifier = node.children[0];
				while (identifier.type == DOT) {
					identifier = identifier.children[1];
				}
				var bol = options.source.lastIndexOf('\n', identifier.start) + 1;
				var col = identifier.start - bol;
				args.children[i] = (result ? result.indexOf('__') === 0 ? _cbTemplates.CALL_TMP : _cbTemplates.CALL_RESULT : _cbTemplates.CALL_VOID).generate(node, {
					$v: _genId(node),
					$frameName: _string(node._scope.name),
					$offset: _number(originalLine(options, identifier.lineno, col) - originalLine(options, node._scope.line)),
					$col: _number(originalCol(options, identifier.lineno, col)),
					$name: "__$" + node._scope.name,
					$returnArray: returnArray,
					$result: result,
					$tail: tail
				});
				node = _propagate(node, _scanIt);

				var stmt = _node(node, RETURN, []);
				stmt.value = node;
				stmt._pass = "cb";
				return stmt;
			}
		}
		return _propagate(node, _scanIt);
	}

	/*
	 * Simplify pass - introducing callbacks
	 */

	function _checkUsed(val, used) {
		if (typeof val === "string" && val.substring(0, 2) === "__") used[val] = true;
	}


	var _optims = {
		function__0$fn: new Template("simplify", "return function ___(__0) { $fn(); }", true).root,
		function$return: new Template("simplify", "return function $fn1() { return $fn2(); }", true).root,
		function__0$arg1return_null$arg2: new Template("simplify", "return function ___(__0, $arg1) { return _(null, $arg2); }", true).root,
		__cb__: new Template("simplify", "return __cb(_, $frameVar, $line, $col, _)", true).root,
		__cbt__: new Template("simplify", "return __cb(_, $frameVar, $line, $col, _, true)", true).root,
		function$fn: new Template("simplify", "return function $fn1() { $fn2(); }", true).root,
		closure: new Template("simplify", "return (function ___closure(_){ $body; })(__cb(_,$frameVar,$line,$col,function $fnName(){_();},true))", true).root,
		safeParam: new Template("simplify", "return (function $fnName($param){ $body; })(function $fnName(){_();})", true).root,
	}

	function _simplify(node, options, used) {
		if (node._simplified) return node;
		node._simplified = true;
		_propagate(node, function(child) {
			return _simplify(child, options, used)
		});
		_checkUsed(node.value, used);

		function _match(prop, v1, v2, result) {
			var ignored = ["parenthesized", "lineno", "start", "end", "tokenizer", "hasReturnWithValue"];
			if (prop.indexOf('_') == 0 || ignored.indexOf(prop) >= 0) return true;
			if (v1 == v2) return true;
			if (v1 == null || v2 == null) {
				// ignore difference between null and empty array
				if (prop == "children" && v1 && v1.length === 0) return true;
				return false;
			}
			if (Array.isArray(v1)) {
				if (v1.length != v2.length) return false;
				for (var i = 0; i < v1.length; i++) {
					if (!_match(prop, v1[i], v2[i], result)) return false;
				}
				return true;
			}
			if (v1.type === IDENTIFIER && v1.value[0] === "$" && v2.type === NUMBER) {
				result[v1.value] = v2.value;
				return true;
			}
			if (typeof v1 == "string" && v1[0] == "$" && typeof v2 == "string") {
				result[v1] = v2;
				return true;
			}
			if (v1.type) {
				var exp;
				if (v1.type == SCRIPT && v1.children[0] && (exp = v1.children[0].expression) && typeof exp.value == "string" && exp.value[0] == '$') {
					result[exp.value] = v2;
					return true;
				}
				if (v1.type != v2.type) return false;
				if (v1.type == IDENTIFIER && v1.value == '$') {
					result[v1.value] = v2.value;
					return true;
				}

				for (var prop in v1) {
					if (v1.hasOwnProperty(prop) && prop.indexOf("Decls") < 0 && prop != "target") {
						if (!_match(prop, v1[prop], v2[prop], result)) return false;
					}
				}
				return true;
			}
			return false;
		}

		var result = {};
		if (_match("", _optims.function__0$fn, node, result)) return _identifier(result.$fn);
		if (_match("", _optims.function$return, node, result) && (result.$fn1 === '___' || result.$fn1.indexOf('__$') === 0) && (result.$fn2 === '__break')) return _identifier(result.$fn2);
		if (_match("", _optims.function__0$arg1return_null$arg2, node, result) && result.$arg1 == result.$arg2) return _identifier("_");
		if (options.optimize && _match("", _optims.__cb__, node, result)) return _identifier("_");
		if (options.optimize && _match("", _optims.__cbt__, node, result)) return _identifier("_");
		if (_match("", _optims.function$fn, node, result) && (result.$fn1 === '___' || result.$fn1.indexOf('__$') === 0) && (result.$fn2 === '__then' || result.$fn2 === '__loop')) return _identifier(result.$fn2);
		if (_match("", _optims.closure, node, result)) node.children[1] = _identifier("_");
		if (_match("", _optims.safeParam, node, result) && (result.$param === '__then' || result.$param === '__break')) node.children[1] = _identifier("_");
		_flatten(node);
		return node;
	}

	function _extend(obj, other) {
		for (var i in other) {
			obj[i] = other[i];
		}
		return obj;
	}

	function _cl(obj) {
		return _extend({}, obj);
	}

	/// * `transformed = transform.transform(source, options)`  
	///   Transforms streamline source.  
	///   The following `options` may be specified:
	///   * `sourceName` identifies source (stack traces, transformation errors)
	///   * `lines` controls line mapping
	//    Undocumented options:
	//    * (obsolete) `callback` alternative identifier if `_` is already used 
	//    * (internal) `noHelpers` disables generation of helper functions (`__cb`, etc.)
	//    * (internal) `optimize` optimizes transform (but misses stack frames)
	exports.transform = function(source, options) {
		try {
			source = source.replace(/\r\n/g, "\n");
			options = options ? _extend({}, options) : {}; // clone to isolate options set at file level
			var sourceOptions = /streamline\.options\s*=\s*(\{.*\})/.exec(source);
			if (sourceOptions) {
				_extend(options, JSON.parse(sourceOptions[1]));
			}
			options.source = source;
			options.callback = options.callback || "_";
			options.lines = options.lines || "preserve";
			options.precious = {}; // identifiers found inside source
			//console.log("TRANSFORMING " + options.sourceName)
			//console.log("source=" + source);
			var node = parse(source + "\n", options.sourceName); // final newline avoids infinite loop if unterminated string literal at the end
			var strict = node.children[0] && node.children[0].expression && node.children[0].expression.value == "use strict";
			strict && node.children.splice(0, 1);
			_markSource(node, options);
			//console.log("tree=" + node);
			node = _canonTopLevelScript(node, options);
			//console.log("CANONTOPLEVEL=" + pp(node));
			node = _canonScopes(node, options);
			//console.log("CANONSCOPES=" + pp(node));
			if (!options.needsTransform) return source;
			node = _canonFlows(node, options);
			//console.log("CANONFLOWS=" + pp(node));
			node = _disassemble(node, options);
			//console.log("DISASSEMBLE=" + pp(node))
			node = _callbackify(node, options);
			//console.log("CALLBACKIFY=" + pp(node))
			var used = {};
			node = _simplify(node, options, used);

			var result = format(node, options.lines);

			// add helpers at beginning so that __g is initialized before any other code
			if (!options.noHelpers) {
				var s = exports.helpersSource(options, used, strict);
				if (options.lines == "sourcemap") {
					result.prepend(s);
				} else {
					result = s + result;
				}
			}
			//console.log("result=" + result);
			//console.log("TRANSFORMED " + options.sourceName + ": " + result.length)
			return result;
		} catch (err) {
			var message = "error streamlining " + (options.sourceName || 'source') + ": " + err.message;
			if (err.source && err.cursor) {
				var line = 1;
				for (var i = 0; i < err.cursor; i++) {
					if (err.source[i] === "\n") line += 1;
				}
				message += " on line " + line;
			} else if (err.stack) {
				message += "\nSTACK:\n" + err.stack;
			}
			throw new Error(message);
		}
	}
	// hack to fix #123
	exports.transform.version = exports.version;

	function _trim(fn) {
		return fn.toString().replace(/\s+/g, " ");
	}

	function include(mod, modules) {
		var source = modules + "['" + mod + "']=(mod={exports:{}});";
		source += "(function(module, exports){";
		var req = srequire; 	// prevents client side require from getting fs as a dependency
		source += req('fs').readFileSync(__dirname + '/../' + mod + '.js', 'utf8').replace(/(\/\/[^"\n]*\n|\/\*[\s\S]*?\*\/|\n)[ \t]*/g, "");
		source += "})(mod, mod.exports);";
		return source;
	}

	function requireRuntime(options) {
		if (!options.standalone) return "srequire('streamline/lib/callbacks/runtime').runtime(__filename, " + !!options.oldStyleFutures + ")";
		var modules = _safeName(options.precious, "__modules");
		var s = "(function(){var " + modules + "={},mod;";
		s += "function srequire(p){var m=" + modules + "[p.substring(15)]; return m && m.exports};";
		s += include('globals', modules);
		s += include('util/future', modules);
		s += include('callbacks/runtime', modules);
		if (['funnel', 'forEach_', 'map_', 'filter_', 'every_', 'some_', 'reduce_', 'reduceRight_', 'sort_', 'apply_'].some(function(name) {
				return options.precious[name];
			})) s += include('callbacks/builtins', modules);
		s += "return " + modules + "['callbacks/runtime'].exports.runtime('" + options.sourceName + "', " + !!options.oldStyleFutures + ");";
		s += "})()";
		return s;
	}

	// Undocumented (internal)
	exports.helpersSource = function(options, used, strict) {
		var srcName = "" + options.sourceName; // + "_.js";
		var i = srcName.indexOf('node_modules/');
		if (i == -1 && typeof process === 'object' && typeof process.cwd === 'function') i = process.cwd().length;
		srcName = i >= 0 ? srcName.substring(i + 13) : srcName;
		var sep = options.lines == "preserve" ? " " : "\n";
		strict = strict ? '"use strict";' + sep : "";
		var s = sep + strict;
		var keys = ['__g', '__func', '__cb', '__future', '__propagate', '__trap', '__catch', '__tryCatch', '__forIn', '__apply', '__construct', '__setEF'];
		var __rt = _safeName(options.precious, "__rt");
		s += "var " + __rt + "=" + requireRuntime(options);
		keys.forEach(function(key) {
			var k = _safeName(options.precious, key);
			if (used[k]) s += "," + k + "=" + __rt + "." + key;
		});
		s += ";" + sep;
		return s;
	}
})(typeof exports !== 'undefined' ? exports : (window.Streamline = window.Streamline || {}));
/**
 * Copyright (c) 2011 Bruno Jouhier <bruno.jouhier@sage.com>
 * MIT License
 */
(function(exports) {
	exports.future = function(fn, args, i) {
		var err, result, done, q = [], self = this;
		args = Array.prototype.slice.call(args);
		args[i] = function(e, r) {
			err = e, result = r, done = true;
			q && q.forEach(function(f) {
				f.call(self, e, r);
			});
			q = null;
		};
		fn.apply(this, args);
		return function F(cb) {
			if (typeof cb !== 'function') {
				if (cb !== false && !srequire('streamline/lib/globals').oldStyleFutures) throw new Error("no callback given (argument #0). If you're a Streamline user, more info: https://github.com/Sage/streamlinejs/blob/master/FAQ.md#no-callback-given-error");
				return F;
			}
			if (done) cb.call(self, err, result);
			else q.push(cb);
		};
	};

	exports.streamlinify = function(fn, idx) {
		return function() {
			if (!arguments[idx]) return exports.future.call(this, fn, arguments, idx);
			else return fn.apply(this, arguments);
		};
	};
})(typeof exports !== 'undefined' ? exports : (Streamline.future = Streamline.future || {}));

/**
 * Copyright (c) 2011 Bruno Jouhier <bruno.jouhier@sage.com>
 * MIT License
 */
(function(exports) {
	var __g = srequire("streamline/lib/globals");
	__g.runtime = 'callbacks';
	var __fut = srequire("streamline/lib/util/future");
	__g.context = __g.context || {};
	__g.depth = __g.depth || 0;

	__g.trampoline = (function() {
		var q = [];
		return {
			queue: function(fn) {
				q.push(fn);
			},
			flush: function() {
				__g.depth++;
				try {
					var fn;
					while (fn = q.shift()) fn();
				} finally {
					__g.depth--;
				}
			}
		}
	})();

	exports.runtime = function(filename, oldStyleFutures) {
		__g.oldStyleFutures = oldStyleFutures;
		function __func(_, __this, __arguments, fn, index, frame, body) {
			if (typeof _ !== 'function') {
				if (_ !== false && !__g.oldStyleFutures) throw new Error("no callback given (argument #" + index + "). If you're a Streamline user, more info: https://github.com/Sage/streamlinejs/blob/master/FAQ.md#no-callback-given-error");
				return __fut.future.call(__this, fn, __arguments, index);
			}
			frame.file = filename;
			frame.prev = __g.frame;
			__g.frame = frame;
			__g.depth === 0 && __g.emitter && __g.emitter.emit("resume");
			__g.depth++;
			try {
				frame.active = true;
				body();
			} catch (e) {
				// #### Commenting out the following line makes the error go to the error handler in run.js
				//__setEF(e, frame.prev);
				__propagate(_, e);
			} finally {
				frame.active = false;
				__g.frame = frame.prev;
				if (--__g.depth === 0 && __g.trampoline) __g.trampoline.flush();
				__g.depth === 0 && __g.emitter && __g.emitter.emit("yield");
			}
		}

		return {
			__g: __g,
			__func: __func,
			__cb: __cb,
			__future: __fut.future,
			__propagate: __propagate,
			__trap: __trap,
			__tryCatch: __tryCatch,
			__catch: __catch,
			__forIn: __forIn,
			__apply: __apply,
			__construct: __construct,
			__setEF: __setEF,
			streamlinify: __fut.streamlinify,
		};
	};

	function __cb(_, frame, offset, col, fn, trampo, returnArray) {
		frame.offset = offset;
		frame.col = col;
		var ctx = __g.context;
		return function ___(err, result) {
			if (returnArray) result = Array.prototype.slice.call(arguments, 1);
			returnArray = false; // so that we don't do it twice if we trampoline
			var oldFrame = __g.frame;
			__g.frame = frame;
			__g.context = ctx;
			__g.depth === 0 && __g.emitter && __g.emitter.emit("resume");
			__g.depth++;
			try {
				if (trampo && frame.active && __g.trampoline) {
					__g.trampoline.queue(function() {
						return ___(err, result);
					});
				} else {
					// detect extra callback. 
					// The offset/col test is necessary because __cb is also used by loops and called multiple times then.
					/*if (___.dispatched && (offset || col)) throw new Error("callback called twice");*/
					___.dispatched = true;
					if (err) {
						__setEF(err, frame);
						return _(err);
					}
					frame.active = true;
					return fn(null, result);
				}
			} catch (ex) {
				// #### Commenting out the following two lines makes the error go to the error handler in run.js
				//if (___.dispatched && _.name !== '___' && _.name !== '__trap') throw ex;
				//__setEF(ex, frame);
				return __propagate(_, ex);
			} finally {
				frame.active = false;
				__g.frame = oldFrame;
				if (--__g.depth === 0 && __g.trampoline) __g.trampoline.flush();
				__g.depth === 0 && __g.emitter && __g.emitter.emit("yield");
			}
		}
	}

	function __propagate(_, err) {
		try {
			_(err);
		} catch (ex) {
			__trap(ex);
		}
	}

	function __trap(err) {
		if (err) {
			if (__g.context && __g.context.errorHandler) __g.context.errorHandler(err);
			else process.nextTick(function() {
				throw err;
			});
		}
	}

	function __tryCatch(_, fn) {
		try {
			fn();
		} catch (e) {
			try {
				_(e);
			} catch (ex) {
				__trap(ex);
			}
		}
	}

	function __catch(fn) {
		var frame = __g.frame,
			context = __g.context;
		__g.trampoline.queue(function() {
			var oldFrame = __g.frame,
				oldContext = __g.context;
			__g.frame = frame;
			__g.context = context;
			try {
				fn();
			} finally {
				__g.frame = oldFrame;
				__g.context = oldContext;
			}
		});
	}

	function __forIn(object) {
		var array = [];
		for (var obj in object) {
			array.push(obj);
		}
		return array;
	}

	function __apply(cb, fn, thisObj, args, index) {
		if (cb == null) return __fut.future(__apply, arguments, 0);
		args = Array.prototype.slice.call(args, 0);
		args[index != null ? index : args.length] = cb;
		return fn.apply(thisObj, args);
	}

	function __construct(constructor, i) {
		var key = '__async' + i,
			f;
		return constructor[key] || (constructor[key] = function() {
			var args = arguments;

			function F() {
				var self = this;
				var cb = args[i];
				args[i] = function(e, r) {
					cb(e, self);
				};
				return constructor.apply(self, args);
			}
			F.prototype = constructor.prototype;
			return new F();
		});
	}

	function __setEF(e, f) {
		function formatStack(e, raw) {
			var ff = typeof navigator === 'object' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
			// firefox does not include message
			if (ff) raw = "Error: " + e.message + '\n' + raw;
			var s = raw,
				f, skip;
			if (s) {
				var lines = s.split('\n');
				s = lines[0] + '\n    <<< async stack >>>\n' + lines.slice(1).map(function(l) {
					// try to map firefox format to V8 format
					// ffOffset takes care of lines difference introduced by require.js script.
					var ffOffset = (typeof navigator === 'object' && typeof srequire === 'function' && srequire.async) ? 11 : 0;
					var m = /([^@]*)\@(.*?)\:(\d+)(?:\:(\d+))?$/.exec(l);
					l = m ? "    at " + m[1] + " (" + m[2] + ":" + (parseInt(m[3]) - ffOffset) + ":" + (m[4] || "0") + ")" : l;
					var i = l.indexOf('__$');
					if (i >= 0 && !skip) {
						skip = true;
						return l.substring(0, i) + l.substring(i + 3);
					}
					return skip ? '' : l;
				}).filter(function(l) {
					return l;
				}).join('\n');
				for (var f = e.__frame; f; f = f.prev) {
					if (f.offset >= 0) s += "\n    at " + f.name + " (" + f.file + ":" + (f.line + f.offset) + ":" + (f.col+1) + ")"
				}
			}
			var nl = raw.indexOf('\n');
			s += '\n    <<< raw stack >>>' + (nl >= 0 ? raw.substring(nl) : raw);
			return s;
		};
		e.__frame = e.__frame || f;
		if (exports.stackTraceEnabled && e.__lookupGetter__ && e.__lookupGetter__("rawStack") == null) {
			var getter = e.__lookupGetter__("stack");
			if (!getter) { // FF or Safari case
				var raw = e.stack || "raw stack unavailable";
				getter = function() {
					return raw;
				}
			}
			e.__defineGetter__("rawStack", getter);
			e.__defineGetter__("stack", function() {
				return formatStack(e, getter());
			});
		}
	}

	/// * `runtime.stackTraceEnabled = true/false;`
	///   If true, `err.stack` returns the reconstructed _sync_ stack trace.
	///   Otherwise, it returns the _raw_ stack trace.
	///   The default is true, but you must require the flows module
	///   at least once to enable sync stack traces.
	exports.stackTraceEnabled = true;
})(typeof exports !== 'undefined' ? exports : (Streamline.runtime = Streamline.runtime || {}));
srequire && srequire("streamline/lib/callbacks/builtins");
/*** Generated by streamline 0.10.8 (callbacks) - DO NOT EDIT ***/ var __rt=srequire('streamline/lib/callbacks/runtime').runtime(__filename, false),__func=__rt.__func,__cb=__rt.__cb; (function(exports) {








  "use strict";
  var VERSION = 3;



  var future = function(fn, args, i) {
    var err, result, done, q = [], self = this;

    args = Array.prototype.slice.call(args);
    args[i] = function(e, r) {
      err = e, result = r, done = true;
      (q && q.forEach(function(f) {
        f.call(self, e, r); }));

      q = null; };

    fn.apply(this, args);
    return function F(cb) {
      if (!cb) { return F };
      if (done) { cb.call(self, err, result); } else {
        q.push(cb); }; }; };




  exports.funnel = function(max) {
    max = ((max == null) ? -1 : max);
    if ((max === 0)) { max = funnel.defaultSize; };
    if ((typeof max !== "number")) { throw new Error(("bad max number: " + max)) };
    var queue = [], active = 0, closed = false;



    var funCb = function(callback, fn) {
      if ((callback == null)) { return future(funCb, arguments, 0) };

      if (((max < 0) || (max == Infinity))) { return fn(callback) };

      queue.push({
        fn: fn,
        cb: callback });


      function _doOne() {
        var current = queue.splice(0, 1)[0];
        if (!current.cb) { return current.fn() };
        active++;
        current.fn(function(err, result) {
          active--;
          if (!closed) {
            current.cb(err, result);
            while (((active < max) && (queue.length > 0))) { _doOne();; }; } ; }); };




      while (((active < max) && (queue.length > 0))) { _doOne();; }; };

    var fun = __rt.streamlinify(funCb, 0);

    fun.close = function() {
      queue = [], closed = true; };

    return fun; };

  var funnel = exports.funnel;
  funnel.defaultSize = 4;

  function _parallel(options) {
    if ((typeof options === "number")) { return options };
    if ((typeof options.parallel === "number")) { return options.parallel };
    return (options.parallel ? -1 : 1); };


  if ((Array.prototype.forEach_ && (Array.prototype.forEach_.version_ >= VERSION))) { return };


  try {
    Object.defineProperty({ }, "x", { });
  } catch (e) {
    return; };


  var has = Object.prototype.hasOwnProperty;

























  delete Array.prototype.forEach_;
  Object.defineProperty(Array.prototype, "forEach_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__1(_, options, fn, thisObj) { var par, len, i, __this = this; var __frame = { name: "value__1", line: 124 }; return __func(_, this, arguments, value__1, 0, __frame, function __$value__1() {
        if ((typeof options === "function")) { thisObj = fn, fn = options, options = 1; } ;
        par = _parallel(options);
        thisObj = ((thisObj !== undefined) ? thisObj : __this);
        len = __this.length; return (function __$value__1(__then) {
          if (((par === 1) || (len <= 1))) {
            i = 0; var __2 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__1() { __more = false; if (__2) { i++; } else { __2 = true; } ; var __1 = (i < len); if (__1) { return (function __$value__1(__then) {
                    if (has.call(__this, i)) { return fn.call(thisObj, __cb(_, __frame, 7, 31, __then, true), __this[i], i); } else { __then(); } ; })(function __$value__1() { while (__more) { __loop(); }; __more = true; }); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } else {


            return __this.map_(__cb(_, __frame, 10, 9, __then, true), par, fn, thisObj); } ; })(function __$value__1() { return _(null, __this); }); }); } });




  Array.prototype.forEach_.version_ = VERSION;


  delete Array.prototype.map_;
  Object.defineProperty(Array.prototype, "map_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__2(_, options, fn, thisObj) { var par, len, result, i, fun, __this = this; var __frame = { name: "value__2", line: 147 }; return __func(_, this, arguments, value__2, 0, __frame, function __$value__2() {
        if ((typeof options === "function")) { thisObj = fn, fn = options, options = 1; } ;
        par = _parallel(options);
        thisObj = ((thisObj !== undefined) ? thisObj : __this);
        len = __this.length; return (function __$value__2(__then) {

          if (((par === 1) || (len <= 1))) {
            result = new Array(len);
            i = 0; var __4 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__2() { __more = false; if (__4) { i++; } else { __4 = true; } ; var __3 = (i < len); if (__3) { return (function __$value__2(__then) {
                    if (has.call(__this, i)) { return fn.call(thisObj, __cb(_, __frame, 9, 43, function ___(__0, __1) { result[i] = __1; __then(); }, true), __this[i], i); } else { __then(); } ; })(function __$value__2() { while (__more) { __loop(); }; __more = true; }); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } else {


            fun = funnel(par);
            result = __this.map(function(elt, i) {
              return fun(false, function __1(_) { var __frame = { name: "__1", line: 161 }; return __func(_, this, arguments, __1, 0, __frame, function __$__1() {
                  return fn.call(thisObj, __cb(_, __frame, 1, 16, _, true), elt, i); }); }); });


            i = 0; var __7 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__2() { __more = false; if (__7) { i++; } else { __7 = true; } ; var __6 = (i < len); if (__6) { return (function __$value__2(__then) {
                    if (has.call(__this, i)) { return result[i](__cb(_, __frame, 19, 40, function ___(__0, __2) { result[i] = __2; __then(); }, true)); } else { __then(); } ; })(function __$value__2() { while (__more) { __loop(); }; __more = true; }); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } ; })(function __$value__2() {


          return _(null, result); }); }); } });




  delete Array.prototype.filter_;
  Object.defineProperty(Array.prototype, "filter_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__3(_, options, fn, thisObj) { var par, result, len, i, elt, __this = this; var __frame = { name: "value__3", line: 179 }; return __func(_, this, arguments, value__3, 0, __frame, function __$value__3() {
        if ((typeof options === "function")) { thisObj = fn, fn = options, options = 1; } ;
        par = _parallel(options);
        thisObj = ((thisObj !== undefined) ? thisObj : __this);
        result = [];
        len = __this.length; return (function __$value__3(__then) {
          if (((par === 1) || (len <= 1))) {
            i = 0; var __4 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__3() { __more = false; if (__4) { i++; } else { __4 = true; } ; var __3 = (i < len); if (__3) { return (function __$value__3(__then) {
                    if (has.call(__this, i)) {
                      elt = __this[i];
                      return fn.call(thisObj, __cb(_, __frame, 10, 13, function ___(__0, __2) { return (function __$value__3(__then) { if (__2) { result.push(elt); __then(); } else { __then(); } ; })(__then); }, true), elt); } else { __then(); } ; })(function __$value__3() { while (__more) { __loop(); }; __more = true; }); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } else {



            return __this.map_(__cb(_, __frame, 14, 9, __then, true), par, function __1(_, elt) { var __frame = { name: "__1", line: 193 }; return __func(_, this, arguments, __1, 0, __frame, function __$__1() {
                return fn.call(thisObj, __cb(_, __frame, 1, 12, function ___(__0, __1) { return (function __$__1(__then) { if (__1) { result.push(elt); __then(); } else { __then(); } ; })(_); }, true), elt); });
            }, thisObj); } ; })(function __$value__3() {

          return _(null, result); }); }); } });




  delete Array.prototype.every_;
  Object.defineProperty(Array.prototype, "every_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__4(_, options, fn, thisObj) { var par, len, i, fun, futures, __this = this; var __frame = { name: "value__4", line: 207 }; return __func(_, this, arguments, value__4, 0, __frame, function __$value__4() {
        if ((typeof options === "function")) { thisObj = fn, fn = options, options = 1; } ;
        par = _parallel(options);
        thisObj = ((thisObj !== undefined) ? thisObj : __this);
        len = __this.length; return (function __$value__4(__then) {
          if (((par === 1) || (len <= 1))) {
            i = 0; var __6 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__4() { __more = false; if (__6) { i++; } else { __6 = true; } ; var __5 = (i < len); if (__5) { return (function __$value__4(_) {

                    var __1 = has.call(__this, i); if (!__1) { return _(null, __1); } ; return fn.call(thisObj, __cb(_, __frame, 8, 34, function ___(__0, __3) { var __2 = !__3; return _(null, __2); }, true), __this[i]); })(__cb(_, __frame, -206, 17, function ___(__0, __3) { return (function __$value__4(__then) { if (__3) { return _(null, false); } else { __then(); } ; })(function __$value__4() { while (__more) { __loop(); }; __more = true; }); }, true)); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } else {


            fun = funnel(par);
            futures = __this.map(function(elt) {
              return fun(false, function __1(_) { var __frame = { name: "__1", line: 220 }; return __func(_, this, arguments, __1, 0, __frame, function __$__1() {
                  return fn.call(thisObj, __cb(_, __frame, 1, 16, _, true), elt); }); }); });


            i = 0; var __9 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__4() { __more = false; if (__9) { i++; } else { __9 = true; } ; var __8 = (i < len); if (__8) { return (function __$value__4(_) {
                    var __2 = has.call(__this, i); if (!__2) { return _(null, __2); } ; return futures[i](__cb(_, __frame, 18, 31, function ___(__0, __4) { var __3 = !__4; return _(null, __3); }, true)); })(__cb(_, __frame, -206, 17, function ___(__0, __4) { return (function __$value__4(__then) { if (__4) {
                        fun.close();
                        return _(null, false); } else { __then(); } ; })(function __$value__4() { while (__more) { __loop(); }; __more = true; }); }, true)); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } ; })(function __$value__4() {



          return _(null, true); }); }); } });




  delete Array.prototype.some_;
  Object.defineProperty(Array.prototype, "some_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__5(_, options, fn, thisObj) { var par, len, i, fun, futures, __this = this; var __frame = { name: "value__5", line: 241 }; return __func(_, this, arguments, value__5, 0, __frame, function __$value__5() {
        if ((typeof options === "function")) { thisObj = fn, fn = options, options = 1; } ;
        par = _parallel(options);
        thisObj = ((thisObj !== undefined) ? thisObj : __this);
        len = __this.length; return (function __$value__5(__then) {
          if (((par === 1) || (len <= 1))) {
            i = 0; var __6 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__5() { __more = false; if (__6) { i++; } else { __6 = true; } ; var __5 = (i < len); if (__5) { return (function __$value__5(_) {
                    var __1 = has.call(__this, i); if (!__1) { return _(null, __1); } ; return fn.call(thisObj, __cb(_, __frame, 7, 33, _, true), __this[i]); })(__cb(_, __frame, -240, 17, function ___(__0, __3) { return (function __$value__5(__then) { if (__3) { return _(null, true); } else { __then(); } ; })(function __$value__5() { while (__more) { __loop(); }; __more = true; }); }, true)); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } else {


            fun = funnel(par);
            futures = __this.map(function(elt) {
              return fun(false, function __1(_) { var __frame = { name: "__1", line: 253 }; return __func(_, this, arguments, __1, 0, __frame, function __$__1() {
                  return fn.call(thisObj, __cb(_, __frame, 1, 16, _, true), elt); }); }); });


            i = 0; var __9 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__5() { __more = false; if (__9) { i++; } else { __9 = true; } ; var __8 = (i < len); if (__8) { return (function __$value__5(_) {
                    var __2 = has.call(__this, i); if (!__2) { return _(null, __2); } ; return futures[i](__cb(_, __frame, 17, 30, _, true)); })(__cb(_, __frame, -240, 17, function ___(__0, __4) { return (function __$value__5(__then) { if (__4) {
                        fun.close();
                        return _(null, true); } else { __then(); } ; })(function __$value__5() { while (__more) { __loop(); }; __more = true; }); }, true)); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(__then); } ; })(function __$value__5() {



          return _(null, false); }); }); } });




  delete Array.prototype.reduce_;
  Object.defineProperty(Array.prototype, "reduce_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__6(_, fn, v, thisObj) { var len, i, __this = this; var __frame = { name: "value__6", line: 274 }; return __func(_, this, arguments, value__6, 0, __frame, function __$value__6() {
        thisObj = ((thisObj !== undefined) ? thisObj : __this);
        len = __this.length;
        i = 0; var __3 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__6() { __more = false; if (__3) { i++; } else { __3 = true; } ; var __2 = (i < len); if (__2) { return (function __$value__6(__then) {
                if (has.call(__this, i)) { return fn.call(thisObj, __cb(_, __frame, 4, 34, function ___(__0, __1) { v = __1; __then(); }, true), v, __this[i], i, __this); } else { __then(); } ; })(function __$value__6() { while (__more) { __loop(); }; __more = true; }); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(function __$value__6() {

          return _(null, v); }); }); } });




  delete Array.prototype.reduceRight_;
  Object.defineProperty(Array.prototype, "reduceRight_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__7(_, fn, v, thisObj) { var len, i, __this = this; var __frame = { name: "value__7", line: 290 }; return __func(_, this, arguments, value__7, 0, __frame, function __$value__7() {
        thisObj = ((thisObj !== undefined) ? thisObj : __this);
        len = __this.length;
        i = (len - 1); var __3 = false; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$value__7() { __more = false; if (__3) { i--; } else { __3 = true; } ; var __2 = (i >= 0); if (__2) { return (function __$value__7(__then) {
                if (has.call(__this, i)) { return fn.call(thisObj, __cb(_, __frame, 4, 34, function ___(__0, __1) { v = __1; __then(); }, true), v, __this[i], i, __this); } else { __then(); } ; })(function __$value__7() { while (__more) { __loop(); }; __more = true; }); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(function __$value__7() {

          return _(null, v); }); }); } });






  delete Array.prototype.sort_;
  Object.defineProperty(Array.prototype, "sort_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function value__8(_, compare, beg, end) { var array, __this = this;




      function _qsort(_, beg, end) { var tmp, mid, o, nbeg, nend; var __frame = { name: "_qsort", line: 313 }; return __func(_, this, arguments, _qsort, 0, __frame, function __$_qsort() {
          if ((beg >= end)) { return _(null); } ; return (function __$_qsort(__then) {

            if ((end == (beg + 1))) {
              return compare(__cb(_, __frame, 4, 9, function ___(__0, __4) { var __3 = (__4 > 0); return (function __$_qsort(__then) { if (__3) {
                    tmp = array[beg];
                    array[beg] = array[end];
                    array[end] = tmp; __then(); } else { __then(); } ; })(function __$_qsort() { return _(null); }); }, true), array[beg], array[end]); } else { __then(); } ; })(function __$_qsort() {




            mid = Math.floor((((beg + end)) / 2));
            o = array[mid];
            nbeg = beg;
            nend = end; return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$_qsort() { __more = false;

                var __6 = (nbeg <= nend); if (__6) { return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$_qsort() { __more = false; return (function __$_qsort(_) { return (function __$_qsort(_) {
                          var __1 = (nbeg < end); if (!__1) { return _(null, __1); } ; return compare(__cb(_, __frame, 18, 26, function ___(__0, __3) { var __2 = (__3 < 0); return _(null, __2); }, true), array[nbeg], o); })(__cb(_, __frame, -312, 17, _, true)); })(__cb(_, __frame, -312, 17, function ___(__0, __7) { if (__7) { nbeg++; while (__more) { __loop(); }; __more = true; } else { __break(); } ; }, true)); }); do { __loop(); } while (__more); __more = true; })(function __$_qsort() { return (function ___(__break) { var __more; var __loop = __cb(_, __frame, 0, 0, function __$_qsort() { __more = false; return (function __$_qsort(_) { return (function __$_qsort(_) {
                            var __2 = (beg < nend); if (!__2) { return _(null, __2); } ; return compare(__cb(_, __frame, 19, 26, function ___(__0, __4) { var __3 = (__4 < 0); return _(null, __3); }, true), o, array[nend]); })(__cb(_, __frame, -312, 17, _, true)); })(__cb(_, __frame, -312, 17, function ___(__0, __9) { if (__9) { nend--; while (__more) { __loop(); }; __more = true; } else { __break(); } ; }, true)); }); do { __loop(); } while (__more); __more = true; })(function __$_qsort() {

                      if ((nbeg <= nend)) {
                        tmp = array[nbeg];
                        array[nbeg] = array[nend];
                        array[nend] = tmp;
                        nbeg++;
                        nend--; } ; while (__more) { __loop(); }; __more = true; }); }); } else { __break(); } ; }); do { __loop(); } while (__more); __more = true; })(function __$_qsort() { return (function __$_qsort(__then) {



                if ((nbeg < end)) { return _qsort(__cb(_, __frame, 30, 20, __then, true), nbeg, end); } else { __then(); } ; })(function __$_qsort() { return (function __$_qsort(__then) {
                  if ((beg < nend)) { return _qsort(__cb(_, __frame, 31, 20, __then, true), beg, nend); } else { __then(); } ; })(_); }); }); }); }); }; var __frame = { name: "value__8", line: 308 }; return __func(_, this, arguments, value__8, 0, __frame, function __$value__8() { array = __this; beg = (beg || 0); end = ((end == null) ? (array.length - 1) : end);

        return _qsort(__cb(_, __frame, 38, 3, function __$value__8() {
          return _(null, array); }, true), beg, end); }); } });


  delete Function.prototype.apply_;
  Object.defineProperty(Function.prototype, "apply_", {
    configurable: true,
    writable: true,
    enumerable: false,
    value: function(callback, thisObj, args, index) {
      args = Array.prototype.slice.call(args, 0);
      args.splice((((index != null) && (index >= 0)) ? index : args.length), 0, callback);
      return this.apply(thisObj, args); } });


})(((typeof exports !== "undefined") ? exports : (Streamline.builtins = (Streamline.builtins || {}))));
/*This is a combined, compressed file.  Look at https://github.com/BruceSherwood/glowscript for source code and copyright information.*/
;(function(){})();