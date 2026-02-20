async function trigger() {
    const sessionId = 'd9a6cfe8-f21d-422d-b850-4ef6614c610f';
    console.log('Triggering analysis for:', sessionId);
    try {
        const res = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        const data = await res.json();
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}
trigger();
