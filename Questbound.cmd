@echo off
rem The launcher's old name (Questbound, until 2026-10-27): runs Turquill.cmd with the same arguments, so old
rem shortcuts and habits (Questbound.cmd -Stop and the rest) keep working.
call "%~dp0Turquill.cmd" %*
