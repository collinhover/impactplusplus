@echo off

call echo Initializing documentation...

call SET TEMPLATE=impactplusplus

call SET OUTPUT=..\impactplusplus\docs
call SET INPUT=..\impactplusplus\lib\plusplus

call SET README=..\impactplusplus\README.md

call SET OUTPUT_DEMO=..\impactplusplus\docs\demo
call SET INPUT_DEMO=..\impactplusplus\examples\demo

call cd ..\..\jsdoc3

call echo Erasing old documentation

IF EXIST "%OUTPUT%" ( 
    call del /F/S/Q "%OUTPUT%"
) ELSE ( 
    call echo "Making %OUTPUT% directory"
    call md "%OUTPUT%"

)

call echo Creating new documentation

call jsdoc -t templates\%TEMPLATE% -d %OUTPUT% -r %INPUT% %README%

IF EXIST "%INPUT_DEMO%" (
	
	call echo Copying demo
	
	IF EXIST "%OUTPUT_DEMO%" ( 
		call del /F/S/Q "%OUTPUT_DEMO%"
	) ELSE ( 
		call echo "Making %OUTPUT_DEMO% directory"
		call md "%OUTPUT_DEMO%"

	)

	xcopy "%INPUT_DEMO%\*.*" "%OUTPUT_DEMO%" /S /I

)
	
call echo Documentation complete!

call pause