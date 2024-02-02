#!/bin/bash
PACKAGES=$(python3 -c "import site; print(site.getsitepackages()[0])")
ln -sf "${PWD}"/chainlit "${PACKAGES}"/chainlit