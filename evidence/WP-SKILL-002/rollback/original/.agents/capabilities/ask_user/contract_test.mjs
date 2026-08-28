import assert from 'assert';

// --- Canonical Domain ---

// Orchestration policy applied to the adapter results
function executeCapability(request, adapter, env) {
    const result = adapter(request);
    
    if (result.state === 'ANSWERED') {
        return { status: 'CONTINUE', answer: result.answer };
    } 
    
    if (result.state === 'UNAVAILABLE') {
        env.recordEvidence({ type: 'CAPABILITY_FAILURE', reason: 'UNAVAILABLE' });
        env.emitVisibleChannel(`[FALLBACK QUESTION]: ${request.question}`);
        return { status: 'BLOCKED', substate: 'WAITING_USER' };
    }
    
    if (result.state === 'FAILED') {
        env.recordEvidence({ type: 'INVOCATION_FAILURE', cause: result.cause });
        return { status: 'FAILED', cause: result.cause };
    }
}

// --- Harness Adapter (Mock) ---
function createMockAdapter(nativeToolMock) {
    return function askUserAdapter(canonicalRequest) {
        // Validation: No silent truncation
        if (canonicalRequest.options && canonicalRequest.options.length > (nativeToolMock.maxOptions || Infinity)) {
            return { state: 'FAILED', cause: 'Constraint exceeded' };
        }
        
        // Validation: Must not silently drop custom input requirement
        if (canonicalRequest.allowCustom && nativeToolMock.supportsCustom === false) {
            return { state: 'FAILED', cause: 'Custom input unsupported' };
        }
        
        // Translation to underlying schema
        const nativeRequest = {
            questions: [{
                id: canonicalRequest.requestId || 'q1',
                question: canonicalRequest.question,
                options: canonicalRequest.options ? canonicalRequest.options.map(opt => ({ label: opt })) : undefined
            }]
        };
        
        try {
            const nativeResult = nativeToolMock.execute(nativeRequest);
            if (nativeResult.status === 'OFFLINE') {
                return { state: 'UNAVAILABLE' };
            }
            if (nativeResult.status === 'ERROR') {
                return { state: 'FAILED', cause: nativeResult.error };
            }
            // Translation to Canonical Answer
            return { state: 'ANSWERED', answer: nativeResult.data.answers[0].selected[0] };
        } catch (e) {
            return { state: 'FAILED', cause: e.message };
        }
    };
}

// --- Test Harness ---
let evidenceLog = [];
let outputChannel = [];
const mockEnv = {
    recordEvidence: (ev) => evidenceLog.push(ev),
    emitVisibleChannel: (msg) => outputChannel.push(msg),
    reset: () => { evidenceLog = []; outputChannel = []; }
};

console.log("Running T1 — ANSWERED");
mockEnv.reset();
const adapterT1 = createMockAdapter({
    execute: (req) => ({ status: 'SUCCESS', data: { answers: [{ id: req.questions[0].id, selected: ['Option B'] }] } })
});
const resT1 = executeCapability({ question: "A or B?", options: ["Option A", "Option B"] }, adapterT1, mockEnv);
assert.strictEqual(resT1.status, 'CONTINUE');
assert.strictEqual(resT1.answer, 'Option B');

console.log("Running T2 — UNAVAILABLE");
mockEnv.reset();
const adapterT2 = createMockAdapter({
    execute: () => ({ status: 'OFFLINE' })
});
const resT2 = executeCapability({ question: "Are you there?" }, adapterT2, mockEnv);
assert.strictEqual(resT2.status, 'BLOCKED');
assert.strictEqual(resT2.substate, 'WAITING_USER');
assert.strictEqual(evidenceLog.length, 1);
assert.strictEqual(evidenceLog[0].reason, 'UNAVAILABLE');
assert.strictEqual(outputChannel.length, 1);
assert.strictEqual(outputChannel[0], '[FALLBACK QUESTION]: Are you there?');

console.log("Running T3 — FAILED");
mockEnv.reset();
const adapterT3 = createMockAdapter({
    execute: () => ({ status: 'ERROR', error: 'Timeout' })
});
const resT3 = executeCapability({ question: "Timeout test" }, adapterT3, mockEnv);
assert.strictEqual(resT3.status, 'FAILED');
assert.strictEqual(resT3.cause, 'Timeout');
assert.strictEqual(evidenceLog.length, 1);
assert.strictEqual(evidenceLog[0].cause, 'Timeout');
assert.strictEqual(outputChannel.length, 0);

console.log("Running T4 — Schema Translation");
mockEnv.reset();
let capturedNativeRequest = null;
const adapterT4 = createMockAdapter({
    execute: (req) => {
        capturedNativeRequest = req;
        return { status: 'SUCCESS', data: { answers: [{ id: 'test', selected: ['Yes'] }] } };
    }
});
executeCapability({ question: "Proceed?", options: ["Yes", "No"], requestId: "test" }, adapterT4, mockEnv);
assert.deepStrictEqual(capturedNativeRequest, {
    questions: [{
        id: 'test',
        question: 'Proceed?',
        options: [{ label: 'Yes' }, { label: 'No' }]
    }]
});

console.log("Running T5 — Unsupported Representation");
mockEnv.reset();
const adapterT5 = createMockAdapter({ maxOptions: 3 });
const resT5 = executeCapability({ question: "Too many options", options: ["1", "2", "3", "4", "5", "6"] }, adapterT5, mockEnv);
assert.strictEqual(resT5.status, 'FAILED');
assert.strictEqual(resT5.cause, 'Constraint exceeded');

console.log("All contract tests PASSED.");

console.log("Running T6 — Custom Input Unsupported");
mockEnv.reset();
const adapterT6 = createMockAdapter({
    supportsCustom: false,
    execute: (req) => {
        return { status: 'SUCCESS', data: { answers: [{ id: 'test', selected: ['Yes'] }] } };
    }
});
const resT6 = executeCapability({ question: "Custom?", options: ["A"], allowCustom: true, requestId: "test" }, adapterT6, mockEnv);
assert.strictEqual(resT6.status, 'FAILED');
assert.strictEqual(resT6.cause, 'Custom input unsupported');
console.log("All contract tests PASSED (including T6).");
