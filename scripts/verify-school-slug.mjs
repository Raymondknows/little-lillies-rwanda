import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.SESSION_SECRET ?? 'schoolbase-dev-secret-change-me';
const encoder = new TextEncoder();

async function run() {
  console.log('Secret used:', secret === 'schoolbase-dev-secret-change-me' ? '(default dev secret)' : '(env secret)');

  // Create a signed token (as middleware would)
  const token = await new SignJWT({ slug: 'example-school' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(encoder.encode(secret));

  console.log('\nSigned token created. Length:', token.length);

  // Verify the token (as server would)
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    console.log('\nVerified payload:', payload);
  } catch (err) {
    console.error('\nVerification failed:', err.message || err);
  }

  // Attempt verification with wrong secret to simulate tampering
  try {
    await jwtVerify(token, encoder.encode('wrong-secret'));
    console.error('\nUnexpected: token verified with wrong secret');
  } catch (err) {
    console.log('\nAs expected, verification with wrong secret failed:', err.message || err);
  }

  // Legacy plain slug check
  const legacy = 'example-school';
  const ok = /^[a-z0-9-]+$/.test(legacy);
  console.log('\nLegacy slug valid format:', ok, '-', legacy);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
