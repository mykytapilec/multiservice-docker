FROM multiservice-api-base:latest AS builder

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM multiservice-api-base:latest AS production

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
