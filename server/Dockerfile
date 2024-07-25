# 使用官方的 Node.js 镜像作为构建阶段基础镜像
FROM node:20 AS build

RUN npm config set -g registry https://registry.npmmirror.com

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# 如果你的项目需要构建步骤
# RUN npm run build

# 使用更轻量的基础镜像来运行应用
FROM node:20-slim

WORKDIR /usr/src/app

COPY --from=build /usr/src/app .

EXPOSE 3300

CMD ["node", "index.mjs"]



