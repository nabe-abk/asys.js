#
# Makefile
#
NAME       = asys
OUT_DIR    = ..

COMPRESSOR = terser
OPTIONS    = -c -m --source-map "includeSources,url='$(NAME).min.js.map'"

OUTPUT	   = $(OUT_DIR)/$(NAME).min.js
HTML       = $(OUT_DIR)/$(NAME)-js-load.html

# Add "export" to file head
EXPORT_FILES = 20_PrefixStorage.js 30_init.js

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
	90_run_init.js

all:  $(OUTPUT) $(OUTPUT2) $(HTML)
html: $(HTML)

$(OUTPUT): 00_start.js $(FILES) 99_export_default.js Makefile

	@for file in $(EXPORT_FILES); do	\
		if [ ! -e $$file.bak ]; then	\
			mv $$file $$file.bak;	\
		fi;				\
		echo -n "export " >$$file;	\
		cat $$file.bak   >>$$file;	\
	done

	$(COMPRESSOR) 00_start.js $(FILES) 99_export_default.js $(OPTIONS) -o $(OUTPUT)

	@for file in $(EXPORT_FILES); do	\
		mv $$file.bak $$file;		\
	done

$(HTML): Makefile
	echo '<$$local(dir) = argv#0>'	>$(HTML);
	for file in $(FILES); do \
		echo "<script defer src=\"<@Basepath><@dir>$$file?<@get_lastmodified(dir . '$$file')>\"></script>" >>$(HTML); \
	done
