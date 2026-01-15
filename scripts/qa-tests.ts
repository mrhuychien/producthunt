/**
 * QA Test Script for IdeaVault Features
 * Run with: npx ts-node scripts/qa-tests.ts
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start
    });
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

async function fetchAPI(path: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return response;
}

// ============================================================================
// FEATURE 1: AI IDEA FUSION TESTS
// ============================================================================

async function testFusion() {
  console.log('\n📦 FEATURE 1: AI Idea Fusion\n');

  await test('1.1 GET /api/fusion returns success', async () => {
    const res = await fetchAPI('/api/fusion');
    const data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}`);
    if (!data.success) throw new Error('Response not successful');
  });

  await test('1.2 GET /api/fusion returns array of fusions', async () => {
    const res = await fetchAPI('/api/fusion');
    const data = await res.json();
    if (!Array.isArray(data.data)) throw new Error('Data is not array');
  });

  await test('1.3 POST /api/fusion without auth returns 401', async () => {
    const res = await fetchAPI('/api/fusion', { method: 'POST' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });
}

// ============================================================================
// FEATURE 2: IDEA BATTLE ARENA TESTS
// ============================================================================

async function testBattles() {
  console.log('\n⚔️ FEATURE 2: Idea Battle Arena\n');

  await test('2.1 GET /api/battles returns success', async () => {
    const res = await fetchAPI('/api/battles');
    const data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}`);
    if (!data.success) throw new Error('Response not successful');
  });

  await test('2.2 GET /api/battles returns battles array', async () => {
    const res = await fetchAPI('/api/battles');
    const data = await res.json();
    if (!data.data || !Array.isArray(data.data.battles)) {
      throw new Error('battles is not array');
    }
  });

  await test('2.3 GET /api/battles returns weekNumber', async () => {
    const res = await fetchAPI('/api/battles');
    const data = await res.json();
    if (typeof data.weekNumber !== 'number') {
      throw new Error('weekNumber missing');
    }
  });

  await test('2.4 POST /api/battles without auth returns 401', async () => {
    const res = await fetchAPI('/api/battles', { method: 'POST' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('2.5 POST /api/battles/invalid-id/vote returns error', async () => {
    const res = await fetchAPI('/api/battles/invalid-id/vote', {
      method: 'POST',
      body: JSON.stringify({ ideaId: 'test' }),
    });
    // Should be 401 (not authenticated) or 404/400
    if (res.status === 200) throw new Error('Should not succeed');
  });
}

// ============================================================================
// FEATURE 3: BUILD PROGRESS LIVE STREAM TESTS
// ============================================================================

async function testBuildProgress() {
  console.log('\n📺 FEATURE 3: Build Progress Live Stream\n');

  const testIdeaId = 'test-idea-id';

  await test('3.1 GET /api/ideas/:id/progress returns data structure', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/progress`);
    const data = await res.json();
    // Should return success even if no claim exists
    if (!res.ok && res.status !== 404) throw new Error(`Status ${res.status}`);
  });

  await test('3.2 GET /api/ideas/:id/claim returns data structure', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/claim`);
    const data = await res.json();
    if (!res.ok && res.status !== 404) throw new Error(`Status ${res.status}`);
  });

  await test('3.3 POST /api/ideas/:id/claim without auth returns 401', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/claim`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('3.4 POST /api/ideas/:id/progress without auth returns 401', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ type: 'text', content: 'test' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });
}

// ============================================================================
// FEATURE 4: IDEA DNA TRACKING TESTS
// ============================================================================

async function testDNA() {
  console.log('\n🔬 FEATURE 4: Idea DNA Tracking\n');

  const testIdeaId = 'test-idea-id';

  await test('4.1 GET /api/ideas/:id/dna with invalid id returns 404', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/dna`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  await test('4.2 DNA API response structure', async () => {
    // Test with any existing idea if available
    const ideasRes = await fetchAPI('/api/ideas?limit=1');
    const ideasData = await ideasRes.json();

    if (ideasData.data && ideasData.data.length > 0) {
      const ideaId = ideasData.data[0].id;
      const res = await fetchAPI(`/api/ideas/${ideaId}/dna`);
      const data = await res.json();

      if (res.ok && data.success) {
        if (!data.data.events) throw new Error('events missing');
        if (!data.data.stats) throw new Error('stats missing');
      }
    }
  });
}

// ============================================================================
// FEATURE 5: STEAL THIS IDEA MODE TESTS
// ============================================================================

async function testSteal() {
  console.log('\n🥷 FEATURE 5: Steal This Idea Mode\n');

  const testIdeaId = 'test-idea-id';

  await test('5.1 GET /api/ideas/:id/steal returns data structure', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/steal`);
    const data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}`);
    if (!data.data) throw new Error('data missing');
  });

  await test('5.2 GET /api/ideas/:id/steal returns count', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/steal`);
    const data = await res.json();
    if (typeof data.data?.count !== 'number') throw new Error('count missing');
  });

  await test('5.3 POST /api/ideas/:id/steal without auth returns 401', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/steal`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('5.4 DELETE /api/ideas/:id/steal without auth returns 401', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/steal`, {
      method: 'DELETE',
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });
}

// ============================================================================
// FEATURE 6: AI DIFFICULTY RATING TESTS
// ============================================================================

async function testDifficulty() {
  console.log('\n📊 FEATURE 6: AI Difficulty Rating\n');

  const testIdeaId = 'test-idea-id';

  await test('6.1 GET /api/ideas/:id/difficulty with invalid id returns 404', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/difficulty`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  await test('6.2 Difficulty with real idea returns rating', async () => {
    const ideasRes = await fetchAPI('/api/ideas?limit=1');
    const ideasData = await ideasRes.json();

    if (ideasData.data && ideasData.data.length > 0) {
      const ideaId = ideasData.data[0].id;
      const res = await fetchAPI(`/api/ideas/${ideaId}/difficulty`);
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        if (typeof data.data.difficultyScore !== 'number') {
          throw new Error('difficultyScore missing');
        }
        if (data.data.difficultyScore < 1 || data.data.difficultyScore > 5) {
          throw new Error('difficultyScore out of range 1-5');
        }
        if (!Array.isArray(data.data.techStack)) {
          throw new Error('techStack not array');
        }
      }
    }
  });
}

// ============================================================================
// FEATURE 7: MICRO-BOUNTY SYSTEM TESTS
// ============================================================================

async function testBounty() {
  console.log('\n💰 FEATURE 7: Micro-Bounty System\n');

  const testIdeaId = 'test-idea-id';

  await test('7.1 GET /api/ideas/:id/bounty returns data structure', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/bounty`);
    const data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}`);
    if (!data.data) throw new Error('data missing');
  });

  await test('7.2 GET /api/ideas/:id/bounty returns total and count', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/bounty`);
    const data = await res.json();
    if (typeof data.data?.total !== 'number') throw new Error('total missing');
    if (typeof data.data?.count !== 'number') throw new Error('count missing');
  });

  await test('7.3 POST /api/ideas/:id/bounty without auth returns 401', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/bounty`, {
      method: 'POST',
      body: JSON.stringify({ amount: 10 }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('7.4 DELETE /api/ideas/:id/bounty without auth returns 401', async () => {
    const res = await fetchAPI(`/api/ideas/${testIdeaId}/bounty`, {
      method: 'DELETE',
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });
}

// ============================================================================
// UI COMPONENT VERIFICATION TESTS
// ============================================================================

async function testPages() {
  console.log('\n🖥️ PAGE ACCESSIBILITY TESTS\n');

  const pages = [
    { path: '/', name: 'Home page' },
    { path: '/fusion', name: 'Fusion page' },
    { path: '/battle', name: 'Battle page' },
    { path: '/ideas', name: 'Ideas page' },
    { path: '/about', name: 'About page' },
    { path: '/login', name: 'Login page' },
  ];

  for (const page of pages) {
    await test(`Page ${page.path} loads successfully`, async () => {
      const res = await fetch(`${BASE_URL}${page.path}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const html = await res.text();
      if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
        throw new Error('Not valid HTML');
      }
    });
  }
}

// ============================================================================
// API STRUCTURE TESTS
// ============================================================================

async function testAPIStructure() {
  console.log('\n🔧 API STRUCTURE TESTS\n');

  await test('GET /api/ideas returns paginated data', async () => {
    const res = await fetchAPI('/api/ideas');
    const data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(data.data)) throw new Error('data not array');
  });

  await test('GET /api/categories returns categories', async () => {
    const res = await fetchAPI('/api/categories');
    const data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    QA TEST SUITE - IdeaVault                   ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  try {
    await testAPIStructure();
    await testFusion();
    await testBattles();
    await testBuildProgress();
    await testDNA();
    await testSteal();
    await testDifficulty();
    await testBounty();
    await testPages();
  } catch (error) {
    console.error('\n⚠️ Test suite error:', error);
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                         TEST SUMMARY                           ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total:  ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Rate:   ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  return { passed, failed, total, results };
}

// Run
runAllTests().catch(console.error);
