## NestJS notification service with Kafka and Prisma


#### Prisma setup:
```
npm i prisma -D
npm i @prisma/client
npx prisma init
npx prisma migrate dev
npx prisma migrate dev --name init
npx prisma introspect
npx prisma studio
npx prisma generate
```

#### create Kafka topic:
```
notifications.send-notification
```