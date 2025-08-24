/**
 * 🧪 SIMPLE QUERY HANDLER TEST
 * 
 * Test file to verify the simple query handler works correctly.
 * Run with: bun run src/lib/simple-query-test.ts
 */

import { handleSimpleQuery, SimpleQueryHandler } from './simple-query-handler';

console.log('🧪 Testing Simple Query Handler...\n');

// Test basic greetings
console.log('📝 Testing Basic Greetings:');
console.log('"hi" ->', handleSimpleQuery('hi'));
console.log('"hello" ->', handleSimpleQuery('hello'));
console.log('"hey" ->', handleSimpleQuery('hey'));
console.log('"yo" ->', handleSimpleQuery('yo'));
console.log('"sup" ->', handleSimpleQuery('sup'));
console.log('"hii" ->', handleSimpleQuery('hii'));
console.log('"helloo" ->', handleSimpleQuery('helloo'));
console.log('"heyy" ->', handleSimpleQuery('heyy'));
console.log();

// Test time-based greetings
console.log('📝 Testing Time-based Greetings:');
console.log('"good morning" ->', handleSimpleQuery('good morning'));
console.log('"good afternoon" ->', handleSimpleQuery('good afternoon'));
console.log('"good evening" ->', handleSimpleQuery('good evening'));
console.log('"good night" ->', handleSimpleQuery('good night'));
console.log('"morning" ->', handleSimpleQuery('morning'));
console.log('"afternoon" ->', handleSimpleQuery('afternoon'));
console.log('"evening" ->', handleSimpleQuery('evening'));
console.log('"night" ->', handleSimpleQuery('night'));
console.log();

// Test gratitude
console.log('📝 Testing Gratitude:');
console.log('"thanks" ->', handleSimpleQuery('thanks'));
console.log('"thank you" ->', handleSimpleQuery('thank you'));
console.log('"thx" ->', handleSimpleQuery('thx'));
console.log('"ty" ->', handleSimpleQuery('ty'));
console.log('"thank" ->', handleSimpleQuery('thank'));
console.log('"tnx" ->', handleSimpleQuery('tnx'));
console.log();

// Test well-being
console.log('📝 Testing Well-being:');
console.log('"how are you" ->', handleSimpleQuery('how are you'));
console.log('"what\'s up" ->', handleSimpleQuery('what\'s up'));
console.log('"how\'s it going" ->', handleSimpleQuery('how\'s it going'));
console.log('"how are you doing" ->', handleSimpleQuery('how are you doing'));
console.log('"how do you do" ->', handleSimpleQuery('how do you do'));
console.log('"what is up" ->', handleSimpleQuery('what is up'));
console.log('"whats up" ->', handleSimpleQuery('whats up'));
console.log();

// Test status questions
console.log('📝 Testing Status Questions:');
console.log('"who are you" ->', handleSimpleQuery('who are you'));
console.log('"what is your name" ->', handleSimpleQuery('what is your name'));
console.log('"what can you do" ->', handleSimpleQuery('what can you do'));
console.log('"are you busy" ->', handleSimpleQuery('are you busy'));
console.log();

// Test partial matches
console.log('📝 Testing Partial Matches:');
console.log('"hello there" ->', handleSimpleQuery('hello there'));
console.log('"hi there" ->', handleSimpleQuery('hi there'));
console.log('"good morning everyone" ->', handleSimpleQuery('good morning everyone'));
console.log();

// Test edge cases
console.log('📝 Testing Edge Cases:');
console.log('"" ->', handleSimpleQuery(''));
console.log('"   " ->', handleSimpleQuery('   '));
console.log('"random text" ->', handleSimpleQuery('random text'));
console.log('"complex analysis question" ->', handleSimpleQuery('complex analysis question'));
console.log();

// Test statistics
console.log('📊 Handler Statistics:');
const stats = SimpleQueryHandler.getStats();
console.log('Total responses:', stats.total);
console.log('Categories:', stats.categories);
console.log();

// Test category filtering
console.log('📝 Testing Category Filtering:');
const greetingResponses = SimpleQueryHandler.getResponsesByCategory('greeting');
console.log('Greeting responses:', greetingResponses.length);
console.log('Sample greeting:', greetingResponses[0]?.response);

console.log('\n✅ Simple Query Handler Test Complete!');
