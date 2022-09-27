cd .. && yarn build && cd example && yarn remove solib && yarn cache clean && rm -rf node_modules && yarn && yarn add ../ && yarn dev
