@echo off

call SET ROOT=..\

call cd %ROOT%

call echo Initializing documentation...

call SET TEMPLATE=impactplusplus

call SET OUTPUT=docs
call SET INPUT=lib\plusplus
call SET INPUT_TO_ROOT=..\..\
call SET TUTORIALS=tutorials

call SET DEMO=docs\demo
call SET DEMO_TEMP=tempdemo
call SET DEMO_NEEDS_COPY_BACK=0

IF EXIST "%DEMO%" (
	
	call echo Storing demo before documentation reset
	
	IF EXIST "%DEMO_TEMP%" ( 
		call del /F/S/Q "%DEMO_TEMP%"
	) ELSE ( 
		call echo "Making %DEMO_TEMP% directory"
		call md "%DEMO_TEMP%"

	)

	xcopy "%DEMO%\*.*" "%DEMO_TEMP%" /S /I
	call SET DEMO_NEEDS_COPY_BACK=1

)

call echo Erasing old documentation

IF EXIST "%OUTPUT%" ( 
    call del /F/S/Q "%OUTPUT%"
) ELSE ( 
    call echo "Making %OUTPUT% directory"
    call md "%OUTPUT%"

)

call echo Beautifying

call cd %INPUT%

for /r %%f in (*) do (
	call js-beautify %%f -r
)

call cd  %INPUT_TO_ROOT%

call echo Creating new documentation

call jsdoc -t templates\%TEMPLATE% -d %OUTPUT% -r %INPUT% -u %TUTORIALS%

IF "%DEMO_NEEDS_COPY_BACK%"=="1" (
	
	call echo Copying demo back into documentation
	
	IF EXIST "%DEMO%" ( 
		call del /F/S/Q "%DEMO%"
	) ELSE ( 
		call echo "Making %DEMO% directory"
		call md "%DEMO%"

	)

	xcopy "%DEMO_TEMP%\*.*" "%DEMO%" /S /I
	call rmdir /S/Q "%DEMO_TEMP%"

)
	
call echo Documentation complete!

call pause