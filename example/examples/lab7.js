import { EventChannel, Subject } from 'generators-lib';

function example1_eventChannel() {
    console.log('\n=== Example 1: EventChannel ===');

    const channel = new EventChannel();

    const sub1 = channel.subscribe('data', val => {
        console.log('  [Listener 1] received:', val);
        throw new Error('Listener 1 is broken!');
    });

    channel.subscribe('data', val => {
        console.log('  [Listener 2] received:', val);
    });

    channel.subscribe('data', val => {
        console.log('  [Listener 3] received:', val);
    });

    channel.subscribe('listenerError', (err, event) => {
        console.log(`  [listenerError] event="${event}": ${err.message}`);
    });

    channel.emit('data', 'hello');

    sub1.unsubscribe();
    console.log('\n  --- after unsubscribing Listener 1 ---');
    channel.emit('data', 'world');
}

function example2_errorChannel() {
    console.log('\n=== Example 2: EventChannel error channel ===');

    const channel = new EventChannel();

    channel.subscribe('error', err => console.log('  [error listener] caught:', err.message));
    channel.emit('error', new Error('something went wrong'));

    const bare = new EventChannel();
    try {
        bare.emit('error', new Error('nobody listening'));
    } catch (err) {
        console.log('  No error listener → re-thrown:', err.message);
    }
}

async function example3_subject() {
    console.log('\n=== Example 3: Subject — reactive push ===');

    const subject = new Subject();
    const log     = [];

    const subA = subject.subscribe({
        next:     val => log.push(`A:${val}`),
        error:    err => log.push(`A:err:${err.message}`),
        complete: ()  => log.push('A:done'),
    });

    const subB = subject.subscribe({
        next: val => {
            log.push(`B:${val}`);
            if (val === 3) throw new Error('B dislikes 3');
        },
        complete: () => log.push('B:done'),
    });

    const subC = subject.subscribe(val => log.push(`C:${val}`));

    subject.next(1);
    subject.next(2);
    subject.next(3);

    subB.unsubscribe();
    subject.next(4);

    subject.complete();

    console.log('  Event log:', log.join(', '));
    console.log('  Expected : A:1, B:1, C:1, A:2, B:2, C:2, A:3, B:3, C:3, A:4, C:4, A:done');
}

function example4_subjectError() {
    console.log('\n=== Example 4: Subject error channel ===');

    const s = new Subject();
    s.subscribe({ next: v => console.log('  got:', v), error: e => console.log('  error:', e.message) });
    s.next(42);
    s.error(new Error('stream failed'));

    const s2 = new Subject();
    s2.subscribe({ next: v => console.log('  s2 got:', v) });
    try {
        s2.error(new Error('unhandled stream error'));
    } catch (err) {
        console.log('  No error handler → re-thrown:', err.message);
    }
}

(async () => {
    example1_eventChannel();
    example2_errorChannel();
    await example3_subject();
    example4_subjectError();
    console.log('\nDone.\n');
})().catch(err => { console.error(err); process.exit(1); });
