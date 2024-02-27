#!/bin/bash

commit_msg=$1

git add .
if [ -z $commit_msg ]; then
  git commit -m "update"
else
  git commit -m "${commit_msg}"
fi

git push


#commit_msg=$1
#
#if [ -z $commit_msg ]; then
#  echo "빈 문자열"
#else
#  echo "commit msg"
#  echo "${commit_msg}"
#fi
#
