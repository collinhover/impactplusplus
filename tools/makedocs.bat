@echo off

call echo 1. Initializing documentation...

call SET TEMPLATE=impactplusplus

call SET OUTPUT=..\impactplusplus\docs

call SET INPUT=..\impactplusplus\lib\plusplus

call SET README=..\impactplusplus\README.md

call cd ..\..\jsdoc3

call echo 2. Erasing old documentation

IF EXIST "%OUTPUT%" ( 
    call del /F/S/Q "%OUTPUT%"
) ELSE ( 
    call echo "Making %OUTPUT% directory"
    call md "%OUTPUT%"

)

call echo 3. Creating new documentation

call jsdoc -t templates\%TEMPLATE% -d %OUTPUT% -r %INPUT% %README%

call echo 4. Documentation complete!

call pause