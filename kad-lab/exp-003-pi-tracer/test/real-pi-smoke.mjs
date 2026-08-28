import { appendFileSync } from 'node:fs';

const output = process.env.KAD_PI_SMOKE_OUTPUT;

export default function realPiSmoke(pi) {
  pi.on('input', (event) => {
    if (event.text !== 'kad-real-pi-smoke') return { action: 'continue' };
    appendFileSync(output, `${JSON.stringify({ kind: 'pi_input_callback', text: event.text, source: event.source })}\n`);
    return { action: 'handled' };
  });
}
