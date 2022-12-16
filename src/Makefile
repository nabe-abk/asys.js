#
# Makefile
#
NAME       = asys
OUT_DIR    = ..
OUT_DIR2   = ../without-jQuery
JQUERY     = jquery-3.6.2.js

COMPRESSOR = terser
OPTIONS    = -c -m --comments '/^!!/' --source-map "includeSources,url='$(NAME).min.js.map'"

OUTPUT	   = $(OUT_DIR)/$(NAME).min.js
MAP_FILE   = $(OUT_DIR)/$(NAME).min.map
HTML       = $(OUT_DIR)/$(NAME)-js-load.html

OUTPUT2	   = $(OUT_DIR2)/$(NAME).min.js
MAP_FILE2  = $(OUT_DIR2)/$(NAME).min.map

FILES =	10_global-ext.js	\
	11_jquery-ext.js	\
	20_PrefixStorage.js	\
	21_adiary-ui.js		\
	30_init.js		\
	40_dialog.js		\
	41_ajax.js		\
	42_popup.js		\
	50_dom.js		\
	60_dom-special.js	\
	70_subroutines.js	\
	80_defer.js		\
	99_run_init.js

all:  $(OUTPUT) $(OUTPUT2) $(HTML)
html: $(HTML)

$(OUTPUT):  00_start.js $(JQUERY) $(FILES) Makefile
	$(COMPRESSOR) 00_start.js $(JQUERY) $(FILES) $(OPTIONS) -o $(OUTPUT)

$(OUTPUT2): 00_start_without_jq.js $(FILES) Makefile
	$(COMPRESSOR) 00_start_without_jq.js $(FILES) $(OPTIONS) -o $(OUTPUT2)

$(HTML): Makefile
	echo '<@7>'			>$(HTML);
	echo '<$$local(dir) = argv#0>'	>>$(HTML);
	for file in $(JQUERY) $(FILES); do \
		echo "<script defer src=\"<@Basepath><@dir>$$file?<@get_lastmodified(dir . '$$file')>\"></script>" >>$(HTML); \
	done
