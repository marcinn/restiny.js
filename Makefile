.DEFAULT: compile
.PHONY: compile


compile:
	uglifyjs restiny.js --screw-ie8 -c -m > restiny.min.js
