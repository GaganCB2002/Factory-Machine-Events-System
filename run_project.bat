@echo off
echo ==========================================
echo   Factory Machine Events Backend System
echo ==========================================
echo.
echo Attempting to run project using Maven...
echo.

call mvn spring-boot:run

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not run with Maven.
    echo.
    echo Possible reasons:
    echo 1. Maven is not installed or not in your PATH.
    echo 2. The project has not been imported into an IDE.
    echo.
    echo === ALTERNATIVE: RUN FROM IDE ===
    echo Please open this folder in IntelliJ IDEA or Eclipse.
    echo Right-click 'src/main/java/com/factory/events/FactoryEventsApplication.java' and select Run.
    echo.
    pause
)
