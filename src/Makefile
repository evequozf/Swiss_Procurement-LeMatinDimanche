# 
# ---------------------------------------
# Paths
BASEDIR   = ..

DIST      = $(BASEDIR)/bin
IMPORT    = import
SRC       = .
LIB       = .

# ---------------------------------------

# temp dir and files created for minified js files
MINIFY = ./tmp
HEAD   = head.j
TRAIL  = trail.j

# wildcard for all JS files
JS_SRC            = $(wildcard *.js)
JS_SRC_BROWSERIFY = $(wildcard ./js/*.js)
JS_DIST           = $(JS_SRC:%=$(DIST)/%)

#############################
# Recipes
#############################

test:
#	@echo $(JS_DIST)
	cp js/viz.js $(DIST)/

#browserify: $(DIST)/$(IMPORT) $(DIST)/index.html $(DIST)/custom.css
#	@browserify js/main.js -o viz.js -d
#	@rsync -upE *.js $(DIST)/


# Phony targets - these are for when the target-side of a definition
# (such as "all" below) isn't a file but instead a just label. Declaring
# it as phony ensures that it always run, even if a file by the same name
# exists.
.PHONY: debug all clean commons watch setup

# Compile the debug target and copy to DIST -> don't minify js 
# WARNING : if 'make all' was called & nothing changed to *.js file & and 'make debug' called, 
#   then minified *.js files on DIST are not updated (because they are newer)
#   therefore: call 'make clean debug' ('make clean all' if 'make debug' was called)
# Copies index.html + custom.css + import folder + all js files unchanged (not minified)
debug: $(DIST)/$(IMPORT) $(DIST)/index.html $(DIST)/custom.css viz.js
	@rsync -upE *.js $(DIST)/

# Compile the final targets and copy to DIST (minified js)
all: $(DIST)/$(IMPORT) $(DIST)/index.html $(DIST)/custom.css $(DIST)/viz.js $(JS_DIST) 

# Setup locations
setup: 
	@mkdir -p $(DIST)

# Destroy dist
clean:
	@rm -rf $(DIST)    #deletes distribution -> dangerous

# # Watch the filesystem and recompile
watch:
	@watch $(MAKE) debug


# #################

# make viz.js as a browserified js of js/main.js
viz.js: $(JS_SRC_BROWSERIFY)
	@browserify js/main.js -o $@ -d

# Copy all files from $(IMPORT) to $(DIST)/import if newer
$(DIST)/$(IMPORT): $(IMPORT) setup
	@rsync -rupE --delete $< $(DIST)

# Make custom.css from custom.scss
$(DIST)/custom.css: custom.scss setup
	@rm -f $@
	@scss --sourcemap=none $< $@ 

# Copies index.html
$(DIST)/index.html: index.html setup
	@rm -f $@
	@cp $< $@

# Minifies *.js in src 
$(DIST)/%.js: $(MINIFY)/%.js 
	@rm -f $@
	@cp $< $@
	@rm -rf $(MINIFY)  #deletes temp dir

# Make minified files -> called by dependency $(DIST)/$(JS) in make all
# minify .jaug into .js
$(MINIFY)/%.js: $(MINIFY)/%.jaug
	@java -jar $(LIB)/yuicompressor-2.4.8.jar $< -o $@ --charset utf-8  --type js

# Make .jaug by wrapping (function(){ ... })() around all .js files	
$(MINIFY)/%.jaug: %.js setup
	@mkdir -p $(MINIFY)
	@echo "(function(){" > $(MINIFY)/$(HEAD)
	@echo "})()" > $(MINIFY)/$(TRAIL)
	@cat $(MINIFY)/$(HEAD) $< $(MINIFY)/$(TRAIL) > $@

#############################
