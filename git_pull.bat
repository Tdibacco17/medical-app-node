@echo off
echo Pulling changes from master...
git checkout master
git pull origin master
echo Pulling changes from develop...
git checkout develop
git pull origin develop
echo Pulling all tags...
git fetch --tags
echo Pulls completed.
pause