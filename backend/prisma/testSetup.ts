import { PrismaTestEnvironment } from 'prisma-test-environment';

const testEnv = new PrismaTestEnvironment({
  databaseUrl: process.env.TEST_DATABASE_URL,
  prismaPath: require.resolve('prisma')
});

module.exports = async () => {
  await testEnv.setup();
  process.env.DATABASE_URL = testEnv.databaseUrl;
};
