#!/bin/bash

pnpm install

npm run build

PACKAGE=$(python3 -c "import site; print(site.getsitepackages()[0])")
CHAINLIT_HOME=$PACKAGE/chainlit

cd ./backend && pip install .

sudo mkdir -p "$CHAINLIT_HOME"/frontend/dist
sudo ln -sf "$PWD"/frontend/dist/* "$CHAINLIT_HOME"/frontend/dist

sudo mkdir -p "$CHAINLIT_HOME"/copilot/dist
sudo ln -sf "$PWD"/libs/copilot/dist/* "$CHAINLIT_HOME"/copilot/dist
