import test from 'node:test';
import assert from 'node:assert/strict';
import {classify,deadline,hoursForPriority,safe,PRIORITIES,ROLES,STATUSES} from '../src/core.js';
test('urgent deadlines are shorter than low priority',()=>{
  assert.equal(hoursForPriority('urgent'),4);
  assert.ok(new Date(deadline('urgent')).getTime()<new Date(deadline('low')).getTime());
});
test('keyword triage is free, rule based and deterministic',()=>{
  assert.equal(classify('Payroll question').workspace,'Finance');
  assert.equal(classify('production down!').priority,'urgent');
  assert.equal(classify('Contract review').workspace,'Legal');
});
test('string trimming and max length',()=>assert.equal(safe(' abcdef ',3),'abc'));
test('roles and states are explicitly enumerated',()=>{
  assert.ok(ROLES.includes('requester'));
  assert.ok(PRIORITIES.includes('high'));
  assert.ok(STATUSES.includes('pending_approval'));
});
