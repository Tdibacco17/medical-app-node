@echo off
echo Pushing changes to master...
git checkout master
git push origin master
echo Pushing changes to develop...
git checkout develop
git push origin develop
echo Pushing all tags...
git push --tags
echo Pushes completed.
pause