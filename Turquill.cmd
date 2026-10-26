@echo off
rem Turquill.cmd is the same launcher as Questbound.cmd under the game's new name (2026-10-25): it runs
rem Questbound.cmd with the same arguments (for example Turquill.cmd -Stop). The files, services and saves keep
rem their Questbound names on purpose, so nothing running or saved changes.
call "%~dp0Questbound.cmd" %*
